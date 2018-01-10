'use strict';

var bluebird = require('bluebird');
var path = require('path2/posix');
var prompt = require('prompt');
var actionConstants = require('../actions/constants');
var actions = require('../actions');
var config = require('../config');
var discovery = require('../discovery');
var commands = require('../commands');
var main = require('../../../main');

var workingDir = null;
var projectPath = config.getProjectPath();

/**
 * When context of publication server changed then working directory also probably changed.
 */
main.shipit.on(actionConstants.RELEASE_CREATED, function (payload) {
    workingDir = bluebird.resolve(path.join(payload.releasePath, projectPath));
});

main.shipit.on(actionConstants.RELEASE_ROLLEDBACK, function (payload) {
    workingDir = bluebird.resolve(path.join(payload.releasePath, projectPath));
});

module.exports = function () {
    if (workingDir === null) {
        workingDir = bluebird.join(
            discovery.getReleasesDirectory(),
            discovery.getCurrentRelease(),
            function (releasesDirectory, currentRelease) {
                return path.join(releasesDirectory, currentRelease, projectPath);
            }
        ).catch(function () {
            return discovery.getDeployTo()
                .then(function (deployTo) {
                    var source = path.join(deployTo, projectPath);
                    return commands.pathExists(source);
                });
        }).catch(function () {
            var userInputPromise = new bluebird(function (resolve, reject) {
                var desc = [
                    'Automatic discovery of path failed !',
                    'Provide absolute path to main project directory.',
                    'E.g. /www/custom/project-name/html'
                ].join(' ');

                var schema = {
                    name: 'path',
                    description: desc,
                    type: 'string',
                    required: true
                };

                prompt.start();
                prompt.get(schema, function (err, result) {
                    if (err) {
                        reject();
                    } else {
                        resolve(result.path);
                    }
                });
            });

            userInputPromise.then(function (userPath) {
                return commands.pathExists(userPath);
            });

            return userInputPromise;
        });
    }

    return workingDir;
};
