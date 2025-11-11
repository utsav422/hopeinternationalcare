#!/usr/bin/env node

// API Security Testing Script for Hope International
// Run with: node scripts/test-api-security.js

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test configuration
const TESTS = {
    RATE_LIMITING: true,
    INPUT_VALIDATION: true,
    AUTHENTICATION: true,
    CORS: true,
    SECURITY_HEADERS: true,
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test rate limiting
async function testRateLimiting() {
    log('\n🔄 Testing Rate Limiting...', 'blue');

    const endpoint = `${BASE_URL}/api/email`;
    const payload = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message for rate limiting.',
    };

    let successCount = 0;
    let rateLimitedCount = 0;

    // Send 10 requests rapidly
    for (let i = 1; i <= 10; i++) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.status === 200) {
                successCount++;
                log(`  ✅ Request ${i}: Success (${response.status})`, 'green');
            } else if (response.status === 429) {
                rateLimitedCount++;
                log(
                    `  ⏱️  Request ${i}: Rate limited (${response.status})`,
                    'yellow'
                );
            } else {
                log(
                    `  ❌ Request ${i}: Unexpected status (${response.status})`,
                    'red'
                );
            }
        } catch (error) {
            log(`  ❌ Request ${i}: Error - ${error.message}`, 'red');
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    log(`\n📊 Rate Limiting Results:`, 'blue');
    log(
        `  Successful requests: ${successCount}`,
        successCount > 0 ? 'green' : 'red'
    );
    log(
        `  Rate limited requests: ${rateLimitedCount}`,
        rateLimitedCount > 0 ? 'green' : 'red'
    );

    if (rateLimitedCount > 0) {
        log('  ✅ Rate limiting is working correctly!', 'green');
    } else {
        log('  ⚠️  Rate limiting may not be configured properly', 'yellow');
    }
}

// Test input validation and sanitization
async function testInputValidation() {
    log('\n🛡️  Testing Input Validation...', 'blue');

    const endpoint = `${BASE_URL}/api/email`;

    const testCases = [
        {
            name: 'XSS Attempt',
            payload: {
                name: '<script>alert("XSS")</script>',
                email: 'test@example.com',
                message: 'Test message',
            },
            expectStatus: [400, 200], // Should either reject or sanitize
        },
        {
            name: 'SQL Injection Attempt',
            payload: {
                name: "'; DROP TABLE users; --",
                email: 'test@example.com',
                message: 'Test message',
            },
            expectStatus: [400, 200],
        },
        {
            name: 'Invalid Email',
            payload: {
                name: 'Test User',
                email: 'invalid-email',
                message: 'Test message',
            },
            expectStatus: [400],
        },
        {
            name: 'Missing Required Fields',
            payload: {
                name: 'Test User',
                // Missing email and message
            },
            expectStatus: [400],
        },
        {
            name: 'Extremely Long Input',
            payload: {
                name: 'A'.repeat(1000),
                email: 'test@example.com',
                message: 'B'.repeat(5000),
            },
            expectStatus: [400, 200], // Should either reject or truncate
        },
    ];

    for (const testCase of testCases) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCase.payload),
            });

            const isExpectedStatus = testCase.expectStatus.includes(
                response.status
            );

            if (isExpectedStatus) {
                log(
                    `  ✅ ${testCase.name}: Handled correctly (${response.status})`,
                    'green'
                );
            } else {
                log(
                    `  ❌ ${testCase.name}: Unexpected status (${response.status})`,
                    'red'
                );
            }
        } catch (error) {
            log(`  ❌ ${testCase.name}: Error - ${error.message}`, 'red');
        }
    }
}

// Test authentication and authorization
async function testAuthentication() {
    log('\n🔐 Testing Authentication...', 'blue');

    // Test admin endpoint without authentication
    try {
        const response = await fetch(`${BASE_URL}/api/admin/users`);

        if (response.status === 401 || response.status === 403) {
            log('  ✅ Admin endpoint properly protected', 'green');
        } else {
            log(
                `  ❌ Admin endpoint not protected (status: ${response.status})`,
                'red'
            );
        }
    } catch (error) {
        log(`  ❌ Error testing admin endpoint: ${error.message}`, 'red');
    }

    // Test public endpoint
    try {
        const response = await fetch(`${BASE_URL}/api/public/courses`);

        if (response.status === 200) {
            log('  ✅ Public endpoint accessible', 'green');
        } else {
            log(
                `  ⚠️  Public endpoint returned status: ${response.status}`,
                'yellow'
            );
        }
    } catch (error) {
        log(`  ❌ Error testing public endpoint: ${error.message}`, 'red');
    }
}

