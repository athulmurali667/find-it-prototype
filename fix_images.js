const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace ALL Google image URLs with safe alternatives
const LOGO = 'screen.png';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=555&color=fff&size=200';
const ADMIN_AVATAR = 'https://ui-avatars.com/api/?name=Anna+Rivera&background=0D8ABC&color=fff&size=200';

// Replace all lh3.googleusercontent.com image src attributes
html = html.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida\/[^"]+"/g, 'src="' + LOGO + '"');
html = html.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida-public\/AB6AXuBqdMji8MRtqjan9uJKN4[^"]+"/g, 'src="' + ADMIN_AVATAR + '"');
html = html.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida-public\/AB6AXuCHq7o2VR7wN8no[^"]+"/g, 'src="' + ADMIN_AVATAR + '"');
html = html.replace(/src="https:\/\/lh3\.googleusercontent\.com\/[^"]+"/g, 'src="' + DEFAULT_AVATAR + '"');

fs.writeFileSync('index.html', html);
console.log('Done! Replaced all Google image URLs.');
