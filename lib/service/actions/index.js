'use strict';

var discovery = require('../discovery');
var commands = require('../commands');
var config = require('../config');
var main = require('../../../main');

var moment = require('moment');
var path = require('path2/posix');
var bluebird = require('bluebird');
var chalk = require('chalk');

var constants = require('./constants');
var actions = module.exports = {};


/**
 *  Create empty directories in shared directory that will be linked to release or will contain linked files.
 *
 *  @type {Function}
 */
actions.setupSharedDirectory = require('./setup');

/**
 *  Create new release directory. Return promise resolved to directory name of new release.
 */
actions.createRelease = function () {
    return discovery.getReleasesDirectory()
        .then(function (releasesPath) {
            var releaseDirname = moment.utc().format('YYYYMMDDHHmmss');
            var newReleasePath = path.join(releasesPath, releaseDirname);
            return commands.createDirectory(newReleasePath)
                .then(discovery.getRemoteCopyDirectory)
                .then(function (remoteCopy) {
                    return commands.rsync(remoteCopy, newReleasePath, config.getIgnored());
                })
                .tap(function () {
                    main.shipit.log(chalk.green('Created new not published release "%s".'), releaseDirname);
                })
                .tap(function () {
                    main.shipit.emit(constants.RELEASE_CREATED, {
                        releasePath: newReleasePath
                    });
                });
        });
};

/**
 * Link shared files and directories, update staged files and execute registered
 * callbacks for project (Like Clear Cache or Installers).
 */
actions.setupNewRelease = require('./finalize');

/**
 * When new release exists it will update current link to point to it.
 */
actions.publishRelease = function () {
    var projectPath = config.getProjectPath();
    return bluebird.join(discovery.getCurrentLink(), discovery.getNewRelease(),
        function (currentLink, newReleasePath) {
            var sourcePath = path.join(newReleasePath, projectPath);
            return commands.link(sourcePath, currentLink)
                .tap(function () {
                    main.shipit.log(chalk.green('Current link points to "%s", release published.'), sourcePath);
                })
                .tap(function () {
                    main.shipit.emit(constants.RELEASE_PUBLISHED);
                });
        });
};

actions.setupUpgrade = function () {
    return commands.magento.runSetupUpgrade()
    .tap(function () {
        main.shipit.log(chalk.green('Setup Uprade Done!'));
    })
}

actions.flushCache = function () {
    return commands.magento.flushCache()
    .tap(function () {
        main.shipit.log(chalk.green('Cache flushed!'));
    })
}

actions.disableMaintenance = function () {
    return commands.magento.disableMaintenance()
    .tap(function () {
        main.shipit.log(chalk.green('Maintenanace mode disabled!'));
    })
}

/**
 * Remove old releases keeping only X newest releases. Where X is provided in configuration.
 */
actions.cleanOldReleases = function () {
    var keepReleases = config.getMaxReleases();
    return discovery.getReleasesDirectory()
        .then(function (releasesPath) {
            return commands.removeOldest(releasesPath, keepReleases);
        })
        .tap(function () {
            main.shipit.log(chalk.green('Kept last %s releases.'), keepReleases);
        });
};

/**
 * Remove current release and update current link to point to previous release.
 */
actions.rollbackRelease = function () {
    return bluebird.join(
        discovery.getCurrentLink(),
        discovery.getReleasesDirectory(),
        discovery.getCurrentRelease(),
        discovery.getPreviousRelease(),
        function (currentLink, releasesDirectory, currentRelease, previousRelease) {
            var currentPath = path.join(releasesDirectory, currentRelease);
            var previousPath = path.join(releasesDirectory, previousRelease);
            var projectPath = config.getProjectPath();

            return commands.link(path.join(previousPath, projectPath), currentLink)
                .tap(function () {
                    main.shipit.log(chalk.green('Rolled back release "%s" to "%s"'), currentRelease, previousRelease);
                })
                .tap(function () {
                    main.shipit.emit(constants.RELEASE_ROLLEDBACK, {
                        releasePath: previousPath
                    });
                })
                .then(function () {
                    return commands.remove(currentPath);
                })
                .tap(function () {
                    main.shipit.log(chalk.green('Removed rolled back release directory "%s"'), currentRelease);
                });
        });
};
