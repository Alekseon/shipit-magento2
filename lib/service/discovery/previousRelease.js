'use strict';

var bluebird = require('bluebird');

var discovery = require('../discovery');
var actionConstants = require('../actions/constants');
var actions = require('../actions');
var main = require('../../../main');

var previousRelease = null;

main.shipit.on(actionConstants.RELEASE_PUBLISHED, function () {
    previousRelease = null;
});

main.shipit.on(actionConstants.RELEASE_ROLLEDBACK, function () {
    previousRelease = null;
});

module.exports = function () {
    if (previousRelease === null) {
        previousRelease = bluebird.join(discovery.getReleasesList(), discovery.getCurrentRelease(),
            function (releases, currentRelease) {
                var currentReleaseIndex = releases.indexOf(currentRelease);
                var previousReleaseIndex = currentReleaseIndex + 1; // releases are listed from newest to oldest
                var foundRelease = releases[previousReleaseIndex];
                if (foundRelease) {
                    return foundRelease;
                } else {
                    throw new Error('Not found release older then: ' + currentRelease);
                }
            });
    }

    return previousRelease;
};
