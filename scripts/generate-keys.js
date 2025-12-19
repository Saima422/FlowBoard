#!/usr/bin/env node

/**
 * Generate RSA key pair for credential encryption
 * Run this script and add the output to your .env files
 * 
 * - PUBLIC KEY goes in FRONTEND (.env) - used to encrypt credentials
 * - PRIVATE KEY goes in BACKEND (.env) - used to decrypt credentials
 */

const crypto = require('crypto');

console.log('🔐 Generating RSA-2048 key pair...\n');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Convert newlines to \n for .env file format
const envPublicKey = publicKey.replace(/\n/g, '\\n');
const envPrivateKey = privateKey.replace(/\n/g, '\\n');

console.log('═'.repeat(70));
console.log('  FRONTEND (.env) - Public Key for encrypting credentials');
console.log('═'.repeat(70));
console.log(`VITE_RSA_PUBLIC_KEY="${envPublicKey}"`);
console.log('');
console.log('═'.repeat(70));
console.log('  BACKEND (.env) - Both keys for decryption');
console.log('═'.repeat(70));
console.log(`RSA_PUBLIC_KEY="${envPublicKey}"`);
console.log('');
console.log(`RSA_PRIVATE_KEY="${envPrivateKey}"`);
console.log('═'.repeat(70));
console.log('\n✅ Keys generated successfully!');
console.log('\n📁 Where to put these:');
console.log('   • VITE_RSA_PUBLIC_KEY → frontend/.env');
console.log('   • RSA_PUBLIC_KEY      → backend/.env');
console.log('   • RSA_PRIVATE_KEY     → backend/.env');
console.log('\n⚠️  Keep your PRIVATE key secure and never commit it to version control.');

