'use strict';

module.exports = function (shipit) {
    var stages = require('./stages');
    var main = require('./main');

    main.initialize(shipit, stages);
    main.loadTasks();

    // TODO - use node to redefine tasks or change behaviour enclosed in services.
};
