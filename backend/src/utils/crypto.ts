import crypto from 'crypto';

// RSA private key for decryption
// MUST be loaded from environment variables
let privateKey: string;

/**
 * Initialize RSA key pair from environment variables
 * Throws an error if keys are not configured
 */
export const initializeKeyPair = (): void => {
  const envPrivateKey = process.env.RSA_PRIVATE_KEY;

  if (!envPrivateKey) {
    throw new Error(
      '🔐 RSA private key not configured!\n' +
      '   Generate keys and add RSA_PRIVATE_KEY to your .env file'
    );
  }

  // Load key from environment variable
  // Keys in env are stored with \n replaced by \\n, so we need to convert back
  privateKey = envPrivateKey.replace(/\\n/g, '\n');
  console.log('🔐 RSA private key loaded from environment variables');
};

/**
 * Decrypt data that was encrypted with the public key
 * @param encryptedData - Base64 encoded encrypted data
 * @returns Decrypted string
 */
export const decryptWithPrivateKey = (encryptedData: string): string => {
  if (!privateKey) {
    throw new Error('Private key not initialized');
  }

  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Decrypt credentials object containing encrypted email and password
 * @param encryptedCredentials - Object with encrypted email and password
 * @returns Decrypted credentials
 */
export const decryptCredentials = (encryptedCredentials: {
  email: string;
  password: string;
  name?: string;
}): { email: string; password: string; name?: string } => {
  return {
    email: decryptWithPrivateKey(encryptedCredentials.email),
    password: decryptWithPrivateKey(encryptedCredentials.password),
    ...(encryptedCredentials.name && { name: decryptWithPrivateKey(encryptedCredentials.name) }),
  };
};

/**
 * Check if credentials appear to be encrypted (Base64 encoded)
 * This allows backward compatibility with unencrypted requests during transition
 */
export const isEncrypted = (data: string): boolean => {
  // Encrypted data will be a Base64 string that's longer than typical plain text
  // RSA-2048 produces 256 bytes = ~344 Base64 characters
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return data.length > 100 && base64Regex.test(data);
};