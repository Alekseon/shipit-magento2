'use strict';

var Bluebird = require('bluebird');
var path = require('path2/posix');
var _ = require('lodash');
var chalk = require('chalk');
var main = require('../../../main');
var shipit = main.shipit;

var discovery = require('../discovery');
var commandsService = require('../commands');
var config = require('../config');

var action = function () {
    var directories = config.getLinkedDirectories();
    var files = config.getLinkedFiles();
    var stagedFiles = config.getStagedFiles();
    var projectPath = config.getProjectPath();

    return Bluebird.join(
        discovery.getSharedDirectory(),
        discovery.getNewRelease(),
        function (sharedPath, releasePath) {
            return commandsService.createDirectory(sharedPath)
                .then(function () {
                    return commandsService.allowServerWrite(releasePath);
                })
                .then(function () {
                    var commands = [];

                    _.forEach(stagedFiles, function (targetFile, stagedFilePattern) {
                        var pattern = /\{stage\}/g;
                        var sourceFileName = stagedFilePattern.replace(pattern, shipit.environment);
                        var sourceFile = path.join(releasePath, projectPath, sourceFileName);
                        var targetFilePath = path.join(releasePath, projectPath, targetFile);
                        var filePathGlob = path.join(releasePath, projectPath, stagedFilePattern.replace(pattern, '*'));

                        commands.push(updateStagedFile(targetFilePath, sourceFile, filePathGlob));
                    });

                    _.forEach(directories, function (directory) {
                        var directoryPath = path.join(releasePath, projectPath, directory);
                        var sharedDirPath = path.join(sharedPath, directory);

                        commands.push(linkPath(directoryPath, sharedDirPath));
                    });

                    _.forEach(files, function (file) {
                        var filePath = path.join(releasePath, projectPath, file);
                        var sharedFilePath = path.join(sharedPath, file);

                        commands.push(linkPath(filePath, sharedFilePath));
                    });

                    return commandsService.parallelize(commands);
                });
        }
    );

    /**
     * @param {String} path
     * @param {String} sharedPath
     *
     * @returns {Function}
     */
    function linkPath(path, sharedPath) {
        return function () {
            return commandsService.pathExists(sharedPath)
                .catch(function () {
                    return commandsService.copy(path, sharedPath);
                })
                .catch(function (error) {
                    shipit.log(
                        chalk.yellow('We were unable to copy "%s" to shared path "%s".'),
                        path,
                        sharedPath
                    );
                    throw error;
                })
                .then(function () {
                    return commandsService.link(sharedPath, path);
                })
                .catch(function () {
                    shipit.log(chalk.red('Linking shared path "%s" failed.'), sharedPath);
                });
        };
    }

    /**
     * Replace staged file and remove any staged files from server (For security reasons).
     *
     * @param {String} targetFilePath
     * @param {String} sourceFile
     * @param {String} removePathGlob
     *
     * @returns {Function}
     */
    function updateStagedFile(targetFilePath, sourceFile, removePathGlob) {
        var condition = '[ -f ' + sourceFile + ' ]';
        var command = 'cp -f ' + sourceFile + ' ' + targetFilePath;
        return function () {
            return shipit.remote(condition + ' && ' + command)
                .catch(function () {
                    shipit.log(
                        chalk.red('Missing staged file "%s" and we were unable to refresh file for stage.'),
                        sourceFile
                    );
                })
                .then(function () {
                    return commandsService.remove(removePathGlob);
                })
                .tap(function () {
                    shipit.log(
                        chalk.green('Removed files matching glob pattern "%s".'), removePathGlob
                    );
                });
        };
    }
};

module.exports = action;
