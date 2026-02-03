import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Field, FieldForm } from "@/types/fields";
import { FieldModal } from "./fieldModal";

export const FieldsPage = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<FieldForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const mockFields: Field[] = [
      { id: "1", name: "Cancha 1", type: "CANCHA 5", pricePerHour: 100, isActive: true },
      { id: "2", name: "Cancha 2", type: "CANCHA 7", pricePerHour: 150, isActive: true },
      { id: "3", name: "Cancha 3", type: "CANCHA 11", pricePerHour: 200, isActive: false },
    ];
    setFields(mockFields);
  }, []);

  const openCreateModal = () => {
    setSelectedField(null);
    setIsModalOpen(true);
  };

  const openEditModal = (field: Field) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleActive = (id: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, isActive: !f.isActive } : f
      )
    );
  };

  const handleSave = (newField: FieldForm) => {
    if (newField.id) {
      // Editar
      setFields((prev) =>
        prev.map((f) => (f.id === newField.id ? (newField as Field) : f))
      );
    } else {
      // Crear
      const created: Field = {
        ...newField,
        id: crypto.randomUUID(),
      };
      setFields((prev) => [...prev, created]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="relative p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {fields.map((field) => (
        <Card key={field.id} className="border shadow-sm">
          <CardHeader>
            <CardTitle>{field.name}</CardTitle>
          </CardHeader>

          <CardContent>
            <p>Tipo: {field.type}</p>
            <p>Precio por hora: ${field.pricePerHour}</p>
            <p>Estado: {field.isActive ? "Activa" : "Inactiva"}</p>

            <div className="flex gap-2 mt-4">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => openEditModal(field)}
              >
                Editar
              </button>

              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => deleteField(field.id)}
              >
                Eliminar
              </button>

              <button
                className="px-3 py-1 bg-gray-600 text-white rounded"
                onClick={() => toggleActive(field.id)}
              >
                {field.isActive ? "Desactivar" : "Activar"}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full w-14 h-14 shadow-lg text-3xl"
      >
        +
      </button>

      {isModalOpen && (
        <FieldModal
          field={selectedField}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};