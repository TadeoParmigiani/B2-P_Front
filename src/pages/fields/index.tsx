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
    <div className="relative p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

      {fields.map((field) => (
        <Card
          key={field.id}
          className="border rounded-xl shadow-sm bg-white transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{field.name}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <p><span className="font-semibold">Tipo:</span> {field.type}</p>
            <p><span className="font-semibold">Precio por hora:</span> ${field.pricePerHour}</p>
            <p>
              <span className="font-semibold">Estado:</span>{" "}
              <span className={field.isActive ? "text-green-600" : "text-red-600"}>
                {field.isActive ? "Activa" : "Inactiva"}
              </span>
            </p>

            <div className="flex gap-2 mt-4">
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
                onClick={() => openEditModal(field)}
              >
                Editar
              </button>

              <button
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors"
                onClick={() => deleteField(field.id)}
              >
                Eliminar
              </button>

              <button
                className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded-md shadow-sm transition-colors"
                onClick={() => toggleActive(field.id)}
              >
                {field.isActive ? "Desactivar" : "Activar"}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* FAB */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white 
                   rounded-full w-16 h-16 shadow-xl text-4xl flex items-center justify-center
                   transition-all duration-200 hover:scale-110"
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