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

function savePasswords(passwords: Record<string, string>) {
  fs.writeFileSync(PASSWORDS_FILE, JSON.stringify(passwords, null, 2));
}

// Default passwords for validation
const DEFAULT_PASSWORDS: Record<string, string[]> = {
  admin: ['123123', 'admin123'],
  superadmin: ['123123', 'superadmin123'],
};

export async function POST(request: Request) {
  try {
    const { role, currentPassword, newPassword } = await request.json();

    if (!role || !currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check current password
    const stored = getStoredPasswords();
    const storedPassword = stored[role];
    const defaultPasswords = DEFAULT_PASSWORDS[role] || [];

    const isCurrentValid = storedPassword
      ? currentPassword === storedPassword
      : defaultPasswords.includes(currentPassword);

    if (!isCurrentValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
    }

    // Save new password
    stored[role] = newPassword;
    savePasswords(stored);

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in change-password API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // Utility endpoint to check if custom passwords exist (no passwords exposed)
  const stored = getStoredPasswords();
  return NextResponse.json({
    adminCustom: !!stored.admin,
    superadminCustom: !!stored.superadmin,
  });
}
