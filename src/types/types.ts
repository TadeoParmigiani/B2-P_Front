// src/types/Field.ts

export interface FieldBase {
  name: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
}

// Cancha completa (la que usa FieldsPage)
export interface Field extends FieldBase {
  id: string;
}

// Cancha usada en el modal (crear/editar)
export interface FieldForm extends FieldBase {
  id?: string;
}

export type BookingStatus = "Confirmada" | "Pendiente" | "Cancelada";

export interface Booking {
  id?: string;
  date: string;
  field: string;
  client: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}
