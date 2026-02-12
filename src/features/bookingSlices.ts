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
}

interface CreateBookingPayload {
  field: string;
  schedule: string;
  playerName: string;
  tel: string;
}

interface UpdateBookingPayload {
  id: string;
  data: {
    field?: string;
    schedule?: string;
    playerName?: string;
    tel?: string;
  };
}

interface BookingsState {
  items: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  items: [],
  loading: false,
  error: null,
};

const weekdayMap: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  "miércoles": 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  "sábado": 6,
};

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function nextDateFromWeekday(weekdayName?: string) {
  const today = new Date();
  const todayWeekday = today.getDay();
  const target = weekdayMap[(weekdayName || "").toLowerCase()] ?? todayWeekday;
  const diff = target - todayWeekday;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result;
}

function computeEndTime(startTime: string) {
  const startHour = Number.parseInt((startTime || "08:00").split(":")[0], 10);
  if (Number.isNaN(startHour)) return "09:00";
  return `${(startHour + 1).toString().padStart(2, "0")}:00`;
}

function mapBackendBooking(item: BackendBooking): Booking {
  const date = nextDateFromWeekday(item.schedule?.day);

  return {
    id: item._id,
    date: toDateKey(date),
    field: item.field?.name || "Cancha",
    client: item.playerName || "",
    startTime: item.schedule?.time || "08:00",
    endTime: computeEndTime(item.schedule?.time || "08:00"),
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
      if (!Array.isArray(response.data?.data)) {
        return rejectWithValue("Respuesta invalida del servidor al obtener reservas");
      }

      return response.data.data.map((item: BackendBooking) => mapBackendBooking(item));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener reservas");
    }
  }
);

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      if (!API_URL) {
        return rejectWithValue("VITE_API_BASE_URL no esta configurada en .env");
      }

      const response = await firebaseAxios.post("/bookings", payload);
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al crear reserva");
    }
  }
);

export const updateBooking = createAsyncThunk(
  "bookings/updateBooking",
  async ({ id, data }: UpdateBookingPayload, { rejectWithValue }) => {
    try {
      if (!API_URL) {
        return rejectWithValue("VITE_API_BASE_URL no esta configurada en .env");
      }

      const response = await firebaseAxios.patch(`/bookings/${id}`, data);
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al actualizar reserva");
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
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingsError } = bookingsSlice.actions;

export const selectAllBookings = (state: { bookings: BookingsState }) => state.bookings.items;
export const selectBookingsLoading = (state: { bookings: BookingsState }) => state.bookings.loading;
export const selectBookingsError = (state: { bookings: BookingsState }) => state.bookings.error;

export default bookingsSlice.reducer;
