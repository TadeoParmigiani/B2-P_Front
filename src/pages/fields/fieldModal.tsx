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
    if (field) setFormData(field);
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">

        <h2 className="text-xl font-bold mb-4">
          {field ? "Editar cancha" : "Crear nueva cancha"}
        </h2>

        <div className="space-y-4">

          <div>
            <label className="block mb-1 font-medium">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-green-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-green-500 outline-none transition"
            >
              <option value="">Seleccionar tipo</option>
              <option value="CANCHA 5">Cancha 5</option>
              <option value="CANCHA 7">Cancha 7</option>
              <option value="CANCHA 11">Cancha 11</option>
              <option value="PADEL">Pádel</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Precio por hora</label>
            <input
              type="number"
              name="pricePerHour"
              value={formData.pricePerHour}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-green-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Estado</label>
            <select
              name="isActive"
              value={formData.isActive ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.value === "true",
                }))
              }
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-green-500 outline-none transition"
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
};