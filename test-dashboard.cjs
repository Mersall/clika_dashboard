#!/usr/bin/env node
const http = require('http');

const pages = [
  { path: '/', name: 'Home' },
  { path: '/content', name: 'Content' },
  { path: '/campaigns', name: 'Campaigns' },
  { path: '/analytics', name: 'Analytics' },
  { path: '/users', name: 'Users' },
  { path: '/settings', name: 'Settings' }
];

async function testPage(path, name) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const hasError = data.includes('error') || data.includes('Error');
        const hasContent = data.includes('<!DOCTYPE html>');
        resolve({
          name,
          path,
          status: res.statusCode,
          hasError,
          hasContent,
          success: res.statusCode === 200 && hasContent && !hasError
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name,
        path,
        status: 0,
        hasError: true,
        hasContent: false,
        success: false,
        error: error.message
      });
    });

    req.end();
  });
}

async function testAllPages() {
  console.log('Testing CLIKA Dashboard Pages...\n');
  
  const results = await Promise.all(
    pages.map(page => testPage(page.path, page.name))
  );

  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.name} (${result.path}): ${result.status || 'Failed'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });

  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log(`\n${failures.length} pages failed`);
  } else {
    console.log('\nAll pages loaded successfully!');
  }
}

testAllPages();