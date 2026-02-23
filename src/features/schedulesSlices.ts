import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { firebaseAxios } from "@/config/axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Schedule {
  _id: string;
  field: {
    _id: string;
    name: string;
  };
  day: string;
  time: string;
  available: boolean;
}

interface SchedulesState {
  items: Schedule[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SchedulesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchSchedules = createAsyncThunk(
  "schedules/fetchSchedules",
  async (_, { rejectWithValue }) => {
    try {
      if (!API_URL) {
        return rejectWithValue("VITE_API_BASE_URL no esta configurada en .env");
      }

      const response = await firebaseAxios.get("/schedules");
      
      if (!Array.isArray(response.data?.data)) {
        return rejectWithValue("Respuesta invalida del servidor al obtener horarios");
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener horarios");
    }
  }
);

const schedulesSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action: PayloadAction<Schedule[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const selectAllSchedules = (state: { schedules: SchedulesState }) => state.schedules.items;

export default schedulesSlice.reducer;