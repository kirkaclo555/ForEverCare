import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export interface RecordCardData {
  id: string;
  date?: string;
  type?: string;
  typeIcon?: string;
  summary?: string;
  fullDesc?: string;
  diagnosis?: string;
  treatment?: string;
  status?: string;
  vetName?: string;
  clinic?: string;
  // Specific to Prescriptions
  medicationName?: string;
  dosage?: string;
  // Specific to Vaccines
  vaccineName?: string;
  vaccineType?: string;
  vaccinationDate?: string;
  nextDueDate?: string;
  isVaccine?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface RecordCardProps {
  record: RecordCardData;
}

export default function RecordCard({ record }: RecordCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Vaccine Due Status calculation
  const getVaccineDueStatus = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', color: '#DC2626', bg: '#FEE2E2', icon: 'alert-circle' };
    }
    if (diffDays <= 30) {
      return { label: 'Due soon', color: '#D97706', bg: '#FEF3C7', icon: 'time' };
    }
    return { label: 'Up to date', color: '#276749', bg: '#EAF3DE', icon: 'checkmark-circle' };
  };

  const vaccineStatus = record.isVaccine && record.nextDueDate
    ? getVaccineDueStatus(record.nextDueDate)
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Record from ${formatDate(record.date)}`}
    >
      {/* Top Row: Date on left, Type/Status chip + Chevron on right */}
      <View style={styles.topRow}>
        <Text style={styles.dateText}>
          {formatDate(record.date || record.vaccinationDate)}
        </Text>

        <View style={styles.topRight}>
          {vaccineStatus ? (
            <View style={[styles.statusChip, { backgroundColor: vaccineStatus.bg }]}>
              <Ionicons name={vaccineStatus.icon as any} size={11} color={vaccineStatus.color} style={{ marginRight: 3 }} />
              <Text style={[styles.statusChipText, { color: vaccineStatus.color }]}>
                {vaccineStatus.label}
              </Text>
            </View>
          ) : (
            <View style={styles.typeChip}>
              <Ionicons name="calendar-outline" size={11} color="#276749" style={{ marginRight: 4 }} />
              <Text style={styles.typeChipText} numberOfLines={1}>
                {record.type || 'Consultation'}
              </Text>
            </View>
          )}

          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#9CA3AF"
            style={{ marginLeft: 6 }}
          />
        </View>
      </View>

      {/* Vaccine Card Body */}
      {record.isVaccine ? (
        <View style={styles.bodyCol}>
          <Text style={styles.vaccineTitle} numberOfLines={1}>
            {record.vaccineName || 'Vaccination'}
          </Text>
          <View style={styles.vaccineDatesRow}>
            {record.vaccinationDate ? (
              <Text style={styles.vaccineDateSub}>
                Given: <Text style={styles.vaccineDateVal}>{formatDate(record.vaccinationDate)}</Text>
              </Text>
            ) : null}
            {record.nextDueDate ? (
              <Text style={styles.vaccineDateSub}>
                Next due: <Text style={styles.vaccineDateVal}>{formatDate(record.nextDueDate)}</Text>
              </Text>
            ) : null}
          </View>
        </View>
      ) : (
        /* Standard Record Summary Line */
        <Text style={styles.summaryText} numberOfLines={expanded ? undefined : 1}>
          {record.summary || record.fullDesc || 'Check-up details and vet notes'}
        </Text>
      )}

      {/* Expanded Content Details */}
      {expanded && (
        <View style={styles.expandedSection}>
          {record.diagnosis && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>DIAGNOSIS</Text>
              <Text style={styles.detailValue}>{record.diagnosis}</Text>
            </View>
          )}

          {record.treatment && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>TREATMENT / DIRECTIONS</Text>
              <Text style={styles.detailValue}>{record.treatment}</Text>
            </View>
          )}

          {record.fullDesc && record.fullDesc !== record.summary && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>VET NOTES & OBSERVATIONS</Text>
              <Text style={styles.detailValue}>{record.fullDesc}</Text>
            </View>
          )}

          {record.clinic && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>CLINIC / VETERINARIAN</Text>
              <Text style={styles.detailValue}>{record.clinic}</Text>
            </View>
          )}

          {/* Action buttons for custom user vaccine record */}
          {record.isVaccine && (record.onEdit || record.onDelete) && (
            <View style={styles.actionRow}>
              {record.onEdit && (
                <TouchableOpacity
                  onPress={record.onEdit}
                  style={styles.editActionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FontAwesome5 name="pen" size={11} color="#4B5563" style={{ marginRight: 5 }} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
              )}
              {record.onDelete && (
                <TouchableOpacity
                  onPress={record.onDelete}
                  style={styles.deleteActionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FontAwesome5 name="trash" size={11} color="#DC2626" style={{ marginRight: 5 }} />
                  <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1F2937',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 160,
  },
  typeChipText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: '#276749',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
  },
  summaryText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 2,
  },
  bodyCol: {
    marginTop: 2,
  },
  vaccineTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1F2937',
    marginBottom: 3,
  },
  vaccineDatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vaccineDateSub: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
  },
  vaccineDateVal: {
    fontFamily: 'Montserrat-Medium',
    color: '#374151',
  },
  expandedSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  detailBlock: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#9CA3AF',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#374151',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    color: '#4B5563',
  },
});
