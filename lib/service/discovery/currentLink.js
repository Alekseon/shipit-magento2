'use strict';

var bluebird = require('bluebird');
var discovery = require('../discovery');
var path = require('path2/posix');

var currentLink = null;

/**
 * Retrieve information about path to current link on server, it exists only after publication.
 *
 * @returns {bluebird}
 */
module.exports = function () {
    if (currentLink === null) {
        currentLink = discovery.getDeployTo()
            .then(function (deployTo) {
                return path.join(deployTo, 'current');
            });
    }

    return currentLink;
};
