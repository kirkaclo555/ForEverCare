import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  date?: string;
  createdAt?: string;
  hearts?: number;
  likes?: number;
  media?: any[];
  files?: any[];
  userReaction?: 'HEART' | 'LIKE' | null;
};

type Props = {
  announcements: AnnouncementItem[];
  isLoading?: boolean;
  onPressAnnouncement: (item: AnnouncementItem) => void;
  onPressSeeAll: () => void;
  language?: string;
};

export default function AnnouncementCard({
  announcements,
  isLoading = false,
  onPressAnnouncement,
  onPressSeeAll,
  language = 'en',
}: Props) {
  // Filter only announcements within the last 7 days
  const filterRecentAnnouncements = (items: AnnouncementItem[]) => {
    const now = new Date().getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    return items.filter((item) => {
      const dateStr = item.createdAt || item.date;
      if (!dateStr) return true; // If no date, include safely
      const parsedTime = new Date(dateStr).getTime();
      if (isNaN(parsedTime)) return true;
      return now - parsedTime <= sevenDaysMs;
    });
  };

  const isUrgentOrClosure = (item: AnnouncementItem) => {
    const text = `${item.title || ''} ${item.content || ''}`.toLowerCase();
    return (
      text.includes('urgent') ||
      text.includes('closed') ||
      text.includes('closure') ||
      text.includes('alert') ||
      text.includes('notice') ||
      text.includes('emergency') ||
      text.includes('holiday') ||
      text.includes('maintenance') ||
      text.includes('schedule change')
    );
  };

  const recentAnnouncements = filterRecentAnnouncements(announcements).slice(0, 2);

  return (
    <View style={styles.card}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="megaphone-outline" size={15} color="#35501F" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>
            {language === 'tl' ? 'Mga Balita' : 'Announcements'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPressSeeAll}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.seeAllText}>
            {language === 'tl' ? 'Tingnan lahat' : 'See all'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#35501F" />
          <Text style={styles.loadingText}>Loading announcements…</Text>
        </View>
      ) : recentAnnouncements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={22} color="#9CA3AF" style={{ marginBottom: 4 }} />
          <Text style={styles.emptyText}>
            {language === 'tl'
              ? 'Walang bagong balita sa nakaraang 7 araw'
              : 'No recent announcements in the last 7 days'}
          </Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {recentAnnouncements.map((item, idx) => {
            const isAlert = isUrgentOrClosure(item);
            const isLatest = idx === 0;

            if (isAlert) {
              return (
                <TouchableOpacity
                  key={item.id || idx}
                  style={styles.alertRow}
                  activeOpacity={0.8}
                  onPress={() => onPressAnnouncement(item)}
                >
                  <View style={styles.alertIconTile}>
                    <Ionicons name="warning" size={18} color="#D97706" />
                  </View>

                  <View style={styles.alertTextContainer}>
                    <View style={styles.alertHeaderRow}>
                      <Text style={styles.alertTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {isLatest && (
                        <View style={styles.latestPillAmber}>
                          <Text style={styles.latestPillText}>LATEST</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.alertDesc} numberOfLines={2}>
                      {item.content}
                    </Text>

                    <View style={styles.footerRow}>
                      <Text style={styles.alertDate}>{item.date || 'Recent'}</Text>
                      <View style={styles.reactionsGroup}>
                        {Boolean(item.media && item.media.length > 0) && (
                          <View style={styles.mediaCountBadge}>
                            <Ionicons name="image-outline" size={11} color="#B45309" />
                            <Text style={styles.mediaCountText}>{item.media?.length ?? 0}</Text>
                          </View>
                        )}
                        <Text style={styles.reactionText}>❤️ {item.hearts || 0}</Text>
                        <Text style={styles.reactionText}>👍 {item.likes || 0}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={item.id || idx}
                style={[
                  styles.regularRow,
                  idx < recentAnnouncements.length - 1 && styles.rowDivider,
                ]}
                activeOpacity={0.8}
                onPress={() => onPressAnnouncement(item)}
              >
                <View style={styles.regularIconTile}>
                  <Ionicons name="megaphone" size={16} color="#35501F" />
                </View>

                <View style={styles.regularTextContainer}>
                  <View style={styles.regularHeaderRow}>
                    <Text style={styles.regularTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {isLatest && (
                      <View style={styles.latestPillGreen}>
                        <Text style={styles.latestPillGreenText}>LATEST</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.regularDesc} numberOfLines={2}>
                    {item.content}
                  </Text>

                  <View style={styles.footerRow}>
                    <Text style={styles.regularDate}>{item.date || 'Recent'}</Text>
                    <View style={styles.reactionsGroup}>
                      {Boolean(item.media && item.media.length > 0) && (
                        <View style={styles.mediaCountBadgeGreen}>
                          <Ionicons name="image-outline" size={11} color="#35501F" />
                          <Text style={styles.mediaCountGreenText}>{item.media?.length ?? 0}</Text>
                        </View>
                      )}
                      <Text style={styles.reactionText}>❤️ {item.hearts || 0}</Text>
                      <Text style={styles.reactionText}>👍 {item.likes || 0}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Catcut',
    fontSize: 13,
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  seeAllText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#35501F',
  },
  loadingContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  itemsList: {
    gap: 8,
  },

  // Amber Alert Row
  alertRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-start',
  },
  alertIconTile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  alertTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    marginRight: 6,
  },
  latestPillAmber: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  latestPillText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  alertDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
    marginBottom: 6,
  },
  alertDate: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#B45309',
  },

  // Regular Row
  regularRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
    marginBottom: 2,
  },
  regularIconTile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  regularTextContainer: {
    flex: 1,
  },
  regularHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  regularTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
    marginRight: 6,
  },
  latestPillGreen: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  latestPillGreenText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    color: '#35501F',
    letterSpacing: 0.4,
  },
  regularDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginBottom: 6,
  },
  regularDate: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: '#9CA3AF',
  },

  // Footer Shared
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  mediaCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  mediaCountText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#B45309',
  },
  mediaCountBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  mediaCountGreenText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#35501F',
  },
});
