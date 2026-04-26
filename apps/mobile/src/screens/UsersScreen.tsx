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

type RootStackParamList = {
  Login: undefined;
  Users: undefined;
};

type UsersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Users'>;

type Props = {
  navigation: UsersScreenNavigationProp;
};

export default function UsersScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Bar Navigation equivalent */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
           <TouchableOpacity 
             style={{marginRight: 15, padding: 5}}
             onPress={() => navigation.replace('Login')}
           >
             <FontAwesome5 name="arrow-left" size={20} color="white" />
           </TouchableOpacity>
           <View style={styles.pageTitleContainer}>
             <Text style={styles.pageTitle}>User Management</Text>
             <View style={styles.subtitleBadge}>
               <Text style={styles.subtitleBadgeText}>Staff & Access</Text>
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
        </View>
      </View>

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={14} color="#a0aec0" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#a0aec0"
          />
        </View>

        {/* Stats Grid - Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={styles.statCard}>
             <View style={[styles.statIconContainer, { backgroundColor: '#2E5E3E' }]}>
                <FontAwesome5 name="users" size={18} color="white" />
             </View>
             <View>
               <Text style={styles.statTitle}>Total Users</Text>
               <Text style={styles.statValue}>48</Text>
             </View>
          </View>
          <View style={styles.statCard}>
             <View style={[styles.statIconContainer, { backgroundColor: '#2E5E3E' }]}>
                <FontAwesome5 name="user-check" size={18} color="white" />
             </View>
             <View>
               <Text style={styles.statTitle}>Active</Text>
               <Text style={styles.statValue}>42</Text>
             </View>
          </View>
          <View style={styles.statCard}>
             <View style={[styles.statIconContainer, { backgroundColor: '#2E5E3E' }]}>
                <FontAwesome5 name="user-clock" size={18} color="white" />
             </View>
             <View>
               <Text style={styles.statTitle}>On Leave</Text>
               <Text style={styles.statValue}>4</Text>
             </View>
          </View>
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.actionRow}>
           <Text style={styles.sectionTitle}>User Directory</Text>
           <TouchableOpacity style={styles.addButton}>
             <FontAwesome5 name="plus" size={12} color="white" />
             <Text style={styles.addButtonText}>Add User</Text>
           </TouchableOpacity>
        </View>

        {/* User Card 1 */}
        <View style={styles.userCard}>
          <View style={styles.userCardHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View>
                <Text style={styles.userName}>Dr. John Doe</Text>
                <Text style={styles.userEmail}>john.doe@furcare.com</Text>
              </View>
            </View>
            <View style={styles.idBadge}>
               <Text style={styles.idBadgeText}>#U001</Text>
            </View>
          </View>

          <View style={styles.userCardBody}>
            <View style={styles.cardDetailRow}>
              <FontAwesome5 name="phone" size={12} color="#a0aec0" style={styles.detailIcon} />
              <Text style={styles.detailText}>(555) 123-4567</Text>
            </View>
            
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: '#e9d8fd' }]}>
                 <Text style={[styles.roleBadgeText, { color: '#553c9a' }]}>Administrator</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#c6f6d5' }]}>
                 <Text style={[styles.statusBadgeText, { color: '#22543d' }]}>Active</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="eye" size={14} color="#4a5568" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="edit" size={14} color="#3182ce" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="archive" size={14} color="#e53e3e" /></TouchableOpacity>
          </View>
        </View>

        {/* User Card 2 */}
        <View style={styles.userCard}>
          <View style={styles.userCardHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JS</Text>
              </View>
              <View>
                <Text style={styles.userName}>Dr. Jane Smith</Text>
                <Text style={styles.userEmail}>jane.smith@furcare.com</Text>
              </View>
            </View>
            <View style={styles.idBadge}>
               <Text style={styles.idBadgeText}>#U002</Text>
            </View>
          </View>

          <View style={styles.userCardBody}>
            <View style={styles.cardDetailRow}>
              <FontAwesome5 name="phone" size={12} color="#a0aec0" style={styles.detailIcon} />
              <Text style={styles.detailText}>(555) 234-5678</Text>
            </View>
            
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: '#bee3f8' }]}>
                 <Text style={[styles.roleBadgeText, { color: '#2a4365' }]}>Veterinarian</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#c6f6d5' }]}>
                 <Text style={[styles.statusBadgeText, { color: '#22543d' }]}>Active</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="eye" size={14} color="#4a5568" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="edit" size={14} color="#3182ce" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="archive" size={14} color="#e53e3e" /></TouchableOpacity>
          </View>
        </View>

        {/* User Card 3 */}
        <View style={styles.userCard}>
          <View style={styles.userCardHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>RB</Text>
              </View>
              <View>
                <Text style={styles.userName}>Dr. Robert Brown</Text>
                <Text style={styles.userEmail}>robert.brown@furcare.com</Text>
              </View>
            </View>
            <View style={styles.idBadge}>
               <Text style={styles.idBadgeText}>#U005</Text>
            </View>
          </View>

          <View style={styles.userCardBody}>
            <View style={styles.cardDetailRow}>
              <FontAwesome5 name="phone" size={12} color="#a0aec0" style={styles.detailIcon} />
              <Text style={styles.detailText}>(555) 567-8901</Text>
            </View>
            
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: '#bee3f8' }]}>
                 <Text style={[styles.roleBadgeText, { color: '#2a4365' }]}>Veterinarian</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#feebc8' }]}>
                 <Text style={[styles.statusBadgeText, { color: '#7b341e' }]}>On Leave</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="eye" size={14} color="#4a5568" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="edit" size={14} color="#3182ce" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}><FontAwesome5 name="archive" size={14} color="#e53e3e" /></TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E5E3E',
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
    fontWeight: '700',
    color: 'white',
    marginRight: 8,
  },
  subtitleBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subtitleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4a5568',
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
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    width: 160,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTitle: {
    color: '#a0aec0',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#2d3748',
  },
  addButton: {
    backgroundColor: '#2E5E3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
    backgroundColor: '#2E5E3E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#2d3748',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#718096',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
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
