import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface FavoritesState {
  ids: Record<string, boolean>
}

const initialState: FavoritesState = {
  ids: {},
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.ids[id] = !state.ids[id]
    },
    setFavorite: (state, action: PayloadAction<{ id: string; isFavorite: boolean }>) => {
      state.ids[action.payload.id] = action.payload.isFavorite
    },
    setFavoritesBatch: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.ids = action.payload
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      delete state.ids[action.payload]
    },
  },
})

export const { toggleFavorite, setFavorite, setFavoritesBatch, removeFavorite } = favoritesSlice.actions
export default favoritesSlice.reducer
