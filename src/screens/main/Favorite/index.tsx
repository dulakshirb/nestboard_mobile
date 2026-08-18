import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Heart, LogIn } from 'lucide-react-native';
import { PropertyAPI } from '../../../api/properties';
import { PropertyItem as PItem } from '../../../types/properties';
import PropertyItem from '../Home/components/PropertyItem';
import { Colors } from '../../../constant/colors';
import Typography from '../../../components/ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/store';
import { logout } from '../../../store/authSlice';
import { removeRefreshToken } from '../../../util/localStorage';
import RegularButton from '../../../components/ui/RegularButton';

const Favorite = () => {
  const insets = useSafeAreaInsets();
  const nav: any = useNavigation();
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isLoggedIn = !!accessToken;
  const favIds = useSelector((state: RootState) => state.favorites.ids);

  const [favorites, setFavorites] = useState<PItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    PropertyAPI.getFavorites()
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useFocusEffect(load);

  const visibleFavorites = useMemo(
    () => favorites.filter((f) => favIds[f.id]),
    [favorites, favIds]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Typography variant="h1">Favorites</Typography>

      {!isLoggedIn ? (
        <View style={styles.emptyWrap}>
          <Heart size={48} color={Colors.BORDER_GRAY} />
          <Typography variant="subtitle" color={Colors.TEXT_GRAY} style={{ marginTop: 12 }}>
            Sign in to view your saved properties
          </Typography>
          <RegularButton
            Icon={<LogIn size={16} color={Colors.WHITE} />}
            text="Sign In"
            onPress={() => { dispatch(logout()); removeRefreshToken(); }}
            marginTop={16}
          />
        </View>
      ) : loading ? (
        <Text style={styles.hint}>Loading favorites...</Text>
      ) : visibleFavorites.length === 0 ? (
        <Text style={styles.hint}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={visibleFavorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View style={styles.itemWrap}>
              <PropertyItem
                dt={{ item, index } as ListRenderItemInfo<PItem>}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 16,
  },
  list: {
    paddingBottom: 24,
    gap: 16,
  },
  itemWrap: {
    position: 'relative',
  },
  hint: {
    marginTop: 48,
    textAlign: 'center',
    color: Colors.TEXT_GRAY,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
});
