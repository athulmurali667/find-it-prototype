const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

// Wrap renderFeedView profile usages
appJs = appJs.replace(
    /const isOwnPost = post\.reporterUsername === profile\.username;/g,
    'const isOwnPost = profile && post.reporterUsername === profile.username;'
);
appJs = appJs.replace(
    /const displayAvatar = isOwnPost \? profile\.avatar : \(post\.reporterAvatar \|\| 'https:\/\/via\.placeholder\.com\/40'\);/g,
    "const displayAvatar = isOwnPost ? profile.avatar : (post.reporterAvatar || 'https://via.placeholder.com/40');"
);
appJs = appJs.replace(
    /const displayName = isOwnPost \? profile\.name : post\.reporterName;/g,
    'const displayName = isOwnPost ? profile.name : post.reporterName;'
);

// Wrap openItemModal profile usages
appJs = appJs.replace(
    /const isOwnPost = post\.reporterUsername === profile\.username;/g, // already replaced above, but just in case
    'const isOwnPost = profile && post.reporterUsername === profile.username;'
);

// Protect init() render calls
appJs = appJs.replace(
    /renderProfileView\(\);\s*renderMessagesView\(\);/g,
    `if (profile) {
            renderProfileView();
            renderMessagesView();
        }`
);

appJs = appJs.replace(
    /if \(nameEl\) nameEl\.textContent = profile\.name;/g,
    'if (!profile) return;\n        if (nameEl) nameEl.textContent = profile.name;'
);

fs.writeFileSync('js/app.js', appJs);
console.log("Successfully fixed profile null references");
