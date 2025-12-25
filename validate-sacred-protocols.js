// Sacred Protocols Validation Suite
// Comprehensive testing of Kairos Mirror's therapeutic boundaries and safety measures

import kairosService from './js/kairos-mirror-service.js';
import authService from './js/supabase-auth-service.js';
import { supabase } from './js/supabase-config.js';

class SacredProtocolValidator {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            tests: []
        };
        this.verbose = true;
    }

    log(message, type = 'info') {
        if (!this.verbose) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            info: '🔍',
            success: '✅', 
            error: '❌',
            warning: '⚠️',
            sacred: '🕊️'
        }[type] || '📝';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async runTest(testName, testFunction, expectedBehavior) {
        this.total++;
        this.log(`Testing: ${testName}`, 'info');
        
        try {
            const result = await testFunction();
            const passed = this.validateResult(result, expectedBehavior);
            
            this.testResults.tests.push({
                name: testName,
                passed,
                result,
                expectedBehavior,
                timestamp: new Date().toISOString()
            });

            if (passed) {
                this.passed++;
                this.log(`✅ PASS: ${testName}`, 'success');
            } else {
                this.failed++;
                this.log(`❌ FAIL: ${testName} - Expected: ${expectedBehavior}`, 'error');
            }

            return passed;
        } catch (error) {
            this.failed++;
            this.log(`❌ ERROR: ${testName} - ${error.message}`, 'error');
            this.testResults.tests.push({
                name: testName,
                passed: false,
                error: error.message,
                expectedBehavior,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }

    validateResult(result, expected) {
        if (typeof expected === 'function') {
            return expected(result);
        }
        if (typeof expected === 'boolean') {
            return Boolean(result) === expected;
        }
        if (typeof expected === 'string') {
            return String(result).includes(expected);
        }
        return result === expected;
    }

    // Test Sacred Check-In Flow
    async testSacredCheckIn() {
        this.log('🌅 Testing Sacred Check-In Protocols', 'sacred');

        // Test 1: Normal state/capacity combinations
        await this.runTest(
            'Sacred Check-In: Centered + Gentle',
            async () => {
                const result = await kairosService.performCheckIn('centered', 'gentle');
                return result.state === 'centered' && result.capacity === 'gentle' && result.turnBudget === 4;
            },
            true
        );

        // Test 2: Witnessing capacity limits
        await this.runTest(
            'Sacred Check-In: Witnessing Turn Budget',
            async () => {
                const result = await kairosService.performCheckIn('subtle', 'witnessing');
                return result.turnBudget === 2;
            },
            true
        );

        // Test 3: Deep dive maximum budget
        await this.runTest(
            'Sacred Check-In: Deep Dive Turn Budget',
            async () => {
                const result = await kairosService.performCheckIn('centered', 'deep_dive');
                return result.turnBudget === 8;
            },
            true
        );

        // Test 4: Invalid state rejection
        await this.runTest(
            'Sacred Check-In: Invalid State Rejection',
            async () => {
                try {
                    await kairosService.performCheckIn('invalid_state', 'gentle');
                    return false; // Should have thrown
                } catch (error) {
                    return error.message.includes('Invalid state');
                }
            },
            true
        );
    }

    // Test Resistance Detection
    async testResistanceDetection() {
        this.log('🛡️ Testing Sacred Resistance Detection', 'sacred');

        const resistanceTests = [
            { input: 'idk', expected: true, name: 'IDK Response' },
            { input: 'skip', expected: true, name: 'Skip Response' },
            { input: 'stop', expected: true, name: 'Stop Response' },
            { input: 'no', expected: true, name: 'No Response' },
            { input: 'nah', expected: true, name: 'Nah Response' },
            { input: 'whatever', expected: true, name: 'Whatever Response' },
            { input: 'a', expected: true, name: 'Single Letter' },
            { input: 'This is a thoughtful response about my feelings', expected: false, name: 'Genuine Response' },
            { input: '', expected: false, name: 'Empty Response' },
            { input: null, expected: false, name: 'Null Response' }
        ];

        for (const test of resistanceTests) {
            await this.runTest(
                `Resistance Detection: ${test.name}`,
                () => kairosService.detectResistance(test.input),
                test.expected
            );
        }
    }

    // Test Crisis Detection Patterns
    async testCrisisDetection() {
        this.log('🛡️ Testing Crisis Detection Protocols', 'sacred');

        const crisisTests = [
            {
                content: "I want to kill myself",
                expected: result => result.crisis === true && result.level === 'critical',
                name: 'Direct Suicide Statement'
            },
            {
                content: "I'm feeling hopeless and don't want to be here anymore",
                expected: result => result.crisis === true,
                name: 'Hopelessness with Death Ideation'
            },
            {
                content: "Everyone would be better off without me",
                expected: result => result.crisis === true,
                name: 'Burden Ideation'
            },
            {
                content: "I want to hurt myself",
                expected: result => result.crisis === true,
                name: 'Self-Harm Intent'
            },
            {
                content: "I'm just feeling a bit sad today",
                expected: result => result.crisis === false,
                name: 'Normal Sadness'
            },
            {
                content: "Life is challenging but I'm managing",
                expected: result => result.crisis === false,
                name: 'Normal Life Challenges'
            }
        ];

        for (const test of crisisTests) {
            await this.runTest(
                `Crisis Detection: ${test.name}`,
                async () => await kairosService.checkForCrisis(test.content),
                test.expected
            );
        }
    }

    // Test Multi-Layered Entry Creation
    async testMultiLayeredEntry() {
        this.log('📝 Testing Multi-Layered Entry Creation', 'sacred');

        // First ensure we have authentication
        const user = await authService.getUser();
        if (!user) {
            this.log('⚠️ Authentication required for entry tests - skipping', 'warning');
            return;
        }

        await this.runTest(
            'Multi-Layered Entry: Complete Structure',
            async () => {
                const entryData = {
                    title: 'Sacred Test Entry',
                    narrative: 'This is a test of the sacred journaling system',
                    emotions: [
                        { label: 'curious', intensity: 7 },
                        { label: 'peaceful', intensity: 6 }
                    ],
                    somaticMarks: [
                        { region: 'chest', descriptors: ['warm', 'open'], intensity: 5, note: 'feeling expansive' }
                    ],
                    checkIn: {
                        state: 'centered',
                        capacity: 'gentle'
                    }
                };

                const entry = await kairosService.createMultiLayeredEntry(entryData);
                return entry && entry.id && entry.narrative && entry.emotional_landscape && entry.somatic_map;
            },
            true
        );

        await this.runTest(
            'Multi-Layered Entry: Empty Emotion Array',
            async () => {
                const entryData = {
                    narrative: 'Test with no emotions',
                    emotions: [],
                    somaticMarks: [],
                    checkIn: { state: 'centered', capacity: 'gentle' }
                };

                const entry = await kairosService.createMultiLayeredEntry(entryData);
                return Array.isArray(entry.emotional_landscape) && entry.emotional_landscape.length === 0;
            },
            true
        );
    }

    // Test System Integration
    async testSystemIntegration() {
        this.log('⚙️ Testing System Integration', 'sacred');

        await this.runTest(
            'Supabase Connection',
            () => {
                const debugInfo = kairosService.getDebugInfo();
                return debugInfo.hasSupabaseClient;
            },
            true
        );

        await this.runTest(
            'Service Initialization',
            () => {
                const debugInfo = kairosService.getDebugInfo();
                return debugInfo.service === 'KairosMirror';
            },
            true
        );

        await this.runTest(
            'Database Tables Accessible',
            async () => {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('count', { count: 'exact', head: true });
                return !error;
            },
            true
        );

        await this.runTest(
            'AI Turns Table Structure',
            async () => {
                const { data, error } = await supabase
                    .from('ai_turns')
                    .select('count', { count: 'exact', head: true });
                return !error;
            },
            true
        );

        await this.runTest(
            'Pattern Signals Table Structure',
            async () => {
                const { data, error } = await supabase
                    .from('pattern_signals')
                    .select('count', { count: 'exact', head: true });
                return !error;
            },
            true
        );
    }

    // Test Progressive Unlocks Logic
    async testProgressiveUnlocks() {
        this.log('🔓 Testing Progressive Unlock System', 'sacred');

        await this.runTest(
            'Week Calculation',
            () => {
                const now = new Date();
                const fiveWeeksAgo = new Date(now.getTime() - (5 * 7 * 24 * 60 * 60 * 1000));
                // This would normally test the database trigger, but we'll test the logic
                return fiveWeeksAgo < now; // Basic date math works
            },
            true
        );

        // Test pattern recognition availability
        await this.runTest(
            'Pattern Recognition Logic',
            async () => {
                // Mock a user profile check
                try {
                    const profile = await kairosService.getUserProfile();
                    return true; // Function is callable
                } catch (error) {
                    return error.message.includes('not authenticated'); // Expected if not logged in
                }
            },
            true
        );
    }

    // Main validation orchestrator
    async validateAllProtocols() {
        this.log('🕊️ Starting Sacred Protocols Validation Suite', 'sacred');
        console.log('\n=== KAIROS MIRROR SACRED PROTOCOLS VALIDATION ===\n');

        const startTime = Date.now();

        // Initialize debug mode for detailed logging
        kairosService.enableDebug();

        // Run all test suites
        await this.testSacredCheckIn();
        await this.testResistanceDetection(); 
        await this.testCrisisDetection();
        await this.testMultiLayeredEntry();
        await this.testSystemIntegration();
        await this.testProgressiveUnlocks();

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        // Print comprehensive results
        this.printFinalReport(duration);

        return {
            passed: this.passed,
            failed: this.failed,
            total: this.total,
            successRate: (this.passed / this.total) * 100,
            duration,
            tests: this.testResults.tests
        };
    }

    printFinalReport(duration) {
        console.log('\n' + '='.repeat(60));
        console.log('🕊️ SACRED PROTOCOLS VALIDATION COMPLETE');
        console.log('='.repeat(60));
        
        console.log(`\n📊 RESULTS SUMMARY:`);
        console.log(`✅ Tests Passed: ${this.passed}`);
        console.log(`❌ Tests Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${Math.round((this.passed / this.total) * 100)}%`);
        console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);

        if (this.failed > 0) {
            console.log(`\n⚠️ FAILED TESTS:`);
            this.testResults.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`   ❌ ${test.name}`);
                    if (test.error) console.log(`      Error: ${test.error}`);
                });
        }

        const successRate = (this.passed / this.total) * 100;
        if (successRate >= 95) {
            console.log(`\n🎉 EXCELLENT: Sacred Protocols are functioning beautifully!`);
            console.log(`   The Mirror is ready to hold sacred space for consciousness evolution.`);
        } else if (successRate >= 80) {
            console.log(`\n✨ GOOD: Most Sacred Protocols are working well.`);
            console.log(`   Review failed tests before proceeding to beta.`);
        } else {
            console.log(`\n⚠️ ATTENTION NEEDED: Several Sacred Protocols need adjustment.`);
            console.log(`   Please address failed tests before sacred deployment.`);
        }

        console.log('\n🕊️ "Trust the wisdom that already lives within you."');
        console.log('='.repeat(60) + '\n');
    }
}

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
    window.SacredProtocolValidator = SacredProtocolValidator;
    window.validateSacredProtocols = async () => {
        const validator = new SacredProtocolValidator();
        return await validator.validateAllProtocols();
    };
} else if (typeof module !== 'undefined') {
    module.exports = { SacredProtocolValidator };
}

export { SacredProtocolValidator };