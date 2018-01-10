'use strict';

var _ = require('lodash');

var config = require('../config');
var main = require('../../../main');

module.exports = {
    /**
     * Initialize repository at provided path.
     *
     * @param {String} repositoryPath
     *
     * @returns {Promise}
     */
    init: function (repositoryPath) {
        var command = 'cd ' + repositoryPath + ' && ' + config.bin('git') + ' init';
        return main.shipit.remote(command);
    },
    /**
     *
     * Add or update url to remote repository in provided repository.
     *
     * @param {String} repositoryPath
     * @param {String} repositoryUrl
     *
     * @returns {Promise}
     */
    addRemote: function (repositoryPath, repositoryUrl) {
        var command = 'cd ' + repositoryPath + ' && ' + config.bin('git') + ' remote';
        return main.shipit.remote(command)
            .then(function (results) {
                var method = isRemoteAlreadyDefined(results) ? 'set-url' : 'add';
                var commands = [
                    'cd ' + repositoryPath,
                    config.bin('git') + ' remote ' + method + ' shipit ' + repositoryUrl
                ];

                return main.shipit.remote(commands.join(' && '));


                function isRemoteAlreadyDefined(results) {
                    var answers = results.map(function (result) {
                        var remotes = result.stdout ? result.stdout.split(/\s/) : [];

                        return remotes.indexOf('shipit') !== -1;
                    });

                    if (!equalValues(answers)) {
                        throw new Error('Remote server are not synced.');
                    }

                    return answers[0];
                }
            });
    },
    /**
     * @param {String} repositoryPath
     * @param {Boolean} shallow
     *
     * @return {Promise}
     */
    fetch: function (repositoryPath, shallow) {
        var options = (shallow ? ' --depth=1 ' : ' ') + 'shipit -p';
        var command = 'cd ' + repositoryPath + ' && ' + config.bin('git') + ' fetch' + options;

        return main.shipit.remote(command);
    },
    /**
     *
     * @param {String} repositoryPath
     * @param {String} commitOrBranch
     *
     * @return {Promise}
     */
    checkout: function (repositoryPath, commitOrBranch) {
        var command = 'cd ' + repositoryPath + ' && ' + config.bin('git') + ' checkout ' + commitOrBranch;
        return main.shipit.remote(command);
    },
    /**
     *
     * @param {String} repositoryPath
     * @param {String} branch
     *
     * @return {Promise}
     */
    isBranch: function (repositoryPath, branch) {
        var command = 'cd ' + repositoryPath + ' && ' + config.bin('git') + ' branch';
        return main.shipit.remote(command)
            .then(function (results) {
                var branches = results.map(function (result) {
                    var lines = result.stdout.split("\n");
                    return lines.map(function (line) {
                        return line.replace(/[\s*]/g, '');
                    });
                });

                if (!equalValues(branches)) {
                    throw new Error('Remote server are not synced.');
                }

                return branches[0].indexOf(branch) !== -1;
            });
    },
    /**
     *
     * @param {String} repositoryPath
     * @param {String} branch
     *
     * @return {Promise}
     */
    mergeOrigin: function (repositoryPath, branch) {
        var command = 'cd ' + repositoryPath + ' && ' + config.bin('git') + ' merge shipit/' + branch;
        return main.shipit.remote(command);
    }
};

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
