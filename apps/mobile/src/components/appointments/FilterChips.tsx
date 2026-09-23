import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FILTERS = ['All', 'Upcoming', 'Completed', 'Cancelled'] as const;
type Filter = typeof FILTERS[number];

type Props = {
  active: string;
  counts: Record<string, number>;
  onSelect: (f: string) => void;
};

export default function FilterChips({ active, counts, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<View>(null);

  const activeCount = counts[active] ?? 0;
  const displayLabel = `${active} (${activeCount})`;

  const openDropdown = () => {
    if (open) {
      setOpen(false);
      return;
    }
    triggerRef.current?.measureInWindow(
      (x: number, y: number, _w: number, h: number) => {
        setDropdownPos({
          top: y > 0 ? y + h + 4 : 140,
          left: x > 0 ? x : 16,
        });
        setOpen(true);
      }
    );
  };

  const handleSelect = (filterName: string) => {
    onSelect(filterName);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* ── Compact trigger pill ── */}
      <View
        ref={triggerRef}
        collapsable={false}
        style={styles.triggerAnchor}
      >
        <TouchableOpacity
          style={styles.trigger}
          onPress={openDropdown}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Filter appointments, current: ${displayLabel}`}
        >
          <Text style={styles.triggerLabel} numberOfLines={1}>
            {displayLabel}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={13}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* ── Compact floating dropdown card ── */}
      <Modal
        visible={open}
        animationType="none"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        {/* Dismiss overlay */}
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Small dropdown positioned right below the trigger pill */}
        <View
          style={[
            styles.dropdown,
            { top: dropdownPos.top, left: dropdownPos.left },
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {FILTERS.map((f, index) => {
              const isSelected = active === f;
              const count = counts[f] ?? 0;
              const isLast = index === FILTERS.length - 1;

              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.row,
                    isSelected && styles.rowActive,
                    !isLast && styles.rowDivider,
                  ]}
                  onPress={() => handleSelect(f)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.rowLeft}>
                    <Text
                      style={[
                        styles.rowText,
                        isSelected && styles.rowTextActive,
                      ]}
                    >
                      {f}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        isSelected ? styles.badgeActive : styles.badgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          isSelected
                            ? styles.badgeTextActive
                            : styles.badgeTextInactive,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark" size={15} color="#35501F" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },

  triggerAnchor: {
    alignSelf: 'flex-start',
  },

  // Pill trigger — compact green pill
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#35501F',
    borderWidth: 1,
    borderColor: '#35501F',
  },
  triggerLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#FFFFFF',
  },

  // Compact floating card (only as wide as needed, not full screen)
  dropdown: {
    position: 'absolute',
    minWidth: 180,
    maxWidth: 240,
    maxHeight: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rowActive: {
    backgroundColor: '#F0F7EA',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#374151',
  },
  rowTextActive: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#35501F',
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: '#D1E7B7',
  },
  badgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  badgeTextActive: {
    color: '#2B4219',
  },
  badgeTextInactive: {
    color: '#6B7280',
  },
});
