
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Transaction } from '../src/lib/models';

dotenv.config({ path: '.env.local' });

async function testTxnNumber() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const year = new Date().getFullYear();

        console.log('Querying for latest transaction...');
        const lastTransaction = await Transaction.findOne({
            transactionNumber: { $regex: `^TXN${year}` }
        }).sort({ transactionNumber: -1 });

        console.log('Last transaction found:', lastTransaction ? lastTransaction.transactionNumber : 'None');

        let nextSequence = 1;
        if (lastTransaction && lastTransaction.transactionNumber) {
            const lastSequenceStr = lastTransaction.transactionNumber.replace(`TXN${year}`, '');
            const lastSequence = parseInt(lastSequenceStr, 10);
            if (!isNaN(lastSequence)) {
                nextSequence = lastSequence + 1;
            }
        }

        const nextTransactionNumber = `TXN${year}${String(nextSequence).padStart(6, '0')}`;
        console.log('Predicted next transaction number:', nextTransactionNumber);

        // Also show count to demonstrate why the old logic failed vs new logic
        const count = await Transaction.countDocuments();
        console.log('Current document count:', count);
        console.log('Old logic would have generated:', `TXN${year}${String(count + 1).padStart(6, '0')}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testTxnNumber();
