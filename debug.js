const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('js/app.js', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => { console.error("JSDOM Error:", err); });
virtualConsole.on("jsdomError", (err) => { console.error("JSDOM Internal Error:", err); });


const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: "http://localhost:3000/",
    virtualConsole
});

// Mock fetch
dom.window.fetch = async (url) => {
    return {
        ok: true,
        json: async () => ([])
    };
};

dom.window.eval(script);

setTimeout(() => {
    console.log("Finished running script. Feed innerHTML length:", dom.window.document.getElementById('feed-container').innerHTML.length);
}, 2000);
