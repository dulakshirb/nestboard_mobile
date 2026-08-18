import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SplashScreen from '../screens/splash'
import { checkStatus } from '../util/localStorage'
import MainStack from './MainStack'
import { useDispatch, useSelector } from 'react-redux'
import { initAuth } from '../store/authSlice'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { RootState } from '../store/store'

const Stack = createNativeStackNavigator()

const linking: LinkingOptions<any> = {
  prefixes: ['nestboard://'],
  config: {
    screens: {
      MainStack: {
        screens: {
          AppStack: {
            screens: {
              PropertyDetails: 'property/:pid',
              QrScan: 'scan',
            },
          },
        },
      },
    },
  },
}

const RootStack = () => {

  const dispatch = useDispatch();
  const authChecked = useSelector((st: RootState) => st.auth.authChecked);

  useEffect(() => {
    checkStatus()
      .then(refreshToken => {
        dispatch(initAuth({ refreshToken: refreshToken ?? null }));
      })
      .catch(() => {
        dispatch(initAuth({ refreshToken: null }));
      });
  }, [dispatch]);

  if (!authChecked) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={
        {
          headerShown: false
        }
      }
      >
        <Stack.Screen name='MainStack' component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default RootStack
