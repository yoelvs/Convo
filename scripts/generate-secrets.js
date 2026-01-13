#!/usr/bin/env node

/**
 * Generate secure JWT secrets for production use
 * Run with: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure JWT Secrets\n');
console.log('=' .repeat(60));

const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log('\nJWT_SECRET:');
console.log(jwtSecret);
console.log('\nJWT_REFRESH_SECRET:');
console.log(refreshSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Copy these values to your server/.env file');
console.log('⚠️  Keep these secrets secure and never commit them to git!\n');

