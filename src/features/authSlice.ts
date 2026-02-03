import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type Dispatch,
} from "@reduxjs/toolkit";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";
import type { RootState } from "../store/store";

// Define the shape of our user data
export interface AuthUser {
  uid: string;
  email: string | null;
  token: string;
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

// ✅ Función para convertir errores de Firebase a mensajes amigables
const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'Credenciales incorrectas. Verifica tu email y contraseña.',
  }

  return errorMessages[errorCode] || 'Error al iniciar sesión. Intenta nuevamente.'
}

// Register new user
export const registerUser = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/registerUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return {
      uid: user.uid,
      email: user.email,
      token: await user.getIdToken(),
    };
  } catch (error: any) {
    const errorCode = error.code || error.message;
    return rejectWithValue(getFirebaseErrorMessage(errorCode));
  }
});

// Login existing user
export const loginUser = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string; dispatch: Dispatch }
>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        token: await user.getIdToken(),
      };
    } catch (error: any) {
      const errorCode = error.code || error.message;
      return rejectWithValue(getFirebaseErrorMessage(errorCode));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Logout user
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

// Observe Firebase user state
export const observeUser = () => (dispatch: Dispatch) => {
  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    dispatch(setLoading(true));
    if (user) {
      try {
        const token = await user.getIdToken();
        dispatch(setUser({ uid: user.uid, email: user.email, token }));
      } catch (error) {
        console.error("Error al obtener token:", error);
        dispatch(clearUser());
      }
    } else {
      dispatch(clearUser());
    }
    dispatch(setLoading(false));
  });
  
  // Retornar la función de cleanup
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
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al registrar usuario";
      })

      // Login
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
        state.error = action.payload || "Error al iniciar sesión";
      })

      // Logout
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
        state.error = action.payload || "Error al cerrar sesión";
      });
  },
});

export const { setUser, clearUser, setLoading, clearError } = authSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;
export const getAuthState = (state: RootState) => state.auth;
export default authSlice.reducer;