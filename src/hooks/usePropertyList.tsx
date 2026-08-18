import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../types/properties";
import { PropertyAPI } from "../api/properties";
import { PropertyType } from "../types/common";
import { setFavoritesBatch } from "../store/favoritesSlice";

export const usePropertyList = (currentPType: PropertyType, range: {
  min: number;
  max: number;
},
  checkedCities: {
    city: string;
    checked: boolean;
  }[],
  triggerFilter: number
) => {

  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 4;
  const [properties, setProperties] = useState<PropertyItem[]>([])

  useEffect(() => {
    fetchFirstBatch();
  }, [currentPType, triggerFilter])

  const syncFavorites = (items: PropertyItem[]) => {
    const batch: Record<string, boolean> = {};
    items.forEach(p => { batch[p.id] = p.isFavorite; });
    dispatch(setFavoritesBatch(batch));
  };

  const fetchFirstBatch = () => {
    setProperties([]);
    setError(null);
    setPage(1)
    PropertyAPI.getAllProperties(1, limit, currentPType, range, checkedCities).then((d) => {
      setProperties(d.data)
      setHasNext(d.meta.hasNextPage)
      syncFavorites(d.data);
      if (d.meta.hasNextPage) {
        setPage(p => p + 1)
      }
    }).catch(() => { setError("Could not load properties. Pull to retry.") })
  }

  const refresh = () => {
    setRefreshing(true);
    setError(null);
    setPage(1);
    PropertyAPI.getAllProperties(1, limit, currentPType, range, checkedCities).then((d) => {
      setProperties(d.data);
      setHasNext(d.meta.hasNextPage);
      syncFavorites(d.data);
      setPage(d.meta.hasNextPage ? 2 : 1);
    }).catch(() => { setError("Could not load properties. Pull to retry.") }).finally(() => setRefreshing(false));
  };

  const fetchNextBatch = () => {
    if (hasNext && !fetching) {
      setFetching(true);
      setTimeout(() => {
        PropertyAPI.getAllProperties(page, limit, currentPType, range, checkedCities).then((d) => {
          setProperties(oldlist => [...oldlist, ...d.data])
          setHasNext(d.meta.hasNextPage)
          setFetching(false);
          if (d.meta.hasNextPage) {
            setPage(p => p + 1)
          }
        }).catch(() => { setFetching(false); })
      }, 0)
    }
  }

  return {
    properties,
    fetchNextBatch,
    fetching,
    refresh,
    refreshing,
    error,
  }

}