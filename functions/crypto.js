import { API_CONFIG, randomString } from './config.js';

const iv = '0102030405060708';
const presetKey = '0CoJUm6Qyw8W8jud';
const linuxapiKey = 'rFgB&h#%2?^eDg:Q';
const base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const publicKey = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB\n-----END PUBLIC KEY-----';

const aesEncrypt = async (text, key, iv) => {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const keyBytes = encoder.encode(key);
  const ivBytes = encoder.encode(iv);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: ivBytes
    },
    cryptoKey,
    textBytes
  );

  return Array.from(new Uint8Array(encrypted))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

const rsaEncrypt = async (text, key) => {
  // 使用 SubtleCrypto API 进行 RSA 加密
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  const publicKeyObj = await crypto.subtle.importKey(
    'spki',
    Buffer.from(key),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-1' },
    },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle
    .encrypt(
      { name: 'RSA-OAEP' },
      publicKeyObj,
      textBytes
    );

  return Array.from(new Uint8Array(encrypted))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export async function weapi(object) {
  const text = JSON.stringify(object);
  const secretKey = randomString(16);
  
  let params = await aesEncrypt(text, presetKey, iv);
  params = await aesEncrypt(params, secretKey, iv);
  
  const encSecKey = await rsaEncrypt(secretKey.split('').reverse().join(''), publicKey);

  return {
    params,
    encSecKey
  };
}

export async function linuxapi(object) {
  const text = JSON.stringify(object);
  return {
    eparams: await aesEncrypt(text, linuxapiKey, iv)
  };
}

export async function eapi(url, object) {
  const text = typeof object === 'object' ? JSON.stringify(object) : object;
  const message = `nobody${url}use${text}md5forencrypt`;
  const digest = await crypto.subtle.digest('MD5', new TextEncoder().encode(message));
  const digestHex = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digestHex}`;
  
  return {
    params: await aesEncrypt(data, linuxapiKey, iv)
  };
}