'use strict';

var yargs = require('yargs').argv;
var Bluebird = require('bluebird');
var prompt = require('prompt');
var chalk = require('chalk');
var prettyTime = require('pretty-hrtime');

var app = {
    /**
     * Initialize deployment app.
     *
     * @param {Shipit} shipit
     * @param {Hash} stages
     */
    initialize: function (shipit, stages) {
        this.shipit = shipit;
        var isProtected = false;
        var startTime;

        if (stages[shipit.environment] !== undefined) {
            isProtected = stages[shipit.environment].isProtected || false;
        }

        shipit.run = shipit.start;
        shipit.start = function (tasks) {
            var executeTasks = function () {
                    startTime = process.hrtime();
                    shipit.run(tasks);
                },
                schema = {
                    name: 'confirm',
                    message: 'You are about to run task on protected stage, proceed ?',
                    validator: /Y(es)?|N(o)?/i,
                    warning: 'Enter Yes or No',
                    default: 'No'
                };

            if (isProtected) {
                prompt.start();
                prompt.get(schema, function (err, result) {
                    if (/[Yy](es)?/.test(result.confirm)) {
                        executeTasks();
                    } else {
                        shipit.log(chalk.yellow('Aborted action on protected stage.'));
                    }
                });
            } else {
                executeTasks();
            }
        };

        var overwriteBranch = yargs.branch;
        if (overwriteBranch) {
            stages[shipit.options.environment].branch = overwriteBranch;
        }
        shipit.initConfig(stages);

        shipit.on('stop', function () {
            var finishTime = process.hrtime(startTime);
            console.log(chalk.blue("\nFinished everything after: %s"), prettyTime(finishTime));
        });

        var remoteOriginal = shipit.remote;
        shipit.remote = function () {
            return Bluebird.resolve(remoteOriginal.apply(shipit, arguments));
        };
    },

    /**
     * Load all required tasks and events.
     */
    loadTasks: function () {
        require('./lib')(this.shipit);
    }
};

module.exports = app;
