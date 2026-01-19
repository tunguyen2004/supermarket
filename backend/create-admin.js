#!/usr/bin/env node

/**
 * Script tạo account admin
 * Sử dụng: node create-admin.js
 */

const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

// Admin account
const adminAccount = {
  username: 'admin',
  email: 'admin@supermarket.com',
  password: '1',
  full_name: 'Administrator',
};

async function createAdmin() {
  try {
    console.log('🔄 Tạo account admin...\n');

    // Hash password
    const passwordHash = await bcrypt.hash(adminAccount.password, 10);

    // Kiểm tra username đã tồn tại không
    const usernameCheck = await db.query(
      'SELECT id FROM dim_users WHERE username = $1',
      [adminAccount.username]
    );

    if (usernameCheck.rows.length > 0) {
      console.log('❌ Username này đã tồn tại trong database!');
      process.exit(1);
    }

    // Lấy role_id = 1 (Admin) từ subdim_roles
    const roleResult = await db.query(
      `SELECT id FROM subdim_roles WHERE code = 'ADMIN' LIMIT 1`
    );
    
    const roleId = roleResult.rows.length > 0 ? roleResult.rows[0].id : 1;

    // Thêm admin account
    const result = await db.query(
      `INSERT INTO dim_users (username, email, password_hash, full_name, role_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
       RETURNING id, username, email, full_name, role_id, created_at`,
      [adminAccount.username, adminAccount.email, passwordHash, adminAccount.full_name, roleId]
    );

    console.log('✅ Admin account tạo thành công!\n');
    console.log('━'.repeat(60));
    console.log('\n📋 Admin Account Info:');
    console.log(`   👤 Username: ${adminAccount.username}`);
    console.log(`   🔐 Password: ${adminAccount.password}`);
    console.log(`   📧 Email: ${adminAccount.email}`);
    console.log(`   👥 Full Name: ${adminAccount.full_name}`);
    console.log(`   🎖️  Role ID: ${roleId}`);
    console.log(`   🆔 Account ID: ${result.rows[0].id}`);
    console.log(`   📅 Created: ${result.rows[0].created_at}`);
    console.log('\n━'.repeat(60));

    console.log('\n✨ Bạn có thể dùng account này để test API!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo admin account:', error.message);
    process.exit(1);
  }
}

createAdmin();
