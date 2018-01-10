'use strict';

var Bluebird = require('bluebird');
var chalk = require('chalk');

var actions = require('../../service/actions');
var config = require('../../service/config');
var commands = require('../../service/commands');

var scripts = [];

var deployTask = module.exports = function (shipit) {
    require('./fetch')(shipit);

    if (config.shouldRunComposer()) {
        deployTask.appendConfigurationScript(commands.magento.runComposer);
    }

    if (config.shouldDeployStaticContent()) {
        deployTask.appendConfigurationScript(commands.magento.deployStaticContent);
    }

    shipit.blTask('deploy', ['deploy:fetch'], function () {
        return actions.createRelease()
            .then(function () {
                var promise = scripts.reduce(function (current, next) {
                    return current.then(next);
                }, Bluebird.resolve());

                return promise.catch(function () {
                    var message = 'Failed scripts, but going to publish anyway. ' +
                        'Please execute them manually on server.';
                    console.log(chalk.yellow(message));
                });
            })
            .then(actions.setupSharedDirectory)
            .tap(function () {
                shipit.log(chalk.green('Prepared directories in shared dir.'));
            })
            .then(actions.setupNewRelease)
            .tap(function () {
                shipit.log(chalk.green('Finished preparing of new release.'));
            })
            .then(actions.publishRelease)
            .then(actions.setupUpgrade)
            .then(actions.flushCache)
            .then(actions.disableMaintenance)
            .then(actions.cleanOldReleases)
            .catch(function (error) {
                shipit.log(chalk.red('Failed preparation of new release. Reason: "%s"'), error.message);
            });
    });
};

/**
 * Function allowing project configuration to add any custom scripts to be executed
 * after default scripts (clear cache, installers).
 *
 * @param {Function} script
 */
deployTask.appendConfigurationScript = function (script) {
    scripts.push(script);
};

/**
 * Function allowing project configuration to add any custom scripts to be executed
 * before default scripts (clear cache, installers).
 *
 * @param {Function} script
 */
deployTask.prependConfigurationScript = function (script) {
    scripts.unshift(script);
};
