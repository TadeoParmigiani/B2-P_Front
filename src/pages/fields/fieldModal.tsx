import { useState, useEffect } from "react";
import type { FieldForm } from "@/types/fields";

interface FieldModalProps {
  field: FieldForm | null;
  onClose: () => void;
  onSave: (field: FieldForm) => void;
}

export const FieldModal = ({ field, onClose, onSave }: FieldModalProps) => {
  const [formData, setFormData] = useState<FieldForm>({
    name: "",
    type: "",
    pricePerHour: 0,
    isActive: true,
  });

  useEffect(() => {
    if (field) {
      setFormData(field);
    }
  }, [field]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "pricePerHour" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.type) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {field ? "Editar cancha" : "Crear nueva cancha"}
        </h2>

        <label className="block mb-2 font-medium">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
        />

        <label className="block mb-2 font-medium">Tipo</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">Seleccionar tipo</option>
          <option value="CANCHA 5">Cancha 5</option>
          <option value="CANCHA 7">Cancha 7</option>
          <option value="CANCHA 11">Cancha 11</option>
          <option value="PADEL">Pádel</option>
        </select>

        <label className="block mb-2 font-medium">Precio por hora</label>
        <input
          type="number"
          name="pricePerHour"
          value={formData.pricePerHour}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
        />

        <label className="block mb-2 font-medium">Estado</label>
        <select
          name="isActive"
          value={formData.isActive ? "true" : "false"}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              isActive: e.target.value === "true",
            }))
          }
          className="w-full border p-2 rounded mb-4"
        >
          <option value="true">Activa</option>
          <option value="false">Inactiva</option>
        </select>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};