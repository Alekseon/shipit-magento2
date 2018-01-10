'use strict';

var chalk = require('chalk');
var commands = require('../../service/commands');

module.exports = function (shipit) {

    shipit.blTask('magento:indexer', function () {
        return commands.magento.indexRefresh()
            .then(function () {
                shipit.log(chalk.green('Magento indexes refreshed !'));
            })
            .catch(function () {
                shipit.log(chalk.red('Failed execution index refresh tool !'));
            });
    });
};
