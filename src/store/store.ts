import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import fieldsReducer from "../features/fieldSlices";
import bookingsReducer from "../features/bookingSlices";
import schedulesReducer from "../features/schedulesSlices";

// Configuración del store de Redux
export const store = configureStore({
  reducer: {
    // Autenticación y usuario
    auth: authReducer,
    
    // Datos principales
    fields: fieldsReducer,
    bookings: bookingsReducer,
    schedules: schedulesReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
