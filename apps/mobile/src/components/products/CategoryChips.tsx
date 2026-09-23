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

type Props = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export default function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<View>(null);

  const displayLabel =
    selectedCategory === 'All' ? 'All Products' : selectedCategory;

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

  const handleSelect = (cat: string) => {
    onSelectCategory(cat);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* ── Compact trigger pill styled like earlier active chip ── */}
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
          accessibilityLabel={`Filter by category, current: ${displayLabel}`}
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
        {/* Full-screen dismiss layer */}
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Compact dropdown positioned right below the trigger pill */}
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
            {categories.map((cat, index) => {
              const isSelected = selectedCategory === cat;
              const label = cat === 'All' ? 'All Products' : cat;
              const isLast = index === categories.length - 1;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.row,
                    isSelected && styles.rowActive,
                    !isLast && styles.rowDivider,
                  ]}
                  onPress={() => handleSelect(cat)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.rowText,
                      isSelected && styles.rowTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#35501F" />
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
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 2,
  },

  triggerAnchor: {
    alignSelf: 'flex-start',
  },

  // Pill trigger — same dimensions and green style as the earlier active chip
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
    maxWidth: 160,
  },

  // Compact floating card (only as wide as needed, not full screen)
  dropdown: {
    position: 'absolute',
    minWidth: 160,
    maxWidth: 220,
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
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rowActive: {
    backgroundColor: '#F0F7EA',
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
});
