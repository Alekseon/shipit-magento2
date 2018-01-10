'use strict';

var bluebird = require('bluebird');
var discovery = require('../discovery');
var path = require('path2/posix');

var sharedDirectory = null;

module.exports = function () {
    if (sharedDirectory === null) {
        sharedDirectory = discovery.getDeployTo()
            .then(function (deployTo) {
                return path.join(deployTo, 'shared');
            });
    }

    return sharedDirectory;
};
