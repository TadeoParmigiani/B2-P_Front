import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Field, FieldForm as FieldFormType } from "@/types/types"

interface FieldFormProps {
  editingField: Field | null
  onSubmit: (data: FieldFormType) => void
  onCancel: () => void
}

export function FieldForm({ editingField, onSubmit, onCancel }: FieldFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldFormType>({
    defaultValues: editingField
      ? {
          id: editingField.id,
          name: editingField.name,
          type: editingField.type,
          pricePerHour: editingField.pricePerHour,
          isActive: editingField.isActive,
        }
      : {
          name: "",
          type: "",
          pricePerHour: 0,
          isActive: true,
        },
  })

  const watchType = watch("type")
  const watchIsActive = watch("isActive")

  const onSubmitForm = (data: FieldFormType) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-100">
          Nombre
        </Label>
        <Input
          id="name"
          {...register("name", { required: "El nombre es requerido" })}
          className="bg-zinc-800 border-zinc-700"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-zinc-100">
            Tipo
          </Label>
          <Select
            value={watchType}
            onValueChange={(value) => setValue("type", value, { shouldValidate: true })}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CANCHA 5">Cancha 5</SelectItem>
              <SelectItem value="CANCHA 7">Cancha 7</SelectItem>
              <SelectItem value="CANCHA 11">Cancha 11</SelectItem>
              <SelectItem value="PADEL">Pádel</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-red-500 text-sm">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerHour" className="text-zinc-100">
            Precio/hora ($)
          </Label>
          <Input
            id="pricePerHour"
            type="number"
            {...register("pricePerHour", {
              required: "El precio es requerido",
              min: { value: 1, message: "El precio debe ser mayor a 0" },
              valueAsNumber: true,
            })}
            className="bg-zinc-800 border-zinc-700"
          />
          {errors.pricePerHour && (
            <p className="text-red-500 text-sm">{errors.pricePerHour.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive" className="text-zinc-100">
          Estado
        </Label>
        <Select
          value={watchIsActive ? "true" : "false"}
          onValueChange={(value) => setValue("isActive", value === "true", { shouldValidate: true })}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Activa</SelectItem>
            <SelectItem value="false">Inactiva</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-500 text-zinc-950 hover:bg-green-600">
          {editingField ? "Guardar cambios" : "Crear cancha"}
        </Button>
      </div>
    </form>
  )
}