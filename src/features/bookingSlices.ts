import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { firebaseAxios } from "@/config/axios";
import type { Booking } from "@/types/types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface BackendBooking {
  _id: string;
  field: {
    _id: string;
    name: string;
  };
  schedule: {
    _id: string;
    day: string;
    time: string;
  };
  playerName: string;
  tel: string;
  bookingDate: string;
}

interface BookingsState {
  items: Booking[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BookingsState = {
  items: [],
  status: 'idle',
  error: null,
};

function toDateKey(date: string | Date | undefined | null): string {
  if (!date) {
    return new Date().toISOString().split("T")[0];
  }
  
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  
  return date.toISOString().split("T")[0];
}

function computeEndTime(startTime: string | undefined): string {
  if (!startTime) return "09:00";
  
  const startHour = Number.parseInt(startTime.split(":")[0], 10);
  if (Number.isNaN(startHour)) return "09:00";
  return `${(startHour + 1).toString().padStart(2, "0")}:00`;
}

function mapBackendBooking(item: BackendBooking): Booking {
  const startTime = item.schedule?.time || "08:00";
  
  return {
    id: item._id || "",
    date: toDateKey(item.bookingDate),
    field: item.field?.name || "Cancha desconocida",
    client: item.playerName || "Cliente sin nombre",
    startTime: startTime,
    endTime: computeEndTime(startTime),
    status: "Confirmada",
  };
}

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      if (!API_URL) {
        return rejectWithValue("VITE_API_BASE_URL no esta configurada en .env");
      }

      const response = await firebaseAxios.get("/bookings");
      
      if (!response.data?.data || !Array.isArray(response.data.data)) {
        return rejectWithValue("Respuesta invalida del servidor al obtener reservas");
      }

      const mappedBookings = response.data.data.map((item: BackendBooking) => mapBackendBooking(item));
      return mappedBookings;
      
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Error al obtener reservas");
    }
  }
);

export const deleteBooking = createAsyncThunk(
  "bookings/deleteBooking",
  async (id: string, { rejectWithValue }) => {
    try {
      if (!API_URL) {
        return rejectWithValue("VITE_API_BASE_URL no esta configurada en .env");
      }

      await firebaseAxios.delete(`/bookings/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al eliminar reserva");
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearBookingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deleteBooking.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingsError } = bookingsSlice.actions;

export const selectAllBookings = (state: { bookings: BookingsState }) => state.bookings.items;
export const selectBookingsStatus = (state: { bookings: BookingsState }) => state.bookings.status;
export const selectBookingsError = (state: { bookings: BookingsState }) => state.bookings.error;

export default bookingsSlice.reducer;
