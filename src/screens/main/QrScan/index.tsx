import { View, Text, Linking, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useRef } from 'react'
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constant/colors';
import { PropertyAPI } from '../../../api/properties';

const NESTBOARD_PREFIX = 'nestboard://';

const QrScan = () => {
  const device = useCameraDevice('back');
  const nav: any = useNavigation();
  const scanned = useRef(false);

  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && !scanned.current) {
        scanned.current = true;
        const value = codes[0].value ?? '';

        if (value.startsWith(NESTBOARD_PREFIX)) {
          const path = value.slice(NESTBOARD_PREFIX.length);
          const segments = path.split('/').filter(Boolean);

          if (segments[0] === 'property' && segments[1]) {
            const pid = segments[1];
            PropertyAPI.getSingleProperty(pid)
              .then((property) => {
                if (property && 'isActive' in property && !property.isActive) {
                  Alert.alert(
                    'Inactive Property',
                    'This property is currently unavailable.',
                    [{ text: 'OK', onPress: () => { scanned.current = false; } }],
                  );
                } else {
                  nav.replace('PropertyDetails', { pid });
                }
              })
              .catch(() => {
                Alert.alert(
                  'Property Not Found',
                  'This property could not be found.',
                  [{ text: 'OK', onPress: () => { scanned.current = false; } }],
                );
              });
          } else {
            Linking.openURL(value);
          }
        } else if (value.startsWith('http://') || value.startsWith('https://')) {
          Linking.openURL(value);
        } else {
          scanned.current = false;
        }
      }
    },
  });

  if (!hasPermission) return <Text style={styles.msg}>Camera permission required</Text>;
  if (device == null) return <Text style={styles.msg}>No camera device found</Text>;

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      isActive={true}
      codeScanner={codeScanner}
    />
  )
}

export default QrScan;

const styles = StyleSheet.create({
  msg: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Colors.TEXT_GRAY,
    fontSize: 14,
  },
});
