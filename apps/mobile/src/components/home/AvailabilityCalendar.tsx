import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CalendarDay = {
  dayNumber: number;
  dateObj: Date;
  formattedDate: string; // YYYY-MM-DD
  status: 'past' | 'available' | 'booked';
  isToday: boolean;
};

type Props = {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  fullyBookedDates: number[];
  isLoading?: boolean;
  onSelectDate: (day: {
    day: number;
    status: string;
    formattedDate: string;
    dateObj: Date;
  }) => void;
  onBookAppointment: (formattedDate: string, dateObj: Date) => void;
  language?: string;
};

export default function AvailabilityCalendar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  fullyBookedDates,
  isLoading = false,
  onSelectDate,
  onBookAppointment,
  language = 'en',
}: Props) {
  const [showFullMonth, setShowFullMonth] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const currentMonthName = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 for Sunday

  const today = new Date();
  const isCurrentPhysicalMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const isPastMonth =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month < today.getMonth());

  // Generate grid weeks
  const gridWeeks = useMemo(() => {
    const weeks: (CalendarDay | null)[][] = [];
    const totalSlots = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;

    let currentWeek: (CalendarDay | null)[] = [];

    for (let i = 0; i < totalSlots; i++) {
      const dayNum = i - startDayOfWeek + 1;
      const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;

      if (!isCurrentMonth) {
        currentWeek.push(null);
      } else {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(
          dayNum
        ).padStart(2, '0')}`;
        const isDayToday = isCurrentPhysicalMonth && dayNum === today.getDate();

        let status: 'past' | 'available' | 'booked' = 'available';
        if (isPastMonth || (isCurrentPhysicalMonth && dayNum < today.getDate())) {
          status = 'past';
        } else if (fullyBookedDates.includes(dayNum)) {
          status = 'booked';
        }

        currentWeek.push({
          dayNumber: dayNum,
          dateObj: new Date(year, month, dayNum),
          formattedDate,
          status,
          isToday: isDayToday,
        });
      }

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  }, [year, month, startDayOfWeek, daysInMonth, fullyBookedDates, isCurrentPhysicalMonth, isPastMonth]);

  // Find index of week containing today
  const currentWeekIndex = useMemo(() => {
    if (!isCurrentPhysicalMonth) return 0;
    const todayDate = today.getDate();
    return gridWeeks.findIndex((week) =>
      week.some((d) => d && d.dayNumber === todayDate)
    );
  }, [gridWeeks, isCurrentPhysicalMonth]);

  // Weeks to display
  const displayedWeeks = useMemo(() => {
    if (!isCurrentPhysicalMonth || showFullMonth || currentWeekIndex === -1) {
      return gridWeeks;
    }
    // Only show current week and subsequent weeks
    return gridWeeks.slice(currentWeekIndex);
  }, [gridWeeks, isCurrentPhysicalMonth, showFullMonth, currentWeekIndex]);

  // Find all available days in the displayed weeks
  const availableDays = useMemo(() => {
    const days: CalendarDay[] = [];
    gridWeeks.forEach((week) => {
      week.forEach((d) => {
        if (d && d.status === 'available') {
          days.push(d);
        }
      });
    });
    return days;
  }, [gridWeeks]);

  // Default selection: if none selected or selected day is not available, default to first available
  useEffect(() => {
    const isSelectedStillAvailable = availableDays.some(
      (d) => d.dayNumber === selectedDayNumber
    );
    if (!isSelectedStillAvailable) {
      if (availableDays.length > 0) {
        setSelectedDayNumber(availableDays[0].dayNumber);
      } else {
        setSelectedDayNumber(null);
      }
    }
  }, [availableDays, selectedDayNumber]);

  // Selected Day Details
  const selectedDayItem = useMemo(() => {
    if (!selectedDayNumber) return null;
    for (const week of gridWeeks) {
      for (const d of week) {
        if (d && d.dayNumber === selectedDayNumber) {
          return d;
        }
      }
    }
    return null;
  }, [gridWeeks, selectedDayNumber]);

  const handleDayPress = (dayItem: CalendarDay) => {
    // Only available days are selectable
    if (dayItem.status !== 'available') return;

    setSelectedDayNumber(dayItem.dayNumber);
    onSelectDate({
      day: dayItem.dayNumber,
      status: dayItem.status,
      formattedDate: dayItem.formattedDate,
      dateObj: dayItem.dateObj,
    });
  };

  const handleBookPress = () => {
    if (!selectedDayItem) return;
    onBookAppointment(selectedDayItem.formattedDate, selectedDayItem.dateObj);
  };

  const formatButtonDate = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const dayHeaders =
    language === 'tl'
      ? ['Li', 'Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <View style={styles.card}>
      {/* Top Header Row: Section Title and Month Navigation */}
      <View style={styles.topHeader}>
        <View style={styles.titleGroup}>
          <Ionicons name="calendar-outline" size={17} color="#35501F" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>
            {language === 'tl' ? 'Bakanteng Iskedyul' : 'Appointment Availability'}
          </Text>
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navArrow}
            activeOpacity={0.7}
            onPress={onPrevMonth}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="chevron-back" size={12} color="#35501F" />
          </TouchableOpacity>

          <Text style={styles.monthTitleText}>{currentMonthName}</Text>

          <TouchableOpacity
            style={styles.navArrow}
            activeOpacity={0.7}
            onPress={onNextMonth}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="chevron-forward" size={12} color="#35501F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Day of Week Header */}
      <View style={styles.weekHeaderRow}>
        {dayHeaders.map((dh, i) => (
          <Text key={i} style={styles.dayHeaderText}>
            {dh}
          </Text>
        ))}
      </View>

      {/* Calendar Grid Days */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#35501F" />
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {displayedWeeks.map((week, weekIdx) => (
            <View key={`week-${weekIdx}`} style={styles.weekRow}>
              {week.map((dayItem, dayIdx) => {
                if (!dayItem) {
                  return <View key={`empty-${dayIdx}`} style={styles.emptyCell} />;
                }

                const isSelected = dayItem.dayNumber === selectedDayNumber;
                const isPast = dayItem.status === 'past';
                const isBooked = dayItem.status === 'booked';
                const isAvailable = dayItem.status === 'available';

                return (
                  <TouchableOpacity
                    key={`day-${dayItem.dayNumber}`}
                    style={styles.cellWrapper}
                    activeOpacity={isAvailable ? 0.75 : 1}
                    onPress={() => handleDayPress(dayItem)}
                    disabled={!isAvailable}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        // Past days: no fill
                        isPast && styles.dayPast,
                        // Available days: light green circle
                        isAvailable && styles.dayAvailable,
                        // Fully booked: light red circle
                        isBooked && styles.dayBooked,
                        // Today: dark green ring
                        dayItem.isToday && !isSelected && styles.dayTodayRing,
                        // Selected day: solid dark green circle
                        isSelected && styles.daySelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isPast && styles.dayTextPast,
                          isAvailable && styles.dayTextAvailable,
                          isBooked && styles.dayTextBooked,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {dayItem.dayNumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Show full month / Show less toggle link */}
      {isCurrentPhysicalMonth && currentWeekIndex > 0 && (
        <TouchableOpacity
          style={styles.expandToggleBtn}
          activeOpacity={0.7}
          onPress={() => setShowFullMonth((prev) => !prev)}
        >
          <Text style={styles.expandToggleText}>
            {showFullMonth ? 'Show less' : 'Show full month'}
          </Text>
          <Ionicons
            name={showFullMonth ? 'chevron-up' : 'chevron-down'}
            size={13}
            color="#35501F"
            style={{ marginLeft: 3 }}
          />
        </TouchableOpacity>
      )}

      {/* Legend: Available and Fully Booked evenly spaced (Past removed) */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EAF3DE', borderColor: '#C2E0A3' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]} />
          <Text style={styles.legendText}>Fully booked</Text>
        </View>
      </View>

      {/* Full-width Book for {selected date} button */}
      <TouchableOpacity
        style={[
          styles.bookButton,
          !selectedDayItem && styles.bookButtonDisabled,
        ]}
        activeOpacity={0.85}
        onPress={handleBookPress}
        disabled={!selectedDayItem}
      >
        <Ionicons name="calendar" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.bookButtonText}>
          {selectedDayItem
            ? `Book for ${formatButtonDate(selectedDayItem.dateObj)}`
            : 'Select an available day'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Catcut',
    fontSize: 13,
    color: '#1F2937',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    flexShrink: 0,
  },
  navArrow: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  monthTitleText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#1F2937',
    paddingHorizontal: 4,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#9CA3AF',
  },
  gridContainer: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cellWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  emptyCell: {
    flex: 1,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPast: {
    backgroundColor: 'transparent',
  },
  dayAvailable: {
    backgroundColor: '#EAF3DE',
  },
  dayBooked: {
    backgroundColor: '#FEE2E2',
  },
  dayTodayRing: {
    borderWidth: 2,
    borderColor: '#35501F',
  },
  daySelected: {
    backgroundColor: '#35501F',
  },
  dayText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
  },
  dayTextPast: {
    color: '#9CA3AF',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  dayTextAvailable: {
    color: '#244013',
  },
  dayTextBooked: {
    color: '#DC2626',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  expandToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: 4,
  },
  expandToggleText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#35501F',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#4B5563',
  },
  bookButton: {
    backgroundColor: '#35501F',
    borderRadius: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#35501F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  loadingBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
