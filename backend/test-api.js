#!/usr/bin/env node

/**
 * Script test API - Supermarket Management System
 * 
 * Sử dụng:
 *   node test-api.js
 * 
 * Script này sẽ:
 * 1. Test login
 * 2. Lấy thông tin user
 * 3. Lấy danh sách nhân viên
 * 4. Thêm nhân viên
 * 5. Xóa nhân viên
 */

const http = require('http');

const API_URL = 'http://localhost:5000';
let token = null;

// Helper function để gửi HTTP request
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Thêm token nếu có
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// In kết quả test
function printResult(testName, response, expectedStatus) {
  const isSuccess =
    response.status === expectedStatus ||
    (expectedStatus === null && response.status < 400);
  const status = isSuccess ? '✅' : '❌';

  console.log(`\n${status} Test: ${testName}`);
  console.log(`   Status: ${response.status}`);
  console.log(`   Response:`, JSON.stringify(response.body, null, 2));

  return isSuccess;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('━'.repeat(50));

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Login
    console.log('\n📝 Test 1: Login');
    console.log('─'.repeat(50));
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'user@example.com',
      password: '123456',
    });

    if (printResult('POST /api/auth/login', loginRes, 200)) {
      token = loginRes.body.data?.token;
      console.log(`   Token: ${token?.substring(0, 20)}...`);
      testsPassed++;
    } else {
      testsFailed++;
      console.log(
        '   ⚠️ Login failed. Ensure database has seed data with email: user@example.com'
      );
      return; // Stop if login fails
    }

    // Test 2: Get current user
    console.log('\n📝 Test 2: Get Current User');
    console.log('─'.repeat(50));
    const meRes = await makeRequest('GET', '/api/auth/me');
    if (printResult('GET /api/auth/me', meRes, 200)) {
      testsPassed++;
    } else {
      testsFailed++;
    }

    // Test 3: Get profile
    console.log('\n📝 Test 3: Get Profile');
    console.log('─'.repeat(50));
    const profileRes = await makeRequest('GET', '/api/users/profile');
    if (printResult('GET /api/users/profile', profileRes, 200)) {
      testsPassed++;
    } else {
      testsFailed++;
    }

    // Test 4: Update profile
    console.log('\n📝 Test 4: Update Profile');
    console.log('─'.repeat(50));
    const updateProfileRes = await makeRequest('PUT', '/api/users/profile', {
      name: 'Updated User Name',
      phone: '0987654321',
      address: 'New Address',
    });
    if (printResult('PUT /api/users/profile', updateProfileRes, 200)) {
      testsPassed++;
    } else {
      testsFailed++;
    }

    // Test 5: Get staff list
    console.log('\n📝 Test 5: Get Staff List');
    console.log('─'.repeat(50));
    const staffListRes = await makeRequest('GET', '/api/staff?limit=10&offset=0');
    if (printResult('GET /api/staff', staffListRes, 200)) {
      testsPassed++;
    } else {
      testsFailed++;
    }

    // Test 6: Add staff
    console.log('\n📝 Test 6: Add New Staff');
    console.log('─'.repeat(50));
    const newEmail = `staff_${Date.now()}@example.com`;
    const addStaffRes = await makeRequest('POST', '/api/staff', {
      email: newEmail,
      name: 'Test Staff',
      phone: '0912345678',
      address: 'Test Address',
      password: 'testpass123',
      role: 'staff',
    });
    if (printResult('POST /api/staff', addStaffRes, 201)) {
      testsPassed++;
    } else {
      testsFailed++;
    }

    // Test 7: Get staff detail
    if (addStaffRes.body.data?.id) {
      console.log('\n📝 Test 7: Get Staff Detail');
      console.log('─'.repeat(50));
      const staffDetailRes = await makeRequest(
        'GET',
        `/api/staff/${addStaffRes.body.data.id}`
      );
      if (printResult('GET /api/staff/:id', staffDetailRes, 200)) {
        testsPassed++;
      } else {
        testsFailed++;
      }

      // Test 8: Update staff role
      console.log('\n📝 Test 8: Update Staff Role');
      console.log('─'.repeat(50));
      const updateRoleRes = await makeRequest(
        'PUT',
        `/api/staff/${addStaffRes.body.data.id}/role`,
        {
          role: 'manager',
        }
      );
      if (printResult('PUT /api/staff/:id/role', updateRoleRes, 200)) {
        testsPassed++;
      } else {
        testsFailed++;
      }

      // Test 9: Delete staff
      console.log('\n📝 Test 9: Delete Staff');
      console.log('─'.repeat(50));
      const deleteRes = await makeRequest(
        'DELETE',
        `/api/staff/${addStaffRes.body.data.id}`
      );
      if (printResult('DELETE /api/staff/:id', deleteRes, 200)) {
        testsPassed++;
      } else {
        testsFailed++;
      }
    }

    // Test 10: Test invalid token (should fail)
    console.log('\n📝 Test 10: Test Invalid Token');
    console.log('─'.repeat(50));
    token = 'invalid-token';
    const invalidTokenRes = await makeRequest('GET', '/api/auth/me');
    if (invalidTokenRes.status === 401) {
      console.log('✅ Test: GET /api/auth/me with invalid token (should fail)');
      console.log(`   Status: ${invalidTokenRes.status} (expected)`);
      testsPassed++;
    } else {
      console.log('❌ Test: GET /api/auth/me with invalid token');
      console.log(`   Status: ${invalidTokenRes.status} (expected 401)`);
      testsFailed++;
    }
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  console.log(`   📈 Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(
      '\n⚠️  Some tests failed. Check configuration and database.'
    );
  }

  console.log('\n═'.repeat(50));
}

// Run tests
runTests().catch(console.error);
