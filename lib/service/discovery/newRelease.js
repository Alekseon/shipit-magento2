'use strict';

var main = require('../../../main');
var path = require('path2/posix');
var actions = require('../actions');
var actionConstants = require('../actions/constants');
var bluebird = require('bluebird');

var newReleasePath = null;

main.shipit.on(actionConstants.RELEASE_CREATED, function (payload) {
    newReleasePath = bluebird.resolve(payload.releasePath);
});

main.shipit.on(actionConstants.RELEASE_PUBLISHED, function () {
   newReleasePath = null;
});

/**
 * @returns {bluebird}
 */
module.exports = function () {
    if (newReleasePath === null) {
        newReleasePath = bluebird.reject(new Error('No new release active at a time'));
    }
    return newReleasePath;
};
