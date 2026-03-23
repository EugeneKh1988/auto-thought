import { fromLocalStorage } from "./utils";

function strToUint8(str: string) {
  return new TextEncoder().encode(str);
}

function uint8ToStr(buf: ArrayBuffer) {
  return new TextDecoder().decode(buf);
}

async function deriveKey(password: string) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    strToUint8(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: strToUint8("salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encrypt(text: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    strToUint8(text),
  );

  // объединяем iv + encrypted
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...result));
}

async function decrypt(data: string, key: CryptoKey) {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

  const iv = bytes.slice(0, 12);
  const encrypted = bytes.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted,
  );

  return uint8ToStr(decrypted);
}

export async function cryptoFn() {
  const strKey = fromLocalStorage<string>("key");
  if (!strKey) {
    throw {
      message: "No key",
    };
  }

  const key = await deriveKey(strKey);

  return {
    encrypt: (text: string) => encrypt(text, key),
    decrypt: (data: string) => decrypt(data, key),
  };
}
