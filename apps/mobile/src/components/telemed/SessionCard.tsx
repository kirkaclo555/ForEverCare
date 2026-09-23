import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusChip from './StatusChip';
import CodeChip from './CodeChip';

type Props = {
  appointment: any;
  isPast?: boolean;
  isMissed?: boolean;
  onJoin: (sessionCode: string) => void;
  onRebook: (appointment: any) => void;
};

/** Parse "09:00 AM" + "2026-09-30" → epoch ms */
const parseApptMs = (date: string, time: string): number => {
  try {
    const [y, m, d] = date.split('-').map(Number);
    const match = time?.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return new Date(y, m - 1, d).getTime();
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

/** Format "2026-09-30" + "09:00 AM" → "Wed, Sep 30 · 9:00 AM" */
const formatSessionDateTime = (dateStr: string, timeStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const match = timeStr?.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    const timeFmt = match
      ? `${parseInt(match[1], 10)}:${match[2]} ${match[3].toUpperCase()}`
      : timeStr || '';
    return `${dayStr} · ${timeFmt}`;
  } catch {
    return `${dateStr} · ${timeStr}`;
  }
};

/** Format "09:00 AM" → "9:00 AM" */
const formatCleanTime = (timeStr: string): string => {
  const match = timeStr?.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return timeStr || '';
  return `${parseInt(match[1], 10)}:${match[2]} ${match[3].toUpperCase()}`;
};

export default function SessionCard({
  appointment: app,
  isPast = false,
  isMissed = false,
  onJoin,
  onRebook,
}: Props) {
  const [canJoin, setCanJoin] = useState(false);
  const apptMs = parseApptMs(app.date, app.time);

  useEffect(() => {
    if (isPast || !apptMs) {
      setCanJoin(false);
      return;
    }

    const checkWindow = () => {
      const now = Date.now();
      const tenMinBefore = apptMs - 10 * 60 * 1000;
      const sessionEnd = apptMs + 60 * 60 * 1000;
      setCanJoin(now >= tenMinBefore && now <= sessionEnd);
    };

    checkWindow();
    const interval = setInterval(checkWindow, 30_000);
    return () => clearInterval(interval);
  }, [isPast, apptMs]);

  const petName = app.pet || app.petName || 'Pet';
  const cleanTime = formatCleanTime(app.time);
  const dateTimeStr = formatSessionDateTime(app.date, app.time);

  return (
    <View style={styles.card}>
      {/* ── Top row: Video icon tile · Title · Date & Time ── */}
      <View style={styles.contentRow}>
        <View style={[styles.iconTile, isPast ? styles.iconTilePast : styles.iconTileUpcoming]}>
          <Ionicons
            name="videocam"
            size={18}
            color={isPast ? '#9CA3AF' : '#35501F'}
          />
        </View>

        <View style={styles.detailsCol}>
          <Text style={styles.title} numberOfLines={1}>
            Consultation for {petName}
          </Text>
          <Text style={styles.dateTime} numberOfLines={1}>
            {dateTimeStr}
          </Text>
        </View>
      </View>

      {/* ── Chip row: StatusChip + CodeChip ── */}
      <View style={styles.chipRow}>
        <StatusChip status={app.status} isMissed={isMissed} />
        {!!app.sessionCode && <CodeChip code={app.sessionCode} />}
      </View>

      {/* ── Action Buttons ── */}
      {/* 1. Upcoming session actions */}
      {!isPast && (
        <View style={styles.actionRow}>
          {canJoin ? (
            <TouchableOpacity
              style={styles.joinBtnActive}
              onPress={() => onJoin(app.sessionCode)}
              activeOpacity={0.85}
            >
              <Ionicons name="videocam" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.joinBtnActiveText}>Join Call</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.joinBtnDisabled}>
              <Ionicons name="time-outline" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
              <Text style={styles.joinBtnDisabledText} numberOfLines={1}>
                Opens 10 min before, {cleanTime}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 2. Past session: Rebook if missed */}
      {isPast && isMissed && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rebookBtn}
            onPress={() => onRebook(app)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={14} color="#35501F" style={{ marginRight: 6 }} />
            <Text style={styles.rebookBtnText}>Rebook Appointment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  iconTileUpcoming: {
    backgroundColor: '#EAF3DE',
  },
  iconTilePast: {
    backgroundColor: '#F3F4F6',
  },
  detailsCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 2,
  },
  dateTime: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },

  // Upcoming Join buttons
  joinBtnActive: {
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  joinBtnActiveText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  joinBtnDisabled: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  joinBtnDisabledText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Past Rebook button
  rebookBtn: {
    backgroundColor: '#EAF3DE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C2E0A3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  rebookBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
});
