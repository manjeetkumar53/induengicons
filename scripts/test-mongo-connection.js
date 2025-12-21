require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.ie_MONGODB_URI;
console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI?.replace(/:([^:@]+)@/, ':****@')); // Hide password

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI or ie_MONGODB_URI is not defined');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    });
