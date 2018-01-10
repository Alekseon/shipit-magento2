'use strict';

var bluebird = require('bluebird');
var main = require('../../../main');

var deployTo = null;

/**
 * @returns {bluebird}
 */
module.exports = function () {
    if (deployTo === null) {
        deployTo = bluebird.resolve(main.shipit.config.deployTo);
    }

    return deployTo;
};
