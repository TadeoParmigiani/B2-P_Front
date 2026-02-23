import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Field, FieldForm as FieldFormType } from "@/types/types"
import { createFieldValidationSchema, updateFieldValidationSchema } from "@/components/validations/fields"

interface FieldFormProps {
  editingField: Field | null
  onSubmit: (data: FieldFormType) => void
  onCancel: () => void
  loading?: boolean
}

export function FieldForm({ editingField, onSubmit, onCancel, loading }: FieldFormProps) {
  const validationSchema = editingField ? updateFieldValidationSchema : createFieldValidationSchema

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldFormType>({
    defaultValues: {
      name: "",
      type: "CANCHA 5",
      pricePerHour: 0,
      isActive: true,
      description: "",
    },
    resolver: async (data) => {
      const { error } = validationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      })

      if (!error) {
        return { values: data, errors: {} }
      }

      const formErrors: Record<string, { message: string }> = {}
      
      error.details.forEach((detail) => {
        const path = detail.path.join('.')
        formErrors[path] = {
          message: detail.message
        }
      })

      return {
        values: {},
        errors: formErrors,
      }
    },
  })

  // Resetear el formulario cuando cambia editingField
  useEffect(() => {
    if (editingField) {
      setValue("name", editingField.name)
      setValue("type", editingField.type)
      setValue("pricePerHour", editingField.pricePerHour)
      setValue("isActive", editingField.isActive)
      setValue("description", editingField.description || "")
    } else {
      reset({
        name: "",
        type: "CANCHA 5",
        pricePerHour: 0,
        isActive: true,
        description: "",
      })
    }
  }, [editingField, setValue, reset])

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
          {...register("name")}
          className="bg-zinc-800 border-zinc-700 text-white"
          placeholder="Ej: Cancha Principal"
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
            onValueChange={(value) => setValue("type", value as "CANCHA 5" | "CANCHA 7" | "CANCHA 11" | "PADEL", { shouldValidate: true })}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="CANCHA 5" className="text-white">Cancha 5</SelectItem>
              <SelectItem value="CANCHA 7" className="text-white">Cancha 7</SelectItem>
              <SelectItem value="CANCHA 11" className="text-white">Cancha 11</SelectItem>
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
            step="0.01"
            {...register("pricePerHour", { valueAsNumber: true })}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="15000"
          />
          {errors.pricePerHour && (
            <p className="text-red-500 text-sm">{errors.pricePerHour.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-100">
          Descripción
        </Label>
        <Input
          id="description"
          {...register("description")}
          className="bg-zinc-800 border-zinc-700 text-white"
          placeholder="Descripción de la cancha"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive" className="text-zinc-100">
          Estado
        </Label>
        <Select
          value={watchIsActive ? "true" : "false"}
          onValueChange={(value) => setValue("isActive", value === "true", { shouldValidate: true })}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="true" className="text-white">Activa</SelectItem>
            <SelectItem value="false" className="text-white">Inactiva</SelectItem>
          </SelectContent>
        </Select>
        {errors.isActive && (
          <p className="text-red-500 text-sm">{errors.isActive.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-green-500 text-zinc-950 hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Guardando..." : editingField ? "Guardar cambios" : "Crear cancha"}
        </Button>
      </div>
    </form>
  )
}