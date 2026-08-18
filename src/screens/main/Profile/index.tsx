import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { ChevronRight, LogOut } from 'lucide-react-native';
import { AuthAPI } from '../../../api/auth';
import { Colors } from '../../../constant/colors';
import Typography from '../../../components/ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/authSlice';
import { removeRefreshToken } from '../../../util/localStorage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { User } from '../../../types/auth';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const MENU_ITEMS = [
  { key: 'edit', label: 'Edit Profile' },
  { key: 'bookings', label: 'My Bookings' },
  { key: 'payment', label: 'Payment Methods' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'help', label: 'Help and Support' },
] as const;

const Profile = () => {
  const nav: any = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      AuthAPI.me()
        .then(setUser)
        .catch(() => {});
    }, [])
  );

  const handleMenuPress = (key: string) => {
    switch (key) {
      case 'edit':
        nav.navigate('EditProfile');
        break;
      case 'bookings':
        nav.navigate('MyBookings');
        break;
      case 'notifications':
        nav.navigate('Notifications');
        break;
      default:
        break;
    }
  };

  const signOut = () => {
    dispatch(logout());
    removeRefreshToken();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Typography variant="h1">Profile</Typography>

      {user ? (
        <>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials(user.displayName)}</Text>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Typography variant="h2">{user.displayName}</Typography>
                <Typography variant="body" color={Colors.TEXT_GRAY}>
                  {user.email}
                </Typography>
              </View>
            </View>

            <View style={styles.menuSection}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  onPress={() => handleMenuPress(item.key)}
                >
                  <Typography variant="subtitle">{item.label}</Typography>
                  <ChevronRight size={20} color={Colors.TEXT_GRAY} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={[styles.menuRow, styles.menuRowLast]} onPress={signOut}>
                <Typography variant="subtitle">Sign Out</Typography>
                <LogOut size={20} color={Colors.TEXT_GRAY} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <ActivityIndicator size="small" color={Colors.PRIMARY_COLOR} style={{ marginTop: 48 }} />
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 24,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F5F7FA',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  menuSection: {
    paddingTop: 16,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F5F7FA',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
});
