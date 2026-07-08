const fs = require('fs');
const cp = require('child_process');
const https = require('https');

const checkUrl = (url) => {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      if (res.statusCode >= 400) {
        console.log('404:', url);
      }
      resolve();
    }).on('error', () => {
      console.log('Error:', url);
      resolve();
    }).end();
  });
};

const run = async () => {
  const findCmd = process.platform === 'win32' ? 'dir /s /b src\\*.jsx src\\*.css src\\*.js' : 'find src -type f';
  let files = [];
  try {
    files = cp.execSync(findCmd).toString().split('\n').map(s => s.trim()).filter(Boolean);
  } catch(e) {
    console.log(e.message);
  }
  
  const urls = new Set();
  files.forEach(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const matches = content.match(/https:\/\/images\.unsplash\.com\/[^\s\"\'\)\?]+/g);
      if (matches) matches.forEach(m => urls.add(m));
    } catch(e) {}
  });

  const urlsToCheck = Array.from(urls);
  console.log('Found', urlsToCheck.length, 'unique URLs');
  for (const url of urlsToCheck) {
    await checkUrl(url);
  }
  console.log('Done checking urls');
};
run();
