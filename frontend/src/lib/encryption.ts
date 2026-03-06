import CryptoJS from 'crypto-js';
import { config } from '../config/env';

const DEFAULT_ALGORITHM = 'aes-256-cbc';
const SUPPORTED_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // bytes

const flag =
  process.env.NEXT_PUBLIC_API_ENCRYPTION_ENABLED ??
  (config as any).API_ENCRYPTION_ENABLED ??
  'false';

const ENCRYPTION_ENABLED =
  typeof flag === 'string'
    ? flag.trim().toLowerCase() === 'true'
    : Boolean(flag);

const secret =
  process.env.NEXT_PUBLIC_API_ENCRYPTION_SECRET ||
  (config as any).API_ENCRYPTION_SECRET ||
  '';

const algorithm =
  process.env.NEXT_PUBLIC_API_ENCRYPTION_ALGORITHM ||
  (config as any).API_ENCRYPTION_ALGORITHM ||
  DEFAULT_ALGORITHM;

function deriveKey() {
  if (!secret.trim()) {
    throw new Error(
      'API encryption is enabled but NEXT_PUBLIC_API_ENCRYPTION_SECRET is not configured.',
    );
  }

  return CryptoJS.SHA256(secret);
}

function ensureAlgorithmSupported() {
  if (algorithm !== SUPPORTED_ALGORITHM) {
    throw new Error(
      `Unsupported encryption algorithm "${algorithm}". Only "${SUPPORTED_ALGORITHM}" is currently supported on the client.`,
    );
  }
}

export function isEncryptionEnabled(): boolean {
  return ENCRYPTION_ENABLED;
}

export function encryptRequestPayload(payload: unknown): { data: string } {
  if (!isEncryptionEnabled()) {
    return payload as any;
  }

  ensureAlgorithmSupported();

  const key = deriveKey();
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);

  const serialized =
    typeof payload === 'string' ? payload : JSON.stringify(payload ?? null);

  const encrypted = CryptoJS.AES.encrypt(serialized, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const encoded = `${CryptoJS.enc.Base64.stringify(iv)}:${encrypted.ciphertext.toString(CryptoJS.enc.Base64)}`;

  return { data: encoded };
}

export function decryptResponsePayload<T>(token: string): T {
  if (!isEncryptionEnabled()) {
    return token as unknown as T;
  }

  ensureAlgorithmSupported();

  const key = deriveKey();

  const [ivPart, cipherPart] = token.split(':');

  if (!ivPart || !cipherPart) {
    throw new Error('Encrypted payload has an invalid format.');
  }

  const iv = CryptoJS.enc.Base64.parse(ivPart);
  const ciphertext = CryptoJS.enc.Base64.parse(cipherPart);

  const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const plainText = decrypted.toString(CryptoJS.enc.Utf8);

  if (!plainText) {
    throw new Error('Failed to decrypt response payload.');
  }

  try {
    return JSON.parse(plainText) as T;
  } catch (error) {
    return plainText as unknown as T;
  }
}

export function tryDecryptResponse<T>(
  raw: any,
  headers: Headers,
): T | any {
  if (!isEncryptionEnabled()) {
    return raw;
  }

  const encryptedHeader = headers.get('X-Content-Encrypted');
  const isEncrypted =
    (typeof encryptedHeader === 'string' &&
      encryptedHeader.trim().toLowerCase() === 'true') ||
    (typeof raw?.data === 'string' && raw.data.includes(':'));

  if (!isEncrypted) {
    return raw;
  }

  const token =
    typeof raw?.data === 'string'
      ? raw.data
      : typeof raw?.payload === 'string'
        ? raw.payload
        : null;

  if (!token) {
    return raw;
  }

  return decryptResponsePayload<T>(token);
}

