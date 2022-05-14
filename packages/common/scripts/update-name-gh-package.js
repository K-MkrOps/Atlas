const fs = require('fs');

(() => {
    const packageContents = JSON.parse(fs.readFileSync('./package.json').toString());
    packageContents.name = '@atlasfoundation/common';
    fs.writeFileSync('./package.json', Buffer.from(JSON.stringify(packageContents)));
})();