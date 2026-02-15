import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import fieldsReducer from "../features/fieldSlices";
import bookingsReducer from "../features/bookingSlices";
import schedulesReducer from "../features/schedulesSlices";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fields: fieldsReducer,
    bookings: bookingsReducer,
    schedules: schedulesReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
