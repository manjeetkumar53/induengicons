const mongoose = require('mongoose');

console.log('Testing Local MongoDB connection...');
const LOCAL_URI = 'mongodb://127.0.0.1:27017/induengicons';

mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log('✅ Connected successfully to Local MongoDB!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection failed to Local MongoDB:', err.message);
        process.exit(1);
    });
