import { createSlice, createAsyncThunk, type PayloadAction, type Dispatch} from "@reduxjs/toolkit";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, type User, } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import type { RootState } from "../store/store";
import { firebaseAxios } from "@/config/axios";

export interface AuthUser {
  uid: string;
  email: string | null;
  token: string;
  isAdmin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'Credenciales incorrectas. Verifica tu email y contraseña.',
  }

  return errorMessages[errorCode] || 'Error al iniciar sesión. Intenta nuevamente.'
}


export const loginUser = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string; dispatch: Dispatch }
>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const response = await firebaseAxios.get('/users/verify-admin');
      
      if (!response.data.isAdmin) {
        await signOut(auth);
        return rejectWithValue('No tienes permisos de administrador para acceder a este panel.');
      }

      return {
        uid: user.uid,
        email: user.email,
        token,
        isAdmin: response.data.isAdmin,
      };
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        await signOut(auth);
        return rejectWithValue('No tienes permisos de administrador para acceder a este panel.');
      }
      const errorCode = error.code || error.message;
      return rejectWithValue(getFirebaseErrorMessage(errorCode));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await signOut(auth);
    localStorage.removeItem("token");
  } catch (error: any) {
    return rejectWithValue("Error al cerrar sesión");
  }
});

export const observeUser = () => (dispatch: Dispatch) => {
  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    dispatch(setLoading(true));
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await firebaseAxios.get('/users/verify-admin');
        
        if (!response.data.isAdmin) {
          await signOut(auth);
          dispatch(clearUser());
          dispatch(setLoading(false));
          return;
        }
        
        dispatch(setUser({ 
          uid: user.uid, 
          email: user.email, 
          token,
          isAdmin: response.data.isAdmin 
        }));
      } catch (error) {
        dispatch(clearUser());
      }
    } else {
      dispatch(clearUser());
    }
    dispatch(setLoading(false));
  });
  
  return unsubscribe;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error al iniciar sesión";
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error al cerrar sesión";
      });
  },
});

export const { setUser, clearUser, setLoading, clearError } = authSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;
export const getAuthState = (state: RootState) => state.auth;
export default authSlice.reducer;