export interface Field {
  id: string;
  _id?: string;
  name: string;
  type: "CANCHA 5" | "CANCHA 7" | "CANCHA 11" | "PADEL";
  pricePerHour: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldForm {
  id?: string;
  name: string;
  type: "CANCHA 5" | "CANCHA 7" | "CANCHA 11" | "PADEL";
  pricePerHour: number;
  isActive: boolean;
  description?: string;
}

export interface Booking {
  id?: string;
  date: string;
  field: string;
  fieldId?: string;
  client: string;
  startTime: string;
  endTime: string;
  tel?: string;
  scheduleId?: string;
}