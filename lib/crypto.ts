import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	scryptSync,
	type CipherGCMTypes,
} from 'crypto';

const algorithm: CipherGCMTypes = 'aes-256-gcm';
const ivLength = 16; // For AES-256-GCM, IV length is 16 bytes

// Derive a fixed key from the environment variable
// IMPORTANT: This key should be kept secret and only accessible on the server.
// Do NOT prefix with NEXT_PUBLIC_ in a production environment.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
	throw new Error('ENCRYPTION_KEY environment variable is not set.');
}

// Use scryptSync to derive a 32-byte key from the ENCRYPTION_KEY
// This makes the key suitable for AES-256 and adds a layer of protection
const key = scryptSync(ENCRYPTION_KEY, 'salt', 32); // 'salt' should ideally be unique and stored, but for simplicity, a fixed salt is used here.

export function encrypt(text: string): string {
	try {
		const iv = randomBytes(ivLength);
		const cipher = createCipheriv(algorithm, key, iv);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const tag = cipher.getAuthTag();
		return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
	} catch (error) {
		return '';
	}
}

export function decrypt(encryptedText: string): string {
	try {
		const parts = encryptedText.split(':');
		const iv = Buffer.from(parts[0], 'hex');
		const encrypted = parts[1];
		const tag = Buffer.from(parts[2], 'hex');

		const decipher = createDecipheriv(algorithm, key, iv);
		decipher.setAuthTag(tag);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	} catch (error) {
		return '';
	}
}
