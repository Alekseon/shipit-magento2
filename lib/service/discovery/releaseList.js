'use strict';

var bluebird = require('bluebird');

var discovery = require('../discovery');
var commands = require('../commands');
var actionConstants = require('../actions/constants');
var actions = require('../actions');

var main = require('../../../main');

var releaseList = null;

main.shipit.on(actionConstants.RELEASE_PUBLISHED, function () {
    releaseList = null;
});

main.shipit.on(actionConstants.RELEASE_ROLLEDBACK, function () {
    releaseList = null;
});

/**
 * Promise array of releases ordered from newest to oldest.
 *
 * @returns {Promise}
 */
module.exports = function () {
    if (releaseList === null) {
        releaseList = discovery.getReleasesDirectory()
            .then(function (releasesPath) {
                return  commands.listDirectory(releasesPath);
            });
    }

    return releaseList;
};
