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
  _id?: string; // MongoDB ID
  name: string;
  type: "CANCHA 5" | "CANCHA 7" | "CANCHA 11" | "PADEL";
  pricePerHour: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cancha usada en el modal (crear/editar)
export interface FieldForm extends FieldBase {
  id?: string;
  name: string;
  type: "CANCHA 5" | "CANCHA 7" | "CANCHA 11" | "PADEL";
  pricePerHour: number;
  isActive: boolean;
  description?: string;
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
