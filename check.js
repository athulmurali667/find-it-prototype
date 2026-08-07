const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');

function checkBalance(html, startPattern, endPattern) {
    const startIndex = html.indexOf(startPattern);
    if (startIndex === -1) return -1;
    const substr = html.substring(startIndex, html.indexOf(endPattern) + endPattern.length);
    const opens = (substr.match(/<div/g) || []).length;
    const closes = (substr.match(/<\/div/g) || []).length;
    return opens - closes;
}

console.log('Balance forgot-password:', checkBalance(indexHtml, '<div id="view-forgot-password"', '<!-- ==================== 1. HOME (FEED) VIEW ==================== -->'));
