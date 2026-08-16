import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { CalendarCheck, LogOut } from 'lucide-react-native';
import { AuthAPI } from '../../../api/auth';
import { Colors } from '../../../constant/colors';
import Typography from '../../../components/ui/Typography';
import RegularButton from '../../../components/ui/RegularButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/authSlice';
import { removeRefreshToken } from '../../../util/localStorage';
import { useNavigation } from '@react-navigation/native';
import { User } from '../../../types/auth';

const AVATAR_BG = '#C9A87C';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const Profile = () => {
  const nav: any = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bioTag, setBioTag] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AuthAPI.me()
      .then((u) => {
        setUser(u);
        setDisplayName(u.displayName);
        setBioTag(u.bioTag ?? '');
      })
      .catch(() => setError('Could not load profile'));
  }, []);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await AuthAPI.updateProfile({
        displayName,
        bioTag: bioTag.trim() || undefined,
      });
      setUser(updated);
      setEditing(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ?? 'Could not save profile',
      );
    } finally {
      setSaving(false);
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
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials(user.displayName)}</Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Typography variant="body" color={Colors.TEXT_GRAY}>
                Full Name
              </Typography>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Full name"
                />
              ) : (
                <Typography variant="h3">{user.displayName}</Typography>
              )}
            </View>

            <View style={styles.row}>
              <Typography variant="body" color={Colors.TEXT_GRAY}>
                Email
              </Typography>
              <Typography variant="body">{user.email}</Typography>
            </View>

            <View style={styles.row}>
              <Typography variant="body" color={Colors.TEXT_GRAY}>
                Bio
              </Typography>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={bioTag}
                  onChangeText={setBioTag}
                  placeholder="Tell tenants about yourself"
                  multiline
                  maxLength={500}
                />
              ) : (
                <Typography variant="body" color={Colors.TEXT_GRAY}>
                  {user.bioTag || 'No bio yet.'}
                </Typography>
              )}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <RegularButton
              Icon={null}
              text={editing ? 'Save changes' : 'Edit profile'}
              loading={saving}
              onPress={editing ? save : () => setEditing(true)}
              marginTop={16}
            />
          </View>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => nav.navigate('MyBookings')}
          >
            <CalendarCheck size={20} color={Colors.PRIMARY_COLOR} />
            <Typography variant="subtitle">My Bookings</Typography>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={signOut}>
            <LogOut size={20} color="#DC2626" />
            <Typography variant="subtitle" color="#DC2626">
              Sign out
            </Typography>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.hint}>Loading profile...</Text>
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 16,
  },
  avatarWrap: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AVATAR_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    color: Colors.WHITE,
    fontSize: 32,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    backgroundColor: Colors.WHITE,
    padding: 20,
    gap: 16,
  },
  row: {
    gap: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_GRAY,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    minHeight: 40,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
  },
  hint: {
    marginTop: 48,
    textAlign: 'center',
    color: Colors.TEXT_GRAY,
  },
});