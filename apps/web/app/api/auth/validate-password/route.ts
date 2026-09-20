import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PASSWORDS_FILE = path.join(process.cwd(), 'admin-passwords.json');

function getStoredPasswords(): Record<string, string> {
  try {
    if (fs.existsSync(PASSWORDS_FILE)) {
      return JSON.parse(fs.readFileSync(PASSWORDS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to read passwords file:', e);
  }
  return {};
}

const DEFAULT_PASSWORDS: Record<string, string[]> = {
  admin: ['123123', 'admin123'],
  superadmin: ['123123', 'superadmin123'],
};

export async function POST(request: Request) {
  try {
    const { role, password } = await request.json();

    if (!role || !password) {
      return NextResponse.json({ valid: false, message: 'Missing fields' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json({ valid: false, message: 'Invalid role' }, { status: 400 });
    }

    const stored = getStoredPasswords();
    const storedPassword = stored[role];
    const defaultPasswords = DEFAULT_PASSWORDS[role] || [];

    // If a custom password is set, only that password is valid
    if (storedPassword) {
      if (password === storedPassword) {
        return NextResponse.json({ valid: true }, { status: 200 });
      } else {
        return NextResponse.json({ valid: false, message: 'Invalid password' }, { status: 401 });
      }
    }

    // Otherwise check default passwords
    if (defaultPasswords.includes(password)) {
      return NextResponse.json({ valid: true }, { status: 200 });
    }

    return NextResponse.json({ valid: false, message: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error('Error in validate-password API:', error);
    return NextResponse.json({ valid: false, message: 'Internal server error' }, { status: 500 });
  }
}
