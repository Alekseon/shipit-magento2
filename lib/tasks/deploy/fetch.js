"use strict";

var chalk = require('chalk');

var discovery = require('../../service/discovery');
var config = require('../../service/config');
var commands = require('../../service/commands');

/**
 * Fetch task.
 * - Create workspace.
 * - Fetch repository.
 * - Checkout commit-ish.
 */
module.exports = function (shipit) {
    shipit.blTask('deploy:fetch', function () {

        return discovery.getRemoteCopyDirectory()
            .then(function (remoteCacheDir) {
                return createWorkspace()
                    .then(initRepository)
                    .then(addRemote)
                    .then(fetch)
                    .then(checkout)
                    .then(merge)
                    .then(function () {
                        shipit.emit('fetched');
                    });

                /**
                 * Create workspace.
                 */
                function createWorkspace() {
                    if (config.isShallowClone()) {
                        return commands.remove(remoteCacheDir)
                            .tap(function () {
                                shipit.log('Removed existing remote cache "%s"', remoteCacheDir);
                            })
                            .then(create);
                    } else {
                        return commands.pathExists(remoteCacheDir)
                            .then(function () {
                                shipit.log(chalk.green('Remote cache directory already exists.'));
                            })
                            .catch(create);
                    }

                    function create() {
                        return commands.createDirectory(remoteCacheDir)
                            .tap(function () {
                                shipit.log(chalk.green('Remote cache "%s" directory created.'), remoteCacheDir);
                            });
                    }
                }

                /**
                 * Initialize repository.
                 */
                function initRepository() {
                    shipit.log('Initialize remote copy of repository in "%s"', remoteCacheDir);
                    return commands.git.init(remoteCacheDir)
                        .then(function () {
                            shipit.log(chalk.green('Repository initialized.'));
                        });
                }

                /**
                 * Add remote.
                 */
                function addRemote() {
                    var repositoryUrl = config.getRepositoryUrl();
                    return commands.git.addRemote(remoteCacheDir, repositoryUrl)
                        .then(function () {
                            shipit.log(chalk.green('Remote "shipit" point to "%s" repository.'), repositoryUrl);
                        });
                }

                /**
                 * Fetch repository.
                 */
                function fetch() {
                    var timer = setInterval(function () {
                        console.log('Working...');
                    }, 5000);
                    shipit.log('Fetching changes in repository "%s"', remoteCacheDir);
                    return commands.git.fetch(remoteCacheDir, config.isShallowClone())
                        .finally(function () {
                            clearInterval(timer);
                        })
                        .tap(function () {
                            shipit.log(chalk.green('Repository fetched.'));
                        });

                }

                /**
                 * Checkout commit-ish.
                 */
                function checkout() {
                    var branchOrCommit = config.getBranch();
                    return commands.git.checkout(remoteCacheDir, branchOrCommit)
                        .tap(function () {
                            shipit.log('Checked out commit-ish "%s"', branchOrCommit);
                        });
                }

                /**
                 * Merge branch.
                 */
                function merge() {
                    var branchOrCommit = config.getBranch();
                    shipit.log('Testing if commit-ish is a branch.');

                    return commands.git.isBranch(remoteCacheDir, branchOrCommit)
                        .then(function (isBranch) {
                            if (isBranch) {
                                shipit.log('Commit-ish is a branch, merging...');
                                return commands.git.mergeOrigin(remoteCacheDir, branchOrCommit)
                                    .then(function () {
                                        shipit.log(chalk.green('Branch merged.'));
                                    });
                            } else {
                                shipit.log(chalk.green('Commit-ish is not a branch, merge is not necessary.'));
                            }
                        });
                }
            });
    });
};
