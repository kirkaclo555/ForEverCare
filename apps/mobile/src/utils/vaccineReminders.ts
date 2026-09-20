import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export type VaccinationRecord = {
  id: string;
  vaccineName: string;
  vaccineType: string;
  vaccinationDate: string; // YYYY-MM-DD
  nextDueDate: string;     // YYYY-MM-DD
  vetClinic?: string;
};

export type VaccineAlert = {
  petId: string;
  petName: string;
  vaccineName: string;
  nextDueDate: string;
  status: 'overdue' | 'due_today' | 'due_soon';
  daysUntilDue: number;
};

const STORAGE_KEY_PREFIX = '@vaccine_records_';
const DISMISSED_KEY = '@vaccine_dismissed_';
const NOTIFIED_KEY_PREFIX = '@vaccine_notified_';

// ─── Automated Notification Dispatcher ─────────────────────────────────────────
export async function triggerVaccineNotification(params: {
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  petId?: string;
  petName: string;
  vaccineName: string;
  vaccineType?: string;
  nextDueDate: string;
  vetClinic?: string;
  status: 'overdue' | 'due_today' | 'due_soon';
  force?: boolean;
}): Promise<boolean> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${NOTIFIED_KEY_PREFIX}${params.petId || 'pet'}_${params.vaccineName}_${params.nextDueDate}_${todayStr}`;
    
    if (!params.force) {
      const alreadyNotified = await AsyncStorage.getItem(key);
      if (alreadyNotified) return false;
    }

    const response = await fetch(`${API_URL}/api/notifications/vaccine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const resData = await response.json();
    if (resData && resData.success) {
      await AsyncStorage.setItem(key, 'true');
      console.log('[VaccineReminders] Successfully dispatched vaccine alert:', params.vaccineName);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[VaccineReminders] Failed to trigger notification API:', err);
    return false;
  }
}

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────
export async function getVaccineRecords(petId: string): Promise<VaccinationRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${petId}`);
    if (!raw) return [];
    return JSON.parse(raw) as VaccinationRecord[];
  } catch {
    return [];
  }
}

export async function saveVaccineRecord(
  petId: string,
  record: VaccinationRecord,
  userId?: string,
  petName?: string,
  userEmail?: string,
  userPhone?: string
): Promise<void> {
  try {
    const existing = await getVaccineRecords(petId);
    const updated = [...existing.filter(r => r.id !== record.id), record];
    await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${petId}`, JSON.stringify(updated));

    // Check if newly saved/updated vaccine is due soon or overdue
    if (record.nextDueDate && petName) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(record.nextDueDate);
      due.setHours(0, 0, 0, 0);

      if (!isNaN(due.getTime())) {
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 14) {
          const status = diffDays < 0 ? 'overdue' : diffDays === 0 ? 'due_today' : 'due_soon';
          triggerVaccineNotification({
            userId,
            userEmail,
            userPhone,
            petId,
            petName,
            vaccineName: record.vaccineName,
            vaccineType: record.vaccineType,
            nextDueDate: record.nextDueDate,
            vetClinic: record.vetClinic,
            status,
            force: true
          });
        }
      }
    }
  } catch (e) {
    console.warn('[VaccineRecords] Failed to save:', e);
  }
}

export async function deleteVaccineRecord(petId: string, recordId: string): Promise<void> {
  try {
    const existing = await getVaccineRecords(petId);
    const updated = existing.filter(r => r.id !== recordId);
    await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${petId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('[VaccineRecords] Failed to delete:', e);
  }
}

// ─── No-op stubs — kept so callers don't need changes ─────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleVaccineReminder(
  _petName: string,
  _vaccineName: string,
  _dueDate: string,
  _daysBeforeReminder = 7
): Promise<string | null> {
  return null;
}

export async function cancelVaccineReminder(_notifId: string): Promise<void> {
  // no-op
}

// ─── In-app alert checker ─────────────────────────────────────────────────────
export async function checkAllVaccineAlerts(
  pets: { id: string; name: string }[],
  userId?: string,
  userEmail?: string,
  userPhone?: string
): Promise<VaccineAlert[]> {
  const alerts: VaccineAlert[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const pet of pets) {
    const records = await getVaccineRecords(pet.id);
    for (const rec of records) {
      if (!rec.nextDueDate) continue;
      const due = new Date(rec.nextDueDate);
      due.setHours(0, 0, 0, 0);
      if (isNaN(due.getTime())) continue;

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Only alert for overdue, due today, or within 14 days
      if (diffDays <= 14) {
        const status = diffDays < 0 ? 'overdue' : diffDays === 0 ? 'due_today' : 'due_soon';

        // Trigger external & in-app bell notification dispatch via backend
        triggerVaccineNotification({
          userId,
          userEmail,
          userPhone,
          petId: pet.id,
          petName: pet.name,
          vaccineName: rec.vaccineName,
          vaccineType: rec.vaccineType,
          nextDueDate: rec.nextDueDate,
          vetClinic: rec.vetClinic,
          status,
          force: true
        });

        const dismissedKey = `${DISMISSED_KEY}${pet.id}_${rec.id}_${rec.nextDueDate}`;
        const dismissed = await AsyncStorage.getItem(dismissedKey);
        if (dismissed) continue;

        alerts.push({
          petId: pet.id,
          petName: pet.name,
          vaccineName: rec.vaccineName,
          nextDueDate: rec.nextDueDate,
          status,
          daysUntilDue: diffDays,
        });
      }
    }
  }

  return alerts;
}

export async function dismissVaccineAlert(
  petId: string,
  recordId: string,
  nextDueDate: string
): Promise<void> {
  try {
    const key = `${DISMISSED_KEY}${petId}_${recordId}_${nextDueDate}`;
    await AsyncStorage.setItem(key, 'true');
  } catch {}
}

// ─── Status badge helper ──────────────────────────────────────────────────────
export function getVaccineStatus(nextDueDate: string): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  if (!nextDueDate) {
    return { label: 'Unknown', color: '#718096', bgColor: '#f7fafc', icon: 'question-circle' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);

  if (isNaN(due.getTime())) {
    return { label: 'Unknown', color: '#718096', bgColor: '#f7fafc', icon: 'question-circle' };
  }

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Overdue', color: '#e53e3e', bgColor: '#fff5f5', icon: 'exclamation-circle' };
  }
  if (diffDays === 0) {
    return { label: 'Due Today', color: '#dd6b20', bgColor: '#fffaf0', icon: 'exclamation-triangle' };
  }
  if (diffDays <= 14) {
    return { label: 'Due Soon', color: '#d69e2e', bgColor: '#fffff0', icon: 'clock' };
  }
  return { label: 'Up to Date', color: '#38a169', bgColor: '#f0fff4', icon: 'check-circle' };
}
