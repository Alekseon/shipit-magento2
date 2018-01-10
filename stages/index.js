'use strict';

var base = {
    group: 'www-data',
    repositoryUrl: 'https://github.com/Alekseon/clean_composer_magento_2.git',
    ignores: [
        '.DS_Store',
        '.git'
    ],
    keepReleases: 2,
    threads: 1,             // If deployment process takes too long you could try to increase this value.
    shallowClone: true,     // If set to true then it will remove and create remote cache directory every time
    linkedFiles: [
        'app/etc/env.php'   // It's advised that env.php for stages wouldn't
                            // be stored in repository due to security concerns.
    ],
    linkedDirs: [
        'pub/media'
    ],
    // stagedFiles: {
    //     //'errors/local.xml.{stage}': 'errors/local.xml'  // It's example of file that could be staged.
    // },
    paths: {
        php: 'php'
    },

    projectPath: '',        // You can define path if your magento root directory is deeper
    runComposer: true,
    deployStaticContent: true,
};

module.exports = {
    default: base,
    preprod: {
        servers: 'user@ip',
        branch: 'master',
        deployTo: '/var/www/html/',
        isProtected: false,
    },
    // prod: {
    //     servers: 'user@ip_address',
    //     branch: 'master',
    //     deployTo: '/var/www/html/',
    //     isProtected: true,
    // }
};

