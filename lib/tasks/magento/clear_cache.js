'use strict';

var chalk = require('chalk');
var commands = require('../../service/commands');

module.exports = function (shipit) {

    shipit.blTask('magento:clear_system_cache', function () {
        return commands.magento.clearMagentoCache()
            .then(function () {
                shipit.log(chalk.green('Cleaned Magento Cache !'));
            })
            .catch(function () {
                shipit.log(chalk.red('Failed execution of cache cleaning !'));
            });
    });
    shipit.blTask('magento:clear_all_cache', function () {
        return commands.magento.clearAllCache()
            .then(function () {
                shipit.log(chalk.green('Cleaned Cache Storage !'));
            })
            .catch(function () {
                shipit.log(chalk.red('Failed execution of cache cleaning !'));
            });
    });
};
