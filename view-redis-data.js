const { createClient } = require('redis');

async function viewRedisData() {
  const redis = createClient({
    url: process.env.REDIS_URL
  });

  try {
    console.log('🔌 Connecting to Redis...');
    await redis.connect();
    console.log('✅ Connected successfully!');

    // Get all contact submission keys
    console.log('\n📋 Fetching contact submissions...');
    const submissionKeys = await redis.lRange('contact:submissions', 0, -1);
    console.log(`📊 Found ${submissionKeys.length} submission keys`);

    if (submissionKeys.length === 0) {
      console.log('❌ No submissions found');
      return;
    }

    // Get all submissions
    console.log('\n📄 Contact Submissions:');
    console.log('='.repeat(50));
    
    for (let i = 0; i < submissionKeys.length; i++) {
      const key = submissionKeys[i];
      const submission = await redis.get(key);
      
      if (submission) {
        const data = JSON.parse(submission);
        console.log(`\n${i + 1}. Submission ID: ${data.id}`);
        console.log(`   Name: ${data.name}`);
        console.log(`   Email: ${data.email}`);
        console.log(`   Phone: ${data.phone || 'Not provided'}`);
        console.log(`   Company: ${data.company || 'Not provided'}`);
        console.log(`   Project Type: ${data.projectType}`);
        console.log(`   Timestamp: ${data.timestamp}`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Message: ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}`);
        console.log('-'.repeat(40));
      }
    }

    // Show some Redis stats
    console.log('\n📈 Database Info:');
    const info = await redis.info('keyspace');
    console.log(info);

    // List all keys (be careful with this in production)
    console.log('\n🔑 All Keys in Database:');
    const allKeys = await redis.keys('*');
    console.log(allKeys);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await redis.disconnect();
    console.log('\n🔌 Disconnected from Redis');
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.development.local' });

// Run the script
viewRedisData();