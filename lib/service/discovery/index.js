'use strict';

var main = require('../../../main');
var bluebird = require('bluebird');
var path = require('path2/posix');
var prompt = require('prompt');

var discoveryService = module.exports = {};

discoveryService.getDeployTo = require('./deployToDirectory');
discoveryService.getReleasesDirectory = require('./releasesDirectory');
discoveryService.getRemoteCopyDirectory = require('./remoteCache');
discoveryService.getSharedDirectory = require('./sharedDirectory');
discoveryService.getCurrentLink = require('./currentLink');

discoveryService.getReleasesList = require('./releaseList');
discoveryService.getCurrentRelease = require('./currentRelease');
discoveryService.getPreviousRelease = require('./previousRelease');
discoveryService.getNewRelease = require('./newRelease');

/**
 * Get directory on server that is considered as a working directory for scripts that need to be executed in project
 * source directory. It discover paths on servers where deployment was executed and also on vagrant. It ask user
 * in case if discovery process failed.
 *
 * @return {bluebird}
 */
discoveryService.getWorkingDirectory = require('./workingDirectory');
