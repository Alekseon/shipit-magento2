'use strict';

var path = require('path2/posix');
var _ = require('lodash');

var discovery = require('../discovery');
var config = require('../config');
var commandService = require('../commands');


var action = function () {
    var directories = config.getLinkedDirectories();
    var files = config.getLinkedFiles();

    return discovery.getSharedDirectory()
        .then(function (sharedDirectory) {
            var populateDirectories = [].concat(directories);
            var commands = [];

            files.forEach(function (file) {
                populateDirectories.push(path.dirname(file));
            });

            _.uniq(populateDirectories).forEach(function (directory) {
                var directoryPath = path.join(sharedDirectory, directory);
                commands.push(function () {
                    return commandService.createDirectory(directoryPath);
                });
            });

            return commandService.parallelize(commands);
        });
};

module.exports = action;
