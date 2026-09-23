import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import StatusChip from './StatusChip';

type Props = {
  appointment: any;
  isMissed?: boolean;
  onPress: () => void;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
  onWithdrawCancel: (id: string) => void;
  onRebook: (app: any) => void;
};

/** Parse "09:00 AM" + "2026-09-23" → epoch ms */
const parseApptMs = (date: string, time: string): number => {
  try {
    const [y, m, d] = date.split('-').map(Number);
    const match = time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return new Date(y, m - 1, d, h, min).getTime();
  } catch {
    return 0;
  }
};

/** "09:00 AM" → "9:00 AM" */
const formatTime = (time: string): string => {
  const match = time?.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return time || '';
  return `${parseInt(match[1], 10)}:${match[2]} ${match[3].toUpperCase()}`;
};

export default function AppointmentCard({
  appointment: app,
  isMissed,
  onPress,
  onReschedule,
  onCancel,
  onWithdrawCancel,
  onRebook,
}: Props) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [canJoin, setCanJoin] = useState(false);

  const isTelemedicine = app.mode?.includes('Telemedicine');
  const apptMs = parseApptMs(app.date, app.time);

  useEffect(() => {
    if (!isTelemedicine || !apptMs) return;
    const check = () => {
      const now = Date.now();
      const tenMinBefore = apptMs - 10 * 60 * 1000;
      const oneHourAfter = apptMs + 60 * 60 * 1000;
      setCanJoin(now >= tenMinBefore && now <= oneHourAfter);
    };
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [isTelemedicine, apptMs]);

  const handleCopyCode = async () => {
    if (!app.sessionCode) return;
    await Clipboard.setStringAsync(app.sessionCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const isUpcoming = app.status === 'Upcoming';
  const isCancelPending = app.status === 'Cancel Pending';
  const showActions = (isUpcoming || isCancelPending) && !isMissed;
  const createdTime = app.createdAt ? new Date(app.createdAt).getTime() : Date.now();
  const isWithin24Hours = Date.now() - createdTime < 24 * 60 * 60 * 1000;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* ── Top row: time · status chip · chevron ── */}
      <View style={styles.topRow}>
        <Text style={styles.timeText}>{formatTime(app.time)}</Text>
        <View style={styles.topRight}>
          <StatusChip
            statusLabel={app.statusLabel}
            rawStatus={app.rawStatus}
            isMissed={isMissed}
          />
          <Ionicons
            name="chevron-forward"
            size={14}
            color="#9CA3AF"
            style={{ marginLeft: 4 }}
          />
        </View>
      </View>

      {/* ── Middle row: pet avatar · name/breed/service · visit chip ── */}
      <View style={styles.middleRow}>
        <View style={styles.petAvatar}>
          <Ionicons
            name={app.petIcon === 'cat' ? 'paw' : 'paw-outline'}
            size={18}
            color="#35501F"
          />
        </View>
        <View style={styles.petInfo}>
          <Text style={styles.petName} numberOfLines={2}>{app.petName}</Text>
          <Text style={styles.petMeta} numberOfLines={2}>
            {app.breed} · {app.service}
          </Text>
        </View>
        <View
          style={[
            styles.visitChip,
            isTelemedicine ? styles.visitChipTele : styles.visitChipInperson,
          ]}
        >
          <Ionicons
            name={isTelemedicine ? 'videocam-outline' : 'medical-outline'}
            size={11}
            color={isTelemedicine ? '#1D4ED8' : '#374151'}
          />
          <Text
            style={[
              styles.visitChipText,
              isTelemedicine
                ? styles.visitChipTextTele
                : styles.visitChipTextInperson,
            ]}
          >
            {isTelemedicine ? 'Telemed' : 'In-person'}
          </Text>
        </View>
      </View>

      {/* ── Telemedicine session code row ── */}
      {isTelemedicine && app.sessionCode && (
        <View style={styles.codeRow}>
          <Ionicons name="key-outline" size={13} color="#6B7280" />
          <Text style={styles.codeText} numberOfLines={1}>
            Code {app.sessionCode}
          </Text>
          <TouchableOpacity
            onPress={handleCopyCode}
            style={styles.copyBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={codeCopied ? 'checkmark' : 'copy-outline'}
              size={13}
              color={codeCopied ? '#35501F' : '#6B7280'}
            />
            {codeCopied && (
              <Text style={styles.copiedText}>Copied</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.joinBtn, !canJoin && styles.joinBtnDisabled]}
            disabled={!canJoin}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.joinBtnText,
                !canJoin && styles.joinBtnTextDisabled,
              ]}
              numberOfLines={1}
            >
              {canJoin ? 'Join call' : 'Available 10 min before'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom action row (Upcoming / Cancel Pending) ── */}
      {showActions && (
        <View style={styles.actionRow}>
          {isCancelPending ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionWithdraw]}
              onPress={() => onWithdrawCancel(app.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="return-up-back-outline"
                size={13}
                color="#35501F"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.actionWithdrawText}>
                Withdraw Cancellation
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionReschedule]}
                onPress={() => onReschedule(app.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color="#374151"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.actionRescheduleText}>Reschedule</Text>
              </TouchableOpacity>
              {isWithin24Hours && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionCancel]}
                  onPress={() => onCancel(app.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={13}
                    color="#DC2626"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.actionCancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* ── Missed: Rebook only ── */}
      {isMissed && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionRebook]}
            onPress={() => onRebook(app)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh-outline"
              size={13}
              color="#35501F"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.actionRebookText}>Rebook</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#1F2937',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Middle row
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  petInfo: {
    flex: 1,
    minWidth: 0,
  },
  petName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: '#1F2937',
  },
  petMeta: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: 2,
  },

  // Visit type chip
  visitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
    flexShrink: 0,
    gap: 3,
  },
  visitChipInperson: { backgroundColor: '#F3F4F6' },
  visitChipTele: { backgroundColor: '#EFF6FF' },
  visitChipText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
  },
  visitChipTextInperson: { color: '#374151' },
  visitChipTextTele: { color: '#1D4ED8' },

  // Telemedicine code row
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
    gap: 6,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  codeText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  copiedText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#35501F',
  },
  joinBtn: {
    backgroundColor: '#35501F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  joinBtnDisabled: { backgroundColor: '#E5E7EB' },
  joinBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  joinBtnTextDisabled: { color: '#9CA3AF' },

  // Action row (shared)
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    borderWidth: 1,
  },
  actionReschedule: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  actionRescheduleText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#374151',
  },
  actionCancel: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  actionCancelText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#DC2626',
  },
  actionWithdraw: {
    borderColor: '#C2E0A3',
    backgroundColor: '#EAF3DE',
  },
  actionWithdrawText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
  actionRebook: {
    borderColor: '#C2E0A3',
    backgroundColor: '#EAF3DE',
  },
  actionRebookText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
});
