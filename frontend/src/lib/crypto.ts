import axios from './axios';

// Cache the public key (fetched from backend)
let cachedPublicKey: CryptoKey | null = null;
let cachedPemKey: string | null = null;

/**
 * Convert PEM formatted public key to CryptoKey
 */
const pemToPublicKey = async (pem: string): Promise<CryptoKey> => {
  // Remove PEM header/footer and decode base64
  const pemContents = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
};

/**
 * Fetch the public key from the backend API
 */
const fetchPublicKey = async (): Promise<string> => {
  const response = await axios.get<{ success: boolean; data: { publicKey: string } }>('/auth/public-key');
  return response.data.data.publicKey;
};

/**
 * Get the public key (fetched from backend and cached)
 */
const getPublicKey = async (): Promise<CryptoKey> => {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  // Fetch the public key from backend
  if (!cachedPemKey) {
    cachedPemKey = await fetchPublicKey();
    console.log('🔐 Public key fetched from backend');
  }

  cachedPublicKey = await pemToPublicKey(cachedPemKey);
  return cachedPublicKey;
};

/**
 * Encrypt a string using RSA-OAEP
 * @param data - Plain text string to encrypt
 * @returns Base64 encoded encrypted data
 */
export const encryptData = async (data: string): Promise<string> => {
  const publicKey = await getPublicKey();
  
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    encodedData
  );

  // Convert to Base64
  const encryptedArray = new Uint8Array(encryptedBuffer);
  let binaryString = '';
  for (let i = 0; i < encryptedArray.length; i++) {
    binaryString += String.fromCharCode(encryptedArray[i]);
  }
  return btoa(binaryString);
};

/**
 * Encrypt login credentials
 */
export const encryptLoginCredentials = async (
  email: string,
  password: string
): Promise<{ email: string; password: string }> => {
  const [encryptedEmail, encryptedPassword] = await Promise.all([
    encryptData(email),
    encryptData(password),
  ]);

  return {
    email: encryptedEmail,
    password: encryptedPassword,
  };
};

/**
 * Encrypt registration credentials
 */
export const encryptRegisterCredentials = async (
  name: string,
  email: string,
  password: string
): Promise<{ name: string; email: string; password: string }> => {
  const [encryptedName, encryptedEmail, encryptedPassword] = await Promise.all([
    encryptData(name),
    encryptData(email),
    encryptData(password),
  ]);

  return {
    name: encryptedName,
    email: encryptedEmail,
    password: encryptedPassword,
  };
};

/**
 * Clear the cached public key (call this if the server restarts or keys rotate)
 */
export const clearPublicKeyCache = (): void => {
  cachedPublicKey = null;
  cachedPemKey = null;
};

