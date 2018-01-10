# Shipit deploy for Magento 2

Set of tools built on shipitjs/shipit-deploy to easy publish Magento 2 to remote server.


# Install


```angularjs
npm install --global shipit-cli
npm install --global shipit-deploy
npm install
```

# Getting started

Once everything is installed, you must edit stages/index.js file.

```javascript
'use strict';

var base = {
    group: 'www-data',
    repositoryUrl: 'https://github.com/Alekseon/clean_composer_magento_2.git',
    linkedFiles: [
        'app/etc/env.php'   // It's advised that env.php for stages wouldn't
                            // be stored in repository due to security concerns.
    ],
    linkedDirs: [
        'pub/media'
    ],
    projectPath: '',        // You can define path if your magento root directory is deeper
    runComposer: true,
    deployStaticContent: true
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
```

## Run command
```
shipit preprod deploy
```
Please mind that your first deploy will throw errors that it cannot link app/etc/env.php and pub/media directory. You should place them manually in shared directory on remote server and run deploy again.


# How does it work?
1. Create deployTo directory on remote server and created these directories inside 
 * current
 * releases
 * remote-cache
 * shared
2. Fetch your branch of repository to remote-cache directory
3. Rsync files to releases/{date} directory and build application
4. Symlink last build to **current** directory, enable maintenance mode, run setup:upgrade, flush caches, disable maintenance


