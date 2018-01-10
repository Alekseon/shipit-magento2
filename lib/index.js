'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (shipit) {
    var normalizedPath = path.join(__dirname, 'tasks');
    fs.readdirSync(normalizedPath).forEach(function (file) {
        require('./tasks/' + file)(shipit);
    });
};
