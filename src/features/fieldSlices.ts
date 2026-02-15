import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { firebaseAxios } from '@/config/axios';
import type { Field, FieldForm } from '@/types/types';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface FieldsState {
  items: Field[];
  loading: boolean;
  error: string | null;
}

const initialState: FieldsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFields = createAsyncThunk(
  'fields/fetchFields',
  async (filters: { name?: string; type?: string } | undefined, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.name) params.append('name', filters.name);
      if (filters?.type) params.append('type', filters.type);
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}/fields?${queryString}` : `${API_URL}/fields`;
      
      const response = await firebaseAxios.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener las canchas');
    }
  }
);

export const createField = createAsyncThunk(
  'fields/createField',
  async (fieldData: FieldForm, { rejectWithValue }) => {
    try {
      const fieldResponse = await firebaseAxios.post(`${API_URL}/fields`, fieldData);
      const createdField = fieldResponse.data.data;
      
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const times = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
      ];
      
      try {
        const schedulePayload = {
          fieldId: createdField._id || createdField.id,
          days: days,
          times: times
        };
        
        await firebaseAxios.post(`${API_URL}/schedules/bulk`, schedulePayload);
      } catch (scheduleError) {
        console.error('Error al crear horarios (la cancha fue creada exitosamente):', scheduleError);
      }
      
      return createdField;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear la cancha');
    }
  }
);

export const updateField = createAsyncThunk(
  'fields/updateField',
  async ({ id, data }: { id: string; data: Partial<FieldForm> }, { rejectWithValue }) => {
    try {
      const response = await firebaseAxios.patch(`${API_URL}/fields/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar la cancha');
    }
  }
);

export const softDeleteField = createAsyncThunk(
  'fields/softDeleteField',
  async (id: string, { rejectWithValue }) => {
    try {
      await firebaseAxios.patch(`${API_URL}/fields/soft/${id}`, {});
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al desactivar la cancha');
    }
  }
);

const fieldsSlice = createSlice({
  name: 'fields',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFields: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFields.fulfilled, (state, action: PayloadAction<Field[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createField.fulfilled, (state, action: PayloadAction<Field>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateField.fulfilled, (state, action: PayloadAction<Field>) => {
        state.loading = false;
        const index = state.items.findIndex((f) => (f._id || f.id) === (action.payload._id || action.payload.id));
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(softDeleteField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softDeleteField.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        const field = state.items.find((f) => (f._id || f.id) === action.payload);
        if (field) {
          field.isActive = false;
        }
      })
      .addCase(softDeleteField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearFields } = fieldsSlice.actions;

export const selectAllFields = (state: { fields: FieldsState }) => state.fields.items;

export const selectActiveFields = (state: { fields: FieldsState }) => 
  state.fields.items.filter((field) => field.isActive);

export const selectInactiveFields = (state: { fields: FieldsState }) => 
  state.fields.items.filter((field) => !field.isActive);

export const selectFieldsByType = (type: string) => (state: { fields: FieldsState }) => 
  state.fields.items.filter((field) => field.type === type);

export const selectFieldsLoading = (state: { fields: FieldsState }) => state.fields.loading;

export const selectFieldsError = (state: { fields: FieldsState }) => state.fields.error;

export const selectFieldsStats = (state: { fields: FieldsState }) => {
  const items = state.fields.items;
  return {
    total: items.length,
    active: items.filter((field) => field.isActive).length,
    inactive: items.filter((field) => !field.isActive).length,
    byType: {
      cancha5: items.filter((f) => f.type === 'CANCHA 5').length,
      cancha7: items.filter((f) => f.type === 'CANCHA 7').length,
      cancha11: items.filter((f) => f.type === 'CANCHA 11').length,
      padel: items.filter((f) => f.type === 'PADEL').length,
    },
  };
};

export default fieldsSlice.reducer;