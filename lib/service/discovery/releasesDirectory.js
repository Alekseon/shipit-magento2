'use strict';

var bluebird = require('bluebird');
var discovery = require('../discovery');
var path = require('path2/posix');

var releasesDir = null;

module.exports = function () {
    if (releasesDir === null) {
        releasesDir = discovery.getDeployTo()
            .then(function (deployTo) {
                return path.join(deployTo, 'releases');
            });
    }

    return releasesDir;
};
