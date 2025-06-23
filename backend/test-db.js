// Database Connection Test
const { createClient } = require('@supabase/supabase-js');
const config = require('./src/utils/config');

const supabase = createClient(config.supabase.url, config.supabase.key);

async function testDatabase() {
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', config.supabase.url);
    
    try {
        // Test 1: Check if users table exists
        console.log('\n1️⃣ Testing users table...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (usersError) {
            console.log('❌ Users table error:', usersError.message);
            return false;
        }
        console.log('✅ Users table exists');
        
        // Test 2: Check if transactions table exists
        console.log('\n2️⃣ Testing transactions table...');
        const { data: transactions, error: txnError } = await supabase
            .from('transactions')
            .select('*')
            .limit(1);
            
        if (txnError) {
            console.log('❌ Transactions table error:', txnError.message);
            return false;
        }
        console.log('✅ Transactions table exists');
        
        // Test 3: Check if plugin_logs table exists
        console.log('\n3️⃣ Testing plugin_logs table...');
        const { data: logs, error: logsError } = await supabase
            .from('plugin_logs')
            .select('*')
            .limit(1);
            
        if (logsError) {
            console.log('❌ Plugin logs table error:', logsError.message);
            return false;
        }
        console.log('✅ Plugin logs table exists');
        
        console.log('\n🎉 All database tables are set up correctly!');
        console.log('💡 You can now run payments successfully.');
        return true;
        
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
    }
}

// Run the test
testDatabase().then(success => {
    if (!success) {
        console.log('\n🔧 To fix this:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Run the setup-database.sql script');
        console.log('4. Then run this test again');
    }
    process.exit(success ? 0 : 1);
}); 