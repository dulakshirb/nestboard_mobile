import { View, Text, Pressable, ListRenderItemInfo, ImageBackground } from 'react-native'
import React, { useMemo, useCallback, useRef } from 'react'
import { useNavigation } from '@react-navigation/native';
import { styles } from './PropertyList';
import LinearGradient from 'react-native-linear-gradient';
import { Star, Heart } from 'lucide-react-native';
import { Colors } from '../../../../constant/colors';
import { PropertyItem as PItem } from '../../../../types/properties';
import { PropertyAPI } from '../../../../api/properties';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import { toggleFavorite as toggleFavoriteAction } from '../../../../store/favoritesSlice';

type Props = {
  dt: ListRenderItemInfo<PItem>
}

export const PropertyItem = ({ dt }: Props) => {

  const height = 320;

  const nav: any = useNavigation();
  const styles_ = useMemo(() => styles(height), [height]);
  const dispatch = useDispatch();
  const favTapped = useRef(false);

  const isFav = useSelector(
    (state: RootState) => !!state.favorites.ids[dt.item.id]
  );

  const toggleFavorite = useCallback(() => {
    favTapped.current = true;
    dispatch(toggleFavoriteAction(dt.item.id));
    PropertyAPI.toggleFavorite(dt.item.id).catch(() => {
      dispatch(toggleFavoriteAction(dt.item.id));
    });
  }, [dt.item.id, dispatch]);

  const handleCardPress = useCallback(() => {
    if (favTapped.current) {
      favTapped.current = false;
      return;
    }
    nav.navigate('PropertyDetails', {
      pid: dt.item.id
    });
  }, [nav, dt.item.id]);

  return (
    <Pressable onPress={handleCardPress} style={styles_.propertContainer}>
      <ImageBackground style={styles_.imageBackground} source={
        {
          uri: dt.item.image
        }
      }>
        <Pressable
          onPress={toggleFavorite}
          style={styles_.favoriteButton}
        >
          <Heart
            color={isFav ? Colors.PRIMARY_COLOR : 'white'}
            size={20}
            fill={isFav ? Colors.PRIMARY_COLOR : 'transparent'}
          />
        </Pressable>
        <LinearGradient style={styles_.gradientBackground}
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0,255)']}>
          <View>
            <Text style={{ color: 'white', fontSize: 12, letterSpacing: 0.6 }}>{dt.item.type}</Text>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>{dt.item.title}</Text>
            <Text style={{ color: 'white' }}>{dt.item.location}</Text>
          </View>
          <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>{dt.item.price}</Text>
            <Text style={{ color: 'white' }}>{"Month"}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={styles_.ratingContainer}>
        <Star color={Colors.PRIMARY_COLOR} fill={Colors.PRIMARY_COLOR} />
        <Text style={styles_.ratingText}>{dt.item.rating}</Text>
      </View>
    </Pressable>
  )
}

export default PropertyItem
