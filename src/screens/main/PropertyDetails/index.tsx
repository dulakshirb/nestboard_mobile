import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import ScreenWrapper from './components/ScreenWrapper'
import PropertyDetailsScreen from './components/PropertyDetailsScreen'
import { PropertyAPI } from '../../../api/properties'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import Skeleton from '../../../components/ui/Skeleton'
import { SCREEN_HEIGHT } from '../../../constant/dimentions'
import { saveProperty, saveRoomTypes } from '../../../store/propertySlice'
import Typography from '../../../components/ui/Typography'

const PropertyDetails = () => {

  const route: any = useRoute();
  const nav: any = useNavigation()
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentProperty = useSelector((state: RootState) => state.property.currentProperty)
  const roomTypes = useSelector((state: RootState) => state.property.roomType)

  const fetchProperty = async () => {
    try {
      setError(null);
      const [propertyData, roomData] = await Promise.all([
        PropertyAPI.getSingleProperty(route.params.pid),
        PropertyAPI.getPropertyRoomTypes(route.params.pid),
      ]);
      dispatch(saveProperty(propertyData));
      dispatch(saveRoomTypes(roomData));
    } catch {
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProperty();
    }, [route.params.pid]),
  );

  const totalFreeSeats = (roomTypes ?? []).reduce((sum, rt) => sum + rt.freeSeats, 0);
  const minPrice = (roomTypes ?? []).reduce((min, rt) => {
    const p = Number(rt.pricePerMonth);
    return p > 0 && (min === 0 || p < min) ? p : min;
  }, 0);
  const priceFrom = minPrice > 0 ? `LKR ${(minPrice / 1000).toFixed(minPrice % 1000 === 0 ? 0 : 1)}K` : '-';

  if (error) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Typography variant="body">{error}</Typography>
          <Typography
            variant="body"
            onPress={fetchProperty}
            style={{ marginTop: 12, color: '#F7C948', fontWeight: '600' }}
          >
            Retry
          </Typography>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {
        currentProperty && !loading ?
          <PropertyDetailsScreen
            title={currentProperty.title}
            address={currentProperty.address}
            badges={[...currentProperty.amenities]}
            stats={{ seatsAvailable: totalFreeSeats, minStayMonths: currentProperty.minStay, priceFrom }}
            rooms={roomTypes ?? []}
            propertyId={currentProperty.id}
            onViewRooms={(id, name) => {
              nav.navigate('RoomTypeDetails', {
                roomTypeId: id,
                roomTypeName: name,
                location: currentProperty.address
              })
            }}
          />
          :
          <Skeleton height={SCREEN_HEIGHT * 0.55} style={{ marginTop: '90%' }} width={'100%'} />
      }
    </ScreenWrapper>
  )
}

export default PropertyDetails