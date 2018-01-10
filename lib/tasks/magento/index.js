'use strict';

module.exports = function (shipit) {
    require('./clear_cache')(shipit);
    require('./indexer')(shipit);
};
