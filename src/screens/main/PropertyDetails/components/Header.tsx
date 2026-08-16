import { View, StyleSheet } from 'react-native';
import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react-native';
import { Colors } from '../../../../constant/colors';
import RoundButton from '../../../../components/ui/RoundButton';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import { saveProperty } from '../../../../store/propertySlice';
import { PropertyAPI } from '../../../../api/properties';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PropertyHeader = () => {
  const nav: any = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const currentProperty = useSelector(
    (state: RootState) => state.property.currentProperty,
  );
  const favorited = currentProperty?.isFavorite ?? false;

  const toggleFavorite = async () => {
    if (!currentProperty) return;
    try {
      await PropertyAPI.toggleFavorite(currentProperty.id);
      dispatch(saveProperty({ ...currentProperty, isFavorite: !favorited }));
    } catch { }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <RoundButton
        Icon={<ArrowLeft color={Colors.SECONDARY_COLOR} size={20} />}
        onPress={() => {
          nav.goBack();
        }}
      />
      <View style={{ flex: 1 }}></View>
      <RoundButton
        Icon={
          <Heart
            color={favorited ? Colors.PRIMARY_COLOR : Colors.SECONDARY_COLOR}
            size={20}
            fill={favorited ? Colors.PRIMARY_COLOR : 'transparent'}
          />
        }
        onPress={toggleFavorite}
      />
    </View>
  );
};

export default PropertyHeader;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
  },
});