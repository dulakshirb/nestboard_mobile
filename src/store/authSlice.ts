import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  refreshToken: string,
  accessToken: string,
  isAuthenticated: boolean,
  authChecked: boolean,
}

const initialState: AuthState = {
  refreshToken: "",
  accessToken: "",
  isAuthenticated: false,
  authChecked: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    saveToken: (state, action: PayloadAction<{
      accessToken: string,
      refreshToken: string,
    }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true;
    },
    initAuth: (state, action: PayloadAction<{
      refreshToken: string | null,
    }>) => {
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true;
      }
      state.authChecked = true;
    },
    logout: (state) => {
      state.refreshToken = ""
      state.accessToken = ""
      state.isAuthenticated = false;
    },
  },
})

export const { saveToken, initAuth, logout } = authSlice.actions

export default authSlice.reducer