// Test CORS headers
async function testCORS() {
    log('\n🌐 Testing CORS...', 'blue');

    try {
        const response = await fetch(`${BASE_URL}/api/email`, {
            method: 'OPTIONS',
            headers: {
                Origin: 'https://example.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type',
            },
        });

        const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers.get(
                'Access-Control-Allow-Origin'
            ),
            'Access-Control-Allow-Methods': response.headers.get(
                'Access-Control-Allow-Methods'
            ),
            'Access-Control-Allow-Headers': response.headers.get(
                'Access-Control-Allow-Headers'
            ),
        };

        log('  📋 CORS Headers:', 'blue');
        Object.entries(corsHeaders).forEach(([key, value]) => {
            if (value) {
                log(`    ${key}: ${value}`, 'green');
            } else {
                log(`    ${key}: Not set`, 'yellow');
            }
        });

        if (
            response.status === 200 &&
            corsHeaders['Access-Control-Allow-Origin']
        ) {
            log('  ✅ CORS is configured', 'green');
        } else {
            log('  ⚠️  CORS may not be properly configured', 'yellow');
        }
    } catch (error) {
        log(`  ❌ Error testing CORS: ${error.message}`, 'red');
    }
}

// Test security headers
async function testSecurityHeaders() {
    log('\n🛡️  Testing Security Headers...', 'blue');

    try {
        const response = await fetch(`${BASE_URL}/api/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test',
                email: 'test@example.com',
                message: 'Test message',
            }),
        });

        const securityHeaders = {
            'X-Content-Type-Options': response.headers.get(
                'X-Content-Type-Options'
            ),
            'X-Frame-Options': response.headers.get('X-Frame-Options'),
            'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
            'Referrer-Policy': response.headers.get('Referrer-Policy'),
            'Permissions-Policy': response.headers.get('Permissions-Policy'),
            'Strict-Transport-Security': response.headers.get(
                'Strict-Transport-Security'
            ),
        };

        log('  📋 Security Headers:', 'blue');
        Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) {
                log(`    ✅ ${key}: ${value}`, 'green');
            } else {
                log(`    ❌ ${key}: Not set`, 'red');
            }
        });

        const setHeaders =
            Object.values(securityHeaders).filter(Boolean).length;
        const totalHeaders = Object.keys(securityHeaders).length;

        log(
            `\n  📊 Security Headers Score: ${setHeaders}/${totalHeaders}`,
            setHeaders === totalHeaders ? 'green' : 'yellow'
        );
    } catch (error) {
        log(`  ❌ Error testing security headers: ${error.message}`, 'red');
    }
}

// Main test runner
async function runSecurityTests() {
    log('🚀 Starting API Security Tests for Hope International', 'blue');
    log(`🎯 Testing against: ${BASE_URL}`, 'blue');

    try {
        if (TESTS.RATE_LIMITING) {
            await testRateLimiting();
        }

        if (TESTS.INPUT_VALIDATION) {
            await testInputValidation();
        }

        if (TESTS.AUTHENTICATION) {
            await testAuthentication();
        }

        if (TESTS.CORS) {
            await testCORS();
        }

        if (TESTS.SECURITY_HEADERS) {
            await testSecurityHeaders();
        }

        log('\n🎉 Security testing completed!', 'green');
        log('\n📝 Recommendations:', 'blue');
        log('  1. Review any failed tests and fix security issues', 'yellow');
        log('  2. Monitor rate limiting in production logs', 'yellow');
        log('  3. Regularly update security configurations', 'yellow');
        log(
            '  4. Consider implementing additional security measures',
            'yellow'
        );
    } catch (error) {
        log(`\n❌ Error running security tests: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runSecurityTests().catch(error => {
        log(`Fatal error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    runSecurityTests,
    testRateLimiting,
    testInputValidation,
    testAuthentication,
    testCORS,
    testSecurityHeaders,
};
