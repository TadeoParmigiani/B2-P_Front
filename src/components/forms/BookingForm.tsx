import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Booking, BookingStatus } from "@/types/types"
import { bookingValidationSchema } from "@/components/validations/bookings"

// Horarios válidos (bloques de 1 hora)
const VALID_SCHEDULES = [
  { value: "08:00", label: "08:00 - 09:00" },
  { value: "09:00", label: "09:00 - 10:00" },
  { value: "10:00", label: "10:00 - 11:00" },
  { value: "11:00", label: "11:00 - 12:00" },
  { value: "12:00", label: "12:00 - 13:00" },
  { value: "13:00", label: "13:00 - 14:00" },
  { value: "14:00", label: "14:00 - 15:00" },
  { value: "15:00", label: "15:00 - 16:00" },
  { value: "16:00", label: "16:00 - 17:00" },
  { value: "17:00", label: "17:00 - 18:00" },
  { value: "18:00", label: "18:00 - 19:00" },
  { value: "19:00", label: "19:00 - 20:00" },
  { value: "20:00", label: "20:00 - 21:00" },
]

interface BookingFormProps {
  booking?: Booking & { fieldId?: string; scheduleId?: string }
  fields: string[]
  schedules: Array<{
    _id: string
    field: { _id: string; name: string }
    time: string
    available: boolean
  }>
  onSubmit: (data: Booking & { tel?: string; fieldId?: string; scheduleId?: string }) => void
  onCancel: () => void
}

export function BookingForm({ booking, fields, onSubmit, onCancel }: BookingFormProps) {
  const [isReady, setIsReady] = useState(false)
  
  const defaultValues = booking ? {
    field: booking.field || "",
    fieldId: booking.fieldId || "",
    client: booking.client || "",
    tel: booking.tel || "",
    date: booking.date || new Date().toISOString().split("T")[0],
    startTime: booking.startTime || "08:00",
    endTime: booking.endTime || "09:00",
    status: booking.status || "Pendiente",
    scheduleId: booking.scheduleId || "",
  } : {
    field: "",
    fieldId: "",
    client: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "09:00",
    status: "Pendiente" as BookingStatus,
    tel: "",
    scheduleId: "",
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Booking & { tel?: string; fieldId?: string; scheduleId?: string }>({
    defaultValues,
    resolver: async (data) => {
      const { error } = bookingValidationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (!error) {
        return { values: data, errors: {} }
      }

      const formErrors: Record<string, { message: string }> = {}

      error.details.forEach((detail) => {
        const path = detail.path.join(".")
        formErrors[path] = {
          message: detail.message,
        }
      })

      return {
        values: {},
        errors: formErrors,
      }
    },
  })

  // Marcar como listo después del primer render
  useEffect(() => {
    setIsReady(true)
  }, [])

  const fieldValue = watch("field")
  const startTimeValue = watch("startTime")
  const statusValue = watch("status")

  console.log("👀 Valores actuales del form:", {
    field: fieldValue,
    startTime: startTimeValue,
    status: statusValue,
    isReady
  })

  // No renderizar hasta estar listo
  if (!isReady) {
    return <div className="p-4 text-center text-zinc-400">Cargando...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="booking-field" className="text-zinc-100">
          Cancha
        </Label>
        <Select 
          value={fieldValue || ""} 
          onValueChange={(value) => {
            console.log("🏟️ Seleccionando cancha:", value)
            setValue("field", value, { shouldValidate: true })
          }}
        >
          <SelectTrigger id="booking-field" className="bg-zinc-800 border-zinc-700">
            <SelectValue placeholder="Seleccionar cancha" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((field) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.field && (
          <p className="text-sm text-red-500">{errors.field.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-client" className="text-zinc-100">
          Cliente
        </Label>
        <Input
          id="booking-client"
          {...register("client")}
          className="bg-zinc-800 border-zinc-700"
          placeholder="Nombre del cliente"
        />
        {errors.client && (
          <p className="text-sm text-red-500">{errors.client.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-tel" className="text-zinc-100">
          Teléfono
        </Label>
        <Input
          id="booking-tel"
          {...register("tel")}
          className="bg-zinc-800 border-zinc-700"
          placeholder="Número de teléfono"
        />
        {errors.tel && (
          <p className="text-sm text-red-500">{errors.tel.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="booking-date" className="text-zinc-100">
            Fecha
          </Label>
          <Input
            id="booking-date"
            type="date"
            {...register("date")}
            className="bg-zinc-800 border-zinc-700"
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-schedule" className="text-zinc-100">
            Horario
          </Label>
          <Select
            value={startTimeValue || ""}
            onValueChange={(value) => {
              console.log("⏰ Seleccionando horario:", value)
              setValue("startTime", value, { shouldValidate: true })
              const startHour = parseInt(value.split(":")[0])
              const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`
              setValue("endTime", endTime)
            }}
          >
            <SelectTrigger id="booking-schedule" className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Seleccionar horario" />
            </SelectTrigger>
            <SelectContent>
              {VALID_SCHEDULES.map((schedule) => (
                <SelectItem key={schedule.value} value={schedule.value}>
                  {schedule.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-status" className="text-zinc-100">
          Estado
        </Label>
        <Select
          value={statusValue || ""}
          onValueChange={(value) => {
            console.log("📊 Seleccionando estado:", value)
            setValue("status", value as BookingStatus, { shouldValidate: true })
          }}
        >
          <SelectTrigger id="booking-status" className="bg-zinc-800 border-zinc-700">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Confirmada">Confirmada</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-500 hover:bg-green-600 text-zinc-950">
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}