import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, QrCode } from 'lucide-react-native'
import { Colors } from '../../../../constant/colors'
import RoundButton from '../../../../components/ui/RoundButton'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { logout } from '../../../../store/authSlice'
import { removeRefreshToken } from '../../../../util/localStorage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NotificationsAPI } from '../../../../api/notifications'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'

const Header = () => {

  const nav: any = useNavigation();
  const dispatch = useDispatch();

  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkUnread = useCallback(() => {
    if (!accessToken) return;
    NotificationsAPI.unreadCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => {});
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      checkUnread();
      intervalRef.current = setInterval(checkUnread, 30000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [checkUnread])
  );

  return (
    <View style={[styles.container, {
      paddingTop: insets.top
    }]}>
      <Text style={styles.nest}>
        Nest
        <Text style={
          {
            color: Colors.PRIMARY_COLOR,
            fontSize: 30,
            fontWeight: '700',
          }
        }>Board</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <RoundButton
          Icon={<QrCode color={Colors.SECONDARY_COLOR} size={20} />}
          onPress={() => {
            nav.navigate('QrScan')
          }}
        />
        <RoundButton
          Icon={<Bell color={Colors.SECONDARY_COLOR} size={20} />}
          orangeIndicator={unreadCount > 0}
          badgeCount={unreadCount}
          onPress={() => nav.navigate('Notifications')}
        />
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white'
  },
  nest: {
    color: Colors.SECONDARY_COLOR,
    fontSize: 30,
    fontWeight: '700',
  }
})