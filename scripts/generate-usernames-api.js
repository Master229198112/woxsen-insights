const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001';
const API_ENDPOINT = `${BASE_URL}/api/admin/generate-usernames`;

console.log('🚀 Starting username generation via API...');
console.log(`📍 Using endpoint: ${API_ENDPOINT}`);

// Make API request to generate usernames
const postData = JSON.stringify({});

const url = new URL(API_ENDPOINT);
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ Success!');
        console.log(`📊 Updated: ${response.updated} users`);
        console.log(`⏭️  Skipped: ${response.skipped} users`);
        
        if (response.results && response.results.length > 0) {
          console.log('\n📝 Sample results:');
          response.results.forEach(result => {
            console.log(`   ${result.userName} (${result.email}) → ${result.username}`);
          });
        }
      } else {
        console.error('❌ API Error:', response.error || 'Unknown error');
        
        if (res.statusCode === 403) {
          console.error('🔐 This endpoint requires admin authentication.');
          console.error('💡 Try using the admin panel at /admin/author-urls instead.');
        }
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('🔧 Make sure your Next.js server is running on', BASE_URL);
    console.error('💡 Run: npm run dev');
  }
});

req.write(postData);
req.end();
