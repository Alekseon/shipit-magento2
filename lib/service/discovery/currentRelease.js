'use strict';

var discovery = require('../discovery');
var commands = require('../commands');
var actionConstants = require('../actions/constants');
var actions = require('../actions');
var path = require('path2/posix');

var main = require('../../../main');

var currentRelease = null;

main.shipit.on(actionConstants.RELEASE_PUBLISHED, function () {
    currentRelease = null;
});

main.shipit.on(actionConstants.RELEASE_ROLLEDBACK, function () {
    currentRelease = null;
});

module.exports = function () {
    if (currentRelease === null) {
        currentRelease = discovery.getCurrentLink()
            .then(function (currentLink) {
                return commands.readLink(currentLink)
                    .then(function (linkTarget) {
                        var elements = linkTarget.split(path.sep);

                        // Because last element in link is 'src' it's dependency on publish action
                        return elements[elements.length - 2];
                    });
            });
    }

    return currentRelease;
};
