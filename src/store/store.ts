import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import fieldsReducer from "../features/fieldSlices";

// Configuración del store de Redux
export const store = configureStore({
  reducer: {
    // Autenticación y usuario
    auth: authReducer,
    
    // Datos principales
    fields: fieldsReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;