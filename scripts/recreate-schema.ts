import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import models to ensure they are registered
import {
    User,
    Company,
    Project,
    TransactionCategory,
    ExpenseCategory,
    Transaction,
    Allocation
} from '../src/lib/models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

async function recreateSchema() {
    try {
        console.log('🍃 Connecting to MongoDB...');
        // Add database name explicitly if missing to ensure we create the right DB
        let uri = MONGODB_URI!;
        if (!uri.includes('.net/') || uri.includes('.net/?')) {
            // Only attempt to fix if it looks like a standard Atlas string without a DB path
            // This is a heuristic; user should ideally provide full URI
            console.log('⚠️  URI might be missing database name. Recommend adding /induengicons to URI.');
        }

        await mongoose.connect(uri);
        console.log('✅ Connected successfully.');

        console.log('🏗️  Building indexes (creating schema constraints)...');

        // Initialize all models to ensure collections and indexes are created
        await User.init();
        await Company.init();
        await Project.init();
        await TransactionCategory.init();
        await ExpenseCategory.init();
        await Transaction.init();
        await Allocation.init();

        console.log('✅ All indexes built successfully.');

        // Create Admin User
        console.log('👤 Checking for Admin user...');

        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('ℹ️  Admin user already exists. Skipping creation.');
        } else {
            console.log('✚ Creating default Admin user...');
            const hashedPassword = await bcrypt.hash('Admin@123456', 12);

            await User.create({
                username: 'admin',
                email: 'admin@induengicons.com',
                password: hashedPassword,
                firstName: 'System',
                lastName: 'Admin',
                role: 'admin',
                permissions: {
                    projects: 'admin',
                    transactions: 'admin',
                    reports: 'admin',
                    settings: 'admin'
                },
                status: 'active'
            });
            console.log('✅ Admin user created successfully.');
            console.log('👉 Username: admin');
            console.log('👉 Password: Admin@123456');
        }

        console.log('\n🎉 Database recovery complete! You can now run the app.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error recreating schema:', error);
        process.exit(1);
    }
}

recreateSchema();
