import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { firebaseAxios } from '@/config/axios';
import type { Field, FieldForm } from '@/types/types';

const API_URL = import.meta.env.VITE_API_BASE_URL;

console.log('API_URL configurada:', API_URL);

// ============= INTERFACES =============
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

// ============= ASYNC THUNKS =============
export const fetchFields = createAsyncThunk(
  'fields/fetchFields',
  async (filters: { name?: string; type?: string } | undefined, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching fields con filtros:', filters);
      
      const params = new URLSearchParams();
      if (filters?.name) params.append('name', filters.name);
      if (filters?.type) params.append('type', filters.type);
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}/fields?${queryString}` : `${API_URL}/fields`;
      
      console.log('📡 URL de petición:', url);
      
      const response = await firebaseAxios.get(url);
      
      console.log('✅ Respuesta completa de axios:', response);
      console.log('📦 Datos recibidos:', response.data);
      console.log('🏟️ Canchas en response.data.data:', response.data.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error en fetchFields:', error);
      console.error('❌ Error response:', error.response);
      return rejectWithValue(error.response?.data?.message || 'Error al obtener las canchas');
    }
  }
);

export const createField = createAsyncThunk(
  'fields/createField',
  async (fieldData: FieldForm, { rejectWithValue }) => {
    try {
      console.log('➕ Creando cancha con datos:', fieldData);
      
      // Paso 1: Crear la cancha
      const fieldResponse = await firebaseAxios.post(`${API_URL}/fields`, fieldData);
      const createdField = fieldResponse.data.data;
      
      console.log('✅ Cancha creada:', createdField);
      
      // Paso 2: Crear horarios automáticamente (8am a 24pm, domingo a lunes)
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const times = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
      ];
      
      try {
        console.log('📅 Creando horarios para la cancha:', createdField._id || createdField.id);
        
        const schedulePayload = {
          fieldId: createdField._id || createdField.id,
          days: days,
          times: times
        };
        
        console.log('📦 Payload de horarios:', schedulePayload);
        
        const scheduleResponse = await firebaseAxios.post(`${API_URL}/schedules/bulk`, schedulePayload);
        
        console.log('✅ Horarios creados:', scheduleResponse.data);
      } catch (scheduleError: any) {
        console.error('⚠️ Error al crear horarios (la cancha fue creada exitosamente):', scheduleError);
        console.error('⚠️ Detalles:', scheduleError.response?.data);
        // No rechazamos la promesa porque la cancha sí se creó
      }
      
      return createdField;
    } catch (error: any) {
      console.error('❌ Error al crear cancha:', error);
      console.error('❌ Detalles:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Error al crear la cancha');
    }
  }
);

export const updateField = createAsyncThunk(
  'fields/updateField',
  async ({ id, data }: { id: string; data: Partial<FieldForm> }, { rejectWithValue }) => {
    try {
      console.log('✏️ Actualizando cancha ID:', id, 'con datos:', data);
      
      const response = await firebaseAxios.patch(`${API_URL}/fields/${id}`, data);
      
      console.log('✅ Cancha actualizada:', response.data.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error al actualizar cancha:', error);
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar la cancha');
    }
  }
);

export const softDeleteField = createAsyncThunk(
  'fields/softDeleteField',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🗑️ Desactivando cancha ID:', id);
      
      await firebaseAxios.patch(`${API_URL}/fields/soft/${id}`, {});
      
      console.log('✅ Cancha desactivada:', id);
      
      return id;
    } catch (error: any) {
      console.error('❌ Error al desactivar cancha:', error);
      return rejectWithValue(error.response?.data?.message || 'Error al desactivar la cancha');
    }
  }
);

// ============= SLICE =============
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
      // Fetch Fields
      .addCase(fetchFields.pending, (state) => {
        console.log('⏳ Cargando canchas...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFields.fulfilled, (state, action: PayloadAction<Field[]>) => {
        console.log('✅ Canchas cargadas en Redux:', action.payload);
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFields.rejected, (state, action) => {
        console.error('❌ Error al cargar canchas:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Field
      .addCase(createField.pending, (state) => {
        console.log('⏳ Creando cancha...');
        state.loading = true;
        state.error = null;
      })
      .addCase(createField.fulfilled, (state, action: PayloadAction<Field>) => {
        console.log('✅ Cancha creada y agregada a Redux:', action.payload);
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createField.rejected, (state, action) => {
        console.error('❌ Error al crear cancha:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Field
      .addCase(updateField.pending, (state) => {
        console.log('⏳ Actualizando cancha...');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateField.fulfilled, (state, action: PayloadAction<Field>) => {
        console.log('✅ Cancha actualizada en Redux:', action.payload);
        state.loading = false;
        const index = state.items.findIndex((f) => (f._id || f.id) === (action.payload._id || action.payload.id));
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateField.rejected, (state, action) => {
        console.error('❌ Error al actualizar cancha:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Soft Delete Field
      .addCase(softDeleteField.pending, (state) => {
        console.log('⏳ Desactivando cancha...');
        state.loading = true;
        state.error = null;
      })
      .addCase(softDeleteField.fulfilled, (state, action: PayloadAction<string>) => {
        console.log('✅ Cancha desactivada en Redux, ID:', action.payload);
        state.loading = false;
        const field = state.items.find((f) => (f._id || f.id) === action.payload);
        if (field) {
          field.isActive = false;
        }
      })
      .addCase(softDeleteField.rejected, (state, action) => {
        console.error('❌ Error al desactivar cancha:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ============= ACTIONS =============
export const { clearError, clearFields } = fieldsSlice.actions;

// ============= SELECTORS =============
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

// ============= EXPORT REDUCER =============
export default fieldsSlice.reducer;