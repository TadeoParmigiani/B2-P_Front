import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Field {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
}

export const FieldsPage = () => {
  // Estado para la lista de canchas
  const [fields, setFields] = useState<Field[]>([]);
  // Estado para la cancha seleccionada
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Simulación de carga de datos (reemplazar con llamada a API real)
  useEffect(() => {
    const mockFields: Field[] = [
      { id: '1', name: 'Cancha 1', type: 'CANCHA 5', pricePerHour: 100, isActive: true },
      { id: '2', name: 'Cancha 2', type: 'CANCHA 7', pricePerHour: 150, isActive: true },
      { id: '3', name: 'Cancha 3', type: 'CANCHA 11', pricePerHour: 200, isActive: false },
    ];
    setFields(mockFields);
  }, []);

  // Función para seleccionar/deseleccionar cancha
  const toggleSelectField = (id: string) => {
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    } else {
      setSelectedFieldId(id);
    }
  };
  
