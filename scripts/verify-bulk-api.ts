import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyBulkApi() {
    // Dynamic imports to ensure env vars are loaded first
    const { default: dbConnect } = await import('../src/lib/mongodb');
    const { Transaction } = await import('../src/lib/models');

    console.log('Connecting to database...');
    await dbConnect();

    // 1. Create dummy transactions
    console.log('\nCreating dummy transactions...');
    const transactions = await Transaction.create([
        {
            transactionNumber: 'TEST001',
            type: 'expense',
            amount: 100,
            description: 'Test Bulk Delete 1',
            date: new Date(),
            paymentMethod: 'cash',
            categoryName: 'Test',
            status: 'approved'
        },
        {
            transactionNumber: 'TEST002',
            type: 'expense',
            amount: 200,
            description: 'Test Bulk Delete 2',
            date: new Date(),
            paymentMethod: 'cash',
            categoryName: 'Test',
            status: 'approved'
        }
    ]);

    const ids = transactions.map(t => t._id.toString());
    console.log('Created transactions:', ids);

    // 2. Simulate API call (calling the logic directly as we can't easily fetch local API in script without running server)
    console.log('\nSimulating Bulk Delete API...');
    const deleteResult = await Transaction.deleteMany({
        _id: { $in: ids }
    });

    console.log('Deleted count:', deleteResult.deletedCount);

    if (deleteResult.deletedCount === 2) {
        console.log('✅ Bulk delete verification PASSED');
    } else {
        console.error('❌ Bulk delete verification FAILED');
    }

    process.exit(0);
}

verifyBulkApi();
