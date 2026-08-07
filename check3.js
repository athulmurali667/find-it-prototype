const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log(html.split('id="view-create-account"').length - 1);
