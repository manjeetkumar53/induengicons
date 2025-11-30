const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define schemas (simplified for query)
const TransactionSchema = new mongoose.Schema({}, { strict: false });
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

async function checkTransaction() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const id = '692177695f99dd51d3ca6ddb';
        console.log(`Fetching transaction with ID: ${id}`);

        const transaction = await Transaction.findById(id).lean();

        if (!transaction) {
            console.log('Transaction not found');
        } else {
            console.log('Transaction Data:');
            console.log(JSON.stringify(transaction, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

checkTransaction();
