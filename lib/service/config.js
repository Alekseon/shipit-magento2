'use strict';

var main = require('../../main');

var databaseManager;

/**
 * @param {Object} config
 * @param {String} [config.user] - user used to login to config.host. Default: 'baobaz'
 * @param {String} config.host - ip or hostname of server from where tunnel will start
 * @param {Number} config.port
 * @param {String} config.remoteHost - ip or hostname
 * @param {Number} config.remotePort
 *
 * @constructor
 */
function SshTunnelConfig(config) {
    if (config.port && config.remoteHost && config.remotePort && config.host) {
        this.target = (config.user) + '@' + config.host;
        this.port = config.port;
        this.remoteHost = config.remoteHost;
        this.remotePort = config.remotePort;
    } else {
        throw new Error('Invalid ssh remote tunnel configuration.');
    }
}

var ConfigService = {
    /**
     * @param {String} command
     * @return {String}
     */
    bin: function (command) {
        var paths = main.shipit.config.paths || {};
        return paths[command] || command;
    },
    /**
     * @return {int}
     */
    maxConcurrentCommands: function () {
        return main.shipit.config.threads || 1;
    },
    getMaxReleases: function () {
        return main.shipit.config.keepReleases || 3;
    },
    /**
     * Get list of files that wil be ignored by rsync during coping files from remote copy to new release.
     *
     * @returns {Array}
     */
    getIgnored: function () {
        return main.shipit.config.ignores || [];
    },
    getLinkedFiles: function () {
        return main.shipit.config.linkedFiles || [];
    },
    getStagedFiles: function () {
        return main.shipit.config.stagedFiles || {};
    },
    getGroup: function () {
        return main.shipit.config.group || 'www-data';
    },
    getRepositoryUrl: function () {
        return main.shipit.config.repositoryUrl;
    },
    getBranch: function () {
        return main.shipit.config.branch;
    },
    getLinkedDirectories: function () {
        return main.shipit.config.linkedDirs || [];
    },
    getProjectPath: function () {
        return main.shipit.config.projectPath || '';
    },
    shouldRunComposer: function () {
        return main.shipit.config.runComposer || false;
    },
    shouldDeployStaticContent: function () {
        return main.shipit.config.deployStaticContent || false;
    },
    isShallowClone: function () {
        return main.shipit.config.shallowClone || false;
    }
};


module.exports = ConfigService;
