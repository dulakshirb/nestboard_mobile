import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Heart } from 'lucide-react-native';
import { PropertyAPI } from '../../../api/properties';
import { PropertyItem as PItem } from '../../../types/properties';
import PropertyItem from '../Home/components/PropertyItem';
import { Colors } from '../../../constant/colors';
import Typography from '../../../components/ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const Favorite = () => {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<PItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    PropertyAPI.getFavorites()
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const remove = async (item: PItem) => {
    try {
      await PropertyAPI.toggleFavorite(item.id);
      setFavorites((prev) => prev.filter((f) => f.id !== item.id));
    } catch { }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Typography variant="h1">Favorites</Typography>

      {loading ? (
        <Text style={styles.hint}>Loading favorites...</Text>
      ) : favorites.length === 0 ? (
        <Text style={styles.hint}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View style={styles.itemWrap}>
              <PropertyItem dt={{ item, index } as ListRenderItemInfo<PItem>} />
              <TouchableOpacity
                style={styles.heart}
                onPress={() => remove(item)}
              >
                <Heart
                  size={20}
                  color={Colors.PRIMARY_COLOR}
                  fill={Colors.PRIMARY_COLOR}
                />
              </TouchableOpacity>
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
  heart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 48,
    textAlign: 'center',
    color: Colors.TEXT_GRAY,
  },
});