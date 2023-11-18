'use client';
import {
  createAsyncThunk,
  createListenerMiddleware,
  createSlice,
  isAnyOf,
} from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import generator from 'megalodon';

interface UserState {
  isLoading: boolean;
  accessToken?: string;
  server?: string;
  sns?: 'pleroma' | 'misskey' | 'mastodon' | 'friendica' | null;
  clientId?: string;
  clientSecret?: string;
}

const initialState: UserState =
  typeof window !== 'undefined'
    ? {
        isLoading: false,
        accessToken: localStorage.getItem('accessToken') || undefined,
        server: localStorage.getItem('server') || undefined,
        sns: (localStorage.getItem('sns') as UserState['sns']) || null,
        clientId: localStorage.getItem('clientId') || undefined,
        clientSecret: localStorage.getItem('clientSecret') || undefined,
      }
    : {
        isLoading: false,
        accessToken: undefined,
        server: undefined,
        sns: null,
        clientId: undefined,
        clientSecret: undefined,
      };

export const getUserSNS = createAsyncThunk(
  'user/getUserSNS',
  async (url: string) => {
    return (await (await fetch('/api/detect?server=' + url)).json())
      .result as unknown as
      | 'pleroma'
      | 'misskey'
      | 'mastodon'
      | 'friendica'
      | null;
  }
);

export const getAuthUrl = createAsyncThunk(
  'user/getAuthUrl',
  async (url: string) => {
    return await (await fetch('/api/auth-url?server=' + url)).json();
  }
);

export const getAccessToken = createAsyncThunk(
  'user/getAccessToken',
  async (code: string, { getState }) => {
    const state = getState() as RootState;
    if (
      !state.user.sns ||
      !state.user.server ||
      !state.user.clientId ||
      !state.user.clientSecret
    ) {
      throw new Error('Invalid state');
    }
    const client = generator(state.user.sns, state.user.server);
    return await client.fetchAccessToken(
      state.user.clientId,
      state.user.clientSecret,
      code,
      (process.env.WEBSITE_URL || 'http://localhost:3000') + '/auth/callback'
    );
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('logout');
      state.accessToken = undefined;
      state.clientId = undefined;
      state.clientSecret = undefined;
      state.isLoading = false;
      state.server = undefined;
      state.sns = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('clientId');
        localStorage.removeItem('clientSecret');
        localStorage.removeItem('server');
        localStorage.removeItem('sns');
        window.location.href = '/';
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserSNS.fulfilled, (state, action) => {
      state.sns = action.payload;
    });
    builder.addCase(getAuthUrl.fulfilled, (state, action) => {
      state.clientId = action.payload.clientId;
      state.clientSecret = action.payload.clientSecret;
      state.sns = action.payload.sns;
      state.server = action.payload.server;
      !state.accessToken && (window.location.href = action.payload.url);
    });
    builder.addCase(getAccessToken.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAccessToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isLoading = false;
      window.location.href = '/app';
    });
    builder.addCase(getAccessToken.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const userListenerMiddleware = createListenerMiddleware();

userListenerMiddleware.startListening({
  matcher: isAnyOf(getAuthUrl.fulfilled),
  // store clientId and clientSecret and sns to localStorage
  effect: (dispatch, { getState }) => {
    const state = getState() as RootState;
    if (typeof window !== 'undefined') {
      localStorage.setItem('clientId', state.user.clientId as string);
      localStorage.setItem('clientSecret', state.user.clientSecret as string);
      localStorage.setItem('server', state.user.server as string);
      localStorage.setItem('sns', state.user.sns as string);
    }
  },
});

userListenerMiddleware.startListening({
  matcher: isAnyOf(getAccessToken.fulfilled),
  // store accessToken to localStorage
  effect: (dispatch, { getState }) => {
    const state = getState() as RootState;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', state.user.accessToken as string);
    }
  },
});

export const {} = userSlice.actions;

export default userSlice.reducer;
