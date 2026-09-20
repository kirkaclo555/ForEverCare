import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type RootStackParamList = {
  Login: undefined;
  Users: undefined;
};

type UsersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Users'>;

type Props = {
  navigation: UsersScreenNavigationProp;
};

export default function UsersScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Top Bar Navigation equivalent */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={{marginRight: 15, padding: 5}}
              onPress={() => navigation.replace('Login')}
            >
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.pageTitleContainer}>
              <Text style={styles.pageTitle}>{t('admin.userManagement')}</Text>
              <View style={styles.subtitleBadge}>
                <Text style={styles.subtitleBadgeText}>{t('admin.staffAccess')}</Text>
              </View>
            </View>
          </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome5 name="bell" size={18} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
          {/* Language Toggle */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              const newLang = language === 'en' ? 'tl' : 'en';
              changeLanguage(newLang);
            }}
          >
            <FontAwesome5 name="language" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={[styles.mainScroll, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <FontAwesome5 name="search" size={14} color={theme.subtext} style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search users..."
            placeholderTextColor={theme.subtext}
          />
        </View>

        {/* Stats Grid - Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? '#1a3d28' : '#2E5E3E' }]}>
                <FontAwesome5 name="users" size={18} color="white" />
             </View>
             <View>
               <Text style={[styles.statTitle, { color: theme.subtext }]}>Total Users</Text>
               <Text style={[styles.statValue, { color: theme.text }]}>48</Text>
             </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? '#1a3d28' : '#2E5E3E' }]}>
                <FontAwesome5 name="user-check" size={18} color="white" />
             </View>
             <View>
               <Text style={[styles.statTitle, { color: theme.subtext }]}>Active</Text>
               <Text style={[styles.statValue, { color: theme.text }]}>42</Text>
             </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? '#1a3d28' : '#2E5E3E' }]}>
                <FontAwesome5 name="user-clock" size={18} color="white" />
             </View>
             <View>
               <Text style={[styles.statTitle, { color: theme.subtext }]}>On Leave</Text>
               <Text style={[styles.statValue, { color: theme.text }]}>4</Text>
             </View>
          </View>
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.actionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('admin.userDirectory')}</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: isDarkMode ? '#1a3d28' : '#2D5016' }]}>
              <FontAwesome5 name="plus" size={12} color="white" />
              <Text style={styles.addButtonText}>{t('admin.addUser')}</Text>
            </TouchableOpacity>
        </View>

        {/* User Card 1 */}
        <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.userCardHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#1a3d28' : '#2D5016' }]}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.text }]}>Dr. John Doe</Text>
                <Text style={[styles.userEmail, { color: theme.subtext }]}>john.doe@furcare.com</Text>
              </View>
            </View>
            <View style={[styles.idBadge, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
               <Text style={[styles.idBadgeText, { color: theme.text }]}>#U001</Text>
            </View>
          </View>

          <View style={[styles.userCardBody, { borderTopColor: theme.border }]}>
            <View style={styles.cardDetailRow}>
              <FontAwesome5 name="phone" size={12} color={theme.subtext} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: theme.text }]}>(555) 123-4567</Text>
            </View>
            
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: isDarkMode ? '#4a154b' : '#e9d8fd' }]}>
                 <Text style={[styles.roleBadgeText, { color: isDarkMode ? '#e9d8fd' : '#553c9a' }]}>Administrator</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? '#1c452d' : '#c6f6d5' }]}>
                 <Text style={[styles.statusBadgeText, { color: isDarkMode ? '#c6f6d5' : '#22543d' }]}>Active</Text>
              </View>
            </View>
          </View>

          <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="eye" size={14} color={theme.text} /></TouchableOpacity>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="edit" size={14} color="#3182ce" /></TouchableOpacity>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="archive" size={14} color="#e53e3e" /></TouchableOpacity>
          </View>
        </View>

        {/* User Card 2 */}
        <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.userCardHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#1a3d28' : '#2D5016' }]}>
                <Text style={styles.avatarText}>JS</Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.text }]}>Dr. Jane Smith</Text>
                <Text style={[styles.userEmail, { color: theme.subtext }]}>jane.smith@furcare.com</Text>
              </View>
            </View>
            <View style={[styles.idBadge, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
               <Text style={[styles.idBadgeText, { color: theme.text }]}>#U002</Text>
            </View>
          </View>

          <View style={[styles.userCardBody, { borderTopColor: theme.border }]}>
            <View style={styles.cardDetailRow}>
              <FontAwesome5 name="phone" size={12} color={theme.subtext} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: theme.text }]}>(555) 234-5678</Text>
            </View>
            
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: isDarkMode ? '#1a3b5c' : '#bee3f8' }]}>
                 <Text style={[styles.roleBadgeText, { color: isDarkMode ? '#bee3f8' : '#2a4365' }]}>Veterinarian</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? '#1c452d' : '#c6f6d5' }]}>
                 <Text style={[styles.statusBadgeText, { color: isDarkMode ? '#c6f6d5' : '#22543d' }]}>Active</Text>
              </View>
            </View>
          </View>

          <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="eye" size={14} color={theme.text} /></TouchableOpacity>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="edit" size={14} color="#3182ce" /></TouchableOpacity>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="archive" size={14} color="#e53e3e" /></TouchableOpacity>
          </View>
        </View>

        {/* User Card 3 */}
        <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.userCardHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#1a3d28' : '#2D5016' }]}>
                <Text style={styles.avatarText}>RB</Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.text }]}>Dr. Robert Brown</Text>
                <Text style={[styles.userEmail, { color: theme.subtext }]}>robert.brown@furcare.com</Text>
              </View>
            </View>
            <View style={[styles.idBadge, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
               <Text style={[styles.idBadgeText, { color: theme.text }]}>#U005</Text>
            </View>
          </View>

          <View style={[styles.userCardBody, { borderTopColor: theme.border }]}>
            <View style={styles.cardDetailRow}>
              <FontAwesome5 name="phone" size={12} color={theme.subtext} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: theme.text }]}>(555) 567-8901</Text>
            </View>
            
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: isDarkMode ? '#1a3b5c' : '#bee3f8' }]}>
                 <Text style={[styles.roleBadgeText, { color: isDarkMode ? '#bee3f8' : '#2a4365' }]}>Veterinarian</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? '#5c3a1a' : '#feebc8' }]}>
                 <Text style={[styles.statusBadgeText, { color: isDarkMode ? '#feebc8' : '#7b341e' }]}>On Leave</Text>
              </View>
            </View>
          </View>

          <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="eye" size={14} color={theme.text} /></TouchableOpacity>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="edit" size={14} color="#3182ce" /></TouchableOpacity>
            <TouchableOpacity style={[styles.iconAction, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc' }]}><FontAwesome5 name="archive" size={14} color="#e53e3e" /></TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F1EC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    // backgroundColor will be set dynamically via theme.headerBackground
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  pageTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: 'white',
    marginRight: 8,
  },
  subtitleBadge: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subtitleBadgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#2D5016',
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fc8181',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
  },
  mainScroll: {
    flex: 1,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#4a5568',
    fontFamily: 'Montserrat-Regular',
  },
  statsScroll: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    width: 160,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#2D5016',
  },
  statTitle: {
    color: '#a0aec0',
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#2d3748',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Catcut',
    color: '#2d3748',
  },
  addButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    marginLeft: 6,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: '#2D5016',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
  },
  userName: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    color: '#2d3748',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Montserrat-Regular',
  },
  idBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idBadgeText: {
    color: '#4a5568',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  userCardBody: {
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 15,
    marginBottom: 15,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 16,
  },
  detailText: {
    color: '#4a5568',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 15,
    justifyContent: 'flex-end',
  },
  iconAction: {
    width: 32,
    height: 32,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  }
});
