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