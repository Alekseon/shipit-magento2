'use strict';

var discovery = require('../discovery');
var config = require('../config');
var main = require('../../../main');
var shipit = main.shipit;

module.exports = {

    /**
     * Run composer install.
     */
    runComposer: function () {
        return discovery.getWorkingDirectory()
            .then(function (workingDirectory) {

                var commands = [
                    'cd ' + workingDirectory,
                    'composer install'
                ];
                return shipit.remote(commands.join(' && '));
            });
    },

    deployStaticContent: function () {
        return discovery.getWorkingDirectory()
            .then(function (workingDirectory) {

                var commands = [
                    'cd ' + workingDirectory,
                    'bin/magento setup:di:compile',
                    'bin/magento setup:static-content:deploy en_US -f',
                    'bin/magento maintenance:enable'
                ];
                return shipit.remote(commands.join(' && '));
            });
    },

    runSetupUpgrade: function () {
        return discovery.getWorkingDirectory()
            .then(function (workingDirectory) {

                var commands = [
                    'cd ' + workingDirectory,
                    'bin/magento setup:upgrade --keep-generated'
                ];
                return shipit.remote(commands.join(' && ')).catch(function(){});
            });
    },

    flushCache: function () {
        return discovery.getWorkingDirectory()
            .then(function (workingDirectory) {

                var commands = [
                    'cd ' + workingDirectory,
                    'bin/magento cache:flush'
                ];
                return shipit.remote(commands.join(' && ')).catch(function(){});
            });
    },

    disableMaintenance: function () {
        return discovery.getWorkingDirectory()
            .then(function (workingDirectory) {

                var commands = [
                    'cd ' + workingDirectory,
                    'bin/magento maintenance:disable'
                ];
                return shipit.remote(commands.join(' && ')).catch(function(){});
            });
    },
};
