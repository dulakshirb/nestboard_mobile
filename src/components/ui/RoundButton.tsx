import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native'
import React from 'react'
import { Colors } from '../../constant/colors'
import { Bell } from 'lucide-react-native'

type Props = {
  Icon: any,
  orangeIndicator?: boolean,
  badgeCount?: number,
  onPress?: ((event: GestureResponderEvent) => void) | undefined
}

const RoundButton = ({ Icon, orangeIndicator, badgeCount, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} style={
      {
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
        height: 48,
        borderRadius: 100,
        backgroundColor: 'white',
        elevation: 5,
      }
    }>
      {
        orangeIndicator && (badgeCount === undefined || badgeCount === 0) &&
        <View style={{
          width: 8,
          height: 8,
          borderRadius: 10,
          backgroundColor: Colors.PRIMARY_COLOR,
          position: 'absolute',
          top: 8,
          right: 8
        }}></View>
      }
      {
        badgeCount !== undefined && badgeCount > 0 &&
        <View style={{
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: Colors.PRIMARY_COLOR,
          position: 'absolute',
          top: 4,
          right: 4,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      }
      {Icon}
    </TouchableOpacity>
  )
}

export default RoundButton