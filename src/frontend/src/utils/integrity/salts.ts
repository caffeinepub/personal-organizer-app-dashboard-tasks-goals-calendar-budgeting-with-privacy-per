import { useInternetIdentity } from '@/hooks/useInternetIdentity';

type SiloType = 'tasks' | 'goals' | 'calendar' | 'budget';

function generateSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getSalt(principal: string, silo: SiloType): string {
  const key = `salt_${principal}_${silo}`;
  let salt = localStorage.getItem(key);
  
  if (!salt) {
    salt = generateSalt();
    localStorage.setItem(key, salt);
  }
  
  return salt;
}

export function clearAllSalts(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith('salt_')) {
      localStorage.removeItem(key);
    }
  });
}
