'use strict';

var chalk = require('chalk');

var actions = require('../service/actions');

module.exports = function (shipit) {
    shipit.blTask('rollback', function () {
        return actions.rollbackRelease()
            .catch(function (error) {
                shipit.log(chalk.red(error.message));
            });
    });
};
