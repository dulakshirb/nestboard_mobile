import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '../../../../constant/colors'
import { AuthAPI } from '../../../../api/auth'
import { User } from '../../../../types/auth'

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const LocationContainer = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    AuthAPI.me().then(setUser).catch(() => {});
  }, []);

  const displayName = user?.displayName ?? '';
  const city = user ? 'Sri Lanka' : 'Location';

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initials(displayName || 'U')}</Text>
        )}
      </View>

      <View>
        <Text style={{ fontSize: 12, color: Colors.TEXT_GRAY }}>Location</Text>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>
          {user ? `Hello, ${displayName.split(' ')[0]}` : 'Welcome'}
        </Text>
      </View>
    </View>
  )
}

export default LocationContainer

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12
  },
  avatarContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.AVATAR_BACKGROUND,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white'
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 100,
  }
})
