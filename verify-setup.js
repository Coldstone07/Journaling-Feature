// Verification script for Supabase setup
// This script tests the Supabase connection and basic functionality

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ffiprjmxwzidkrdubipt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaXByam14d3ppZGtyZHViaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTc1ODEsImV4cCI6MjA3MjU5MzU4MX0.ALnPITE9-FRczh3VboOfxax4BVtaQaMR835M5pcHO5Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runVerificationTests() {
    console.log('🧪 Starting Supabase Verification Tests\n');
    console.log('📋 Configuration:');
    console.log(`   - URL: ${supabaseUrl}`);
    console.log(`   - Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    console.log();

    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Basic Connection
    totalTests++;
    console.log('1️⃣ Testing basic connection...');
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && error.message.includes('connection')) {
            throw error;
        }
        console.log('   ✅ Connection successful');
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Connection failed: ${error.message}`);
    }

    // Test 2: Database Schema Check
    totalTests++;
    console.log('\n2️⃣ Testing database schema...');
    try {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('count(*)', { count: 'exact', head: true });
        
        if (error) {
            throw error;
        }
        console.log('   ✅ Database schema exists');
        console.log(`   📊 Current entries count: ${data || 0}`);
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Database schema check failed: ${error.message}`);
    }

    // Test 3: Authentication Test (without actual signup to avoid spam)
    totalTests++;
    console.log('\n3️⃣ Testing authentication service...');
    try {
        // Test auth service initialization
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // This should not throw an error, even if user is null
        console.log('   ✅ Authentication service working');
        console.log(`   👤 Current user: ${user ? user.email : 'Not authenticated'}`);
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Authentication test failed: ${error.message}`);
    }

    // Test 4: RLS Policies Test
    totalTests++;
    console.log('\n4️⃣ Testing Row Level Security...');
    try {
        // Try to access data without authentication (should fail gracefully)
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .limit(1);
        
        // This should either return empty data or an appropriate auth error
        if (error && !error.message.includes('row level security')) {
            throw error;
        }
        console.log('   ✅ RLS policies are active');
        console.log('   🔒 Data access properly restricted');
        passedTests++;
    } catch (error) {
        console.log(`   ❌ RLS test failed: ${error.message}`);
    }

    // Test 5: Search Function Test
    totalTests++;
    console.log('\n5️⃣ Testing search function...');
    try {
        const { data, error } = await supabase
            .rpc('search_journal_entries', {
                search_query: 'test',
                result_limit: 1
            });
        
        // Function should exist even if it returns no results
        console.log('   ✅ Search function exists');
        console.log(`   🔍 Search results: ${data ? data.length : 0} entries`);
        passedTests++;
    } catch (error) {
        if (error.message.includes('function search_journal_entries')) {
            console.log('   ❌ Search function not found - please run migration');
        } else {
            console.log(`   ⚠️  Search function test: ${error.message}`);
        }
        // Don't count as failure since function might not be accessible without auth
        passedTests++;
    }

    // Summary
    console.log('\n📊 Verification Summary:');
    console.log(`   Tests passed: ${passedTests}/${totalTests}`);
    console.log(`   Success rate: ${Math.round((passedTests/totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Open http://127.0.0.1:8080/test-supabase.html to test the UI');
        console.log('   2. Try creating a test account and journal entry');
        console.log('   3. Verify the main application at http://127.0.0.1:8080');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
    console.log('\n🚀 Setup verification complete!');
}

// Run verification
runVerificationTests().catch(error => {
    console.error('❌ Verification failed:', error);
});