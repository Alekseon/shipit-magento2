'use strict';

var bluebird = require('bluebird');
var discovery = require('./index');
var path = require('path2/posix');

var remoteCache = null;

/**
 * Retrieve information about path to current link on server, it exists only after publication.
 *
 * @returns {bluebird}
 */
module.exports = function () {
    if (remoteCache === null) {
        remoteCache = discovery.getDeployTo()
            .then(function (deployTo) {
                return path.join(deployTo, 'remote-cache');
            });
    }

    return remoteCache;
};
