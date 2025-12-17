require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log('Testing MongoDB connection (Attempting to fix URI)...');

let uri = process.env.MONGODB_URI;
// Inject database name if missing
if (uri && !uri.includes('.net/induengicons')) {
    uri = uri.replace('.net/?', '.net/induengicons?');
    console.log('Modified URI to include database name: induengicons');
}

console.log('URI:', uri?.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connected successfully with modified URI!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection failed even with modified URI:', err.message);
        process.exit(1);
    });
