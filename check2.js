const fs = require('fs');
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM(fs.readFileSync('index.html', 'utf8'));
const form = dom.window.document.querySelector('#view-create-account form');
const emailInput = form.querySelector('input[name="email"]');
console.log(emailInput ? emailInput.outerHTML : 'NOT FOUND');
