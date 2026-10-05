import type { UserCredentials, UserConfigEntry, UsersConfig } from './types.js';

export function normalizeUsersConfig(parsed: unknown): UsersConfig {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('users.json must be an object keyed by email');
  }

  const users: UsersConfig = {};
  for (const [email, entry] of Object.entries(parsed)) {
    const e = entry as Partial<UserConfigEntry> | null;
    if (!e?.luzmoKey || !e.luzmoToken) {
      throw new Error(`Invalid entry for ${email}: missing luzmoKey or luzmoToken`);
    }

    const key = email.trim().toLowerCase();
    if (!key.includes('@')) {
      throw new Error(`Invalid entry for ${email}: email must contain @`);
    }
    if (users[key]) {
      throw new Error(`Duplicate user after normalizing email: ${key}`);
    }

    users[key] = { luzmoKey: e.luzmoKey, luzmoToken: e.luzmoToken };
  }

  return users;
}

export function credentialsForEmail(users: UsersConfig, email: string): UserCredentials | null {
  const key = email.trim().toLowerCase();
  const entry = users[key];
  if (!entry) return null;
  return {
    email: key,
    luzmoKey: entry.luzmoKey,
    luzmoToken: entry.luzmoToken,
  };
}
