'use strict';

var chalk = require('chalk');

module.exports = function (shipit) {
    shipit.blTask('ssh:access-check', function () {
        return shipit.remote('ssh -T git@bitbucket.org');
    });

    shipit.blTask('ssh-access-check', ['ssh:access-check'], function () {
        var message = 'This task is deprecated and could be removed in future. Please use directly "ssh:access-check"';
        shipit.log(chalk.yellow(message));
    });
};
