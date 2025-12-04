import React, { useEffect } from 'react';
import { RSA } from 'react-native-rsa-native';
import DeviceInfo from 'react-native-device-info';
import { userState } from '../store/userStore';
import { PACKAGE_NAME, staticPublicKey } from '../constants';

const useTokenEncryption = () => {
  const encryptedKey = userState.getState().encryptedKey;
  const publicKey = staticPublicKey;
  const { setEncryptedKey } = userState();

  useEffect(() => {
    if ((encryptedKey == null || encryptedKey === '') && publicKey) {
      encryptStorePayload();
    }
  }, []);

  const encryptStorePayload = async () => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();

      const payload = {
        packageName: PACKAGE_NAME,
        timestamp: Date.now(),
        deviceId, // e.g., from react-native-device-info
      };

      const encrypted = await RSA.encrypt(JSON.stringify(payload), publicKey);

      const withoutSpaces = encrypted.replace(/\s+/g, '');
      console.log('withoutSpaces.....', withoutSpaces);
      setEncryptedKey(withoutSpaces); // ✅ now saves in store
    } catch (error) {
      // Handle error if needed
      console.error('Encryption error:', error);
    }
  };
};

export default useTokenEncryption;
