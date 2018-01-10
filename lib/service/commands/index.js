'use strict';

var main = require('../../../main');
var config = require('../config');

var _ = require('lodash');
var bluebird = require('bluebird');
var path = require('path2/posix');

var CommandsService = module.exports = {};

CommandsService.git = require('./git');
CommandsService.magento = require('./magento');
/**
 * Check if path exists on server. If exists then promise resolve to this path.
 *
 * @param {String} path
 * @returns {Promise}
 */
CommandsService.pathExists = function (path) {
    return main.shipit.remote('[ -e ' + path + ' ]')
        .then(function () {
            return path;
        })
        .catch(function () {
            throw new Error('Path ' + path + ' does not exists.');
        });
};

/**
 * List directory and resolve promise as a array.
 *
 * @param {String} directory
 * @returns {Promise}
 */
CommandsService.listDirectory = function (directory) {
    return main.shipit.remote('ls -r1 ' + directory)
        .then(function (results) {
            var files = results.map(function (result) {
                if (!result.stdout) {
                    return null;
                }

                var dirs = result.stdout.replace(/\n$/, '');
                return dirs.split('\n');
            });

            if (!equalValues(files)) {
                throw new Error('Servers in different states.');
            } else {
                return files[0];
            }
        });
};
/**
 * Configure provided "path" to be writable by group of web server found in configuration.
 *
 * @param {String} path
 *
 * @return {Promise}
 */
CommandsService.allowServerWrite = function (path) {
    return main.shipit.remote('chmod -R g+w ' + path)
        .then(function () {
            var group = config.getGroup();
            return main.shipit.remote('chgrp -R ' + group + ' ' + path);
        });
};
/**
 * If not exist create directory on target server.
 * In case when directory already exists and is link do nothing.
 *
 * @param {String} directory
 * @returns {Promise}
 */
CommandsService.createDirectory = function (directory) {
    return main.shipit.remote('[ -h ' + directory + ' ] || mkdir -p ' + directory);
};
/**
 * Remove provided path on target server.
 *
 * @param {String} path
 *
 * @return {Promise}
 */
CommandsService.remove = function (path) {
    return main.shipit.remote('rm -rf ' + path);
};
/**
 * @param {Array<Function>} commands
 * @returns {Promise}
 */
CommandsService.parallelize = function (commands) {
    var threads = config.maxConcurrentCommands();
    if (threads === 1) {
        return commands.reduce(function (current, next) {
            return current.then(next);
        }, bluebird.resolve());
    } else {
        return prepare(commands).reduce(function (current, next) {
            return current.then(function () {
                var promises = [];
                _.forEach(next, function (command) {
                    promises.push(command());
                });

                return bluebird.all(promises);
            });
        }, bluebird.resolve());
    }

    /**
     * @param {Array<Function>} commands
     * @returns {Array}
     */
    function prepare(commands) {
        var i, chunks = [];

        for (i = 0; i < commands.length; i += threads) {
            chunks.push(commands.slice(i, i + threads));
        }

        return chunks;
    }
};
/**
 *
 * @param {String} sourcePath
 * @param {String} linkPath
 *
 * @retunr {Promise}
 */
CommandsService.link = function (sourcePath, linkPath) {
    var command = [
        'rm -rf ' + linkPath,
        'ln -s ' + sourcePath + ' ' + linkPath
    ];

    return main.shipit.remote(command.join(' && '));
};
/**
 * Attempt to copy "sourcePath" as "targetPath".
 *
 * @param {String} sourcePath
 * @param {String} targetPath
 *
 * @returns {Promise}
 */
CommandsService.copy = function (sourcePath, targetPath) {
    var copyCommand = 'cp -r ' + sourcePath + ' ' + targetPath;
    return CommandsService.pathExists(sourcePath)
        .then(function () {
            return main.shipit.remote(copyCommand);
        });
};
/**
 * Read link on server.
 *
 * @param {String} linkPath
 *
 * @return {Promise}
 */
CommandsService.readLink = function (linkPath) {
    var command = "ls -ld " + linkPath + " | sed 's/.*-> //'";
    return main.shipit.remote(command)
        .catch(function () {
            throw new Error('Unable to read link: "' + linkPath + '", command failed.');
        })
        .then(function (results) {
            var linkTarget;
            var linkTargets = results.map(function (result) {
                if (!result.stdout) {
                    return null;
                }

                return result.stdout.replace(/\n$/, '');
            });

            if (!equalValues(linkTargets)) {
                throw new Error('Servers in different states.');
            } else {
                linkTarget = linkTargets[0];
                if (linkTarget !== null) {
                    return linkTarget;
                } else {
                    throw new Error('Unable to read link: "' + linkPath + '".');
                }
            }
        });
};
/**
 * Execute rsync command on remote server.
 *
 * @param {String} from
 * @param {String} target
 * @param {Array<String>} ignore
 *
 * @return {Promise}
 */
CommandsService.rsync = function (from, target, ignore) {
    var excludes = ignore ? formatExcludes(ignore) : [];
    var command = [config.bin('rsync')].concat(['-lrpt']).concat(excludes).concat([from + '/', target]);

    return main.shipit.remote(command.join(' ') + ' && touch ' + target);
};

/**
 * Remove all files/directories from select directory expect X last (alphabetically oldest) entries.
 *
 * @param {String} directory
 * @param {Number} keepEntries
 *
 * @returns {Promise}
 */
CommandsService.removeOldest = function (directory, keepEntries) {
    var lastEntries = 'ls -rd ' + directory + '/*|head -n ' + keepEntries;
    var command = '(' + lastEntries + ';ls -d ' + directory + '/*)|sort|uniq -u|xargs rm -rf';

    return main.shipit.remote(command);
};

/**
 *
 * @param {Array<String>} excludes
 * @returns {Array}
 */
function formatExcludes(excludes) {
    return excludes.reduce(function (prev, current) {
        return prev.concat(['--exclude', '"' + current + '"']);
    }, []);
}

/**
 * Test if all values are equal.
 *
 * @param {*[]} values
 * @returns {boolean}
 */

function equalValues(values) {
    return values.every(function (value) {
        return _.isEqual(value, values[0]);
    });
}
