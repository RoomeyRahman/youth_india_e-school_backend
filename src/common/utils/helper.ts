import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

/**
 *
 * @param token
 * @param {string} password
 * @returns
 */
export async function encodeToken(token, password) {
  const iv = randomBytes(16);
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-ctr', key, iv);
  const encryptedToken = Buffer.concat([
    cipher.update(JSON.stringify(token)),
    cipher.final(),
  ]);
  return encryptedToken.toString('base64') + 'ILN' + iv.toString('base64');
}

/**
 *
 * @param {string} token
 * @param {string} password
 * @returns
 */
export async function decodeToken(token: string, password: string) {
  const tokenSplit = token.split('ILN');
  const iv = Buffer.from(tokenSplit[1], 'base64');
  const tokenBuff = Buffer.from(tokenSplit[0], 'base64');
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const decipher = createDecipheriv('aes-256-ctr', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(tokenBuff),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString());
}
