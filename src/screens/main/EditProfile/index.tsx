import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { AuthAPI } from '../../../api/auth';
import { Colors } from '../../../constant/colors';
import Typography from '../../../components/ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { User } from '../../../types/auth';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const EditProfile = () => {
  const nav: any = useNavigation();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bioTag, setBioTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      Alert.alert('Success', 'Profile updated', [
        { text: 'OK', onPress: () => nav.goBack() },
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ?? 'Could not save profile',
      );
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = () => {
    Alert.alert('Change photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          if (result.assets?.[0]?.uri) {
            await uploadAvatar(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
          if (result.assets?.[0]?.uri) {
            await uploadAvatar(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const uploadAvatar = async (uri: string) => {
    setUploading(true);
    setError(null);
    try {
      const updated = await AuthAPI.uploadAvatar(uri);
      setUser(updated);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ?? 'Could not upload photo',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.SECONDARY_COLOR} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Typography variant="h2">Edit Profile</Typography>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatar} disabled={uploading}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials(user?.displayName || 'U')}</Text>
            )}
            {uploading ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <View style={styles.cameraOverlay}>
                <Camera size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Typography variant="body" color={Colors.TEXT_GRAY}>
              Full Name
            </Typography>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Full name"
              placeholderTextColor={Colors.TEXT_GRAY}
            />
          </View>

          <View style={styles.row}>
            <Typography variant="body" color={Colors.TEXT_GRAY}>
              Email
            </Typography>
            <Typography variant="body">{user?.email ?? '—'}</Typography>
          </View>

          <View style={styles.row}>
            <Typography variant="body" color={Colors.TEXT_GRAY}>
              Bio
            </Typography>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bioTag}
              onChangeText={setBioTag}
              placeholder="Tell tenants about yourself"
              placeholderTextColor={Colors.TEXT_GRAY}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={save}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.WHITE} />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    padding: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 15,
    paddingBottom: 40,
  },
  avatarWrap: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.PRIMARY_COLOR,
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
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.WHITE,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 16,
  },
  row: {
    gap: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_GRAY,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
  },
  saveBtn: {
    borderRadius: 100,
    backgroundColor: Colors.PRIMARY_COLOR,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
