import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Booking } from "@/types/types"
import { bookingValidationSchema } from "@/components/validations/bookings"

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const

function getDayNameFromDate(dateStr: string) {
  if (!dateStr) return "Lunes"

  // yyyy-mm-dd
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-").map(Number)
    const dt = new Date(y, (m || 1) - 1, d || 1)
    if (!Number.isNaN(dt.getTime())) return DAYS[dt.getDay()] ?? "Lunes"
  }

  // dd/mm/yyyy
  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/").map(Number)
    const dt = new Date(y || 2000, (m || 1) - 1, d || 1)
    if (!Number.isNaN(dt.getTime())) return DAYS[dt.getDay()] ?? "Lunes"
  }

  const fallback = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(fallback.getTime())) return "Lunes"
  return DAYS[fallback.getDay()] ?? "Lunes"
}

interface BookingFormProps {
  booking?: Booking & { fieldId?: string; scheduleId?: string }
  fields: string[]
  schedules: Array<{
    _id: string
    field: { _id: string; name: string }
    day: string
    time: string
    available: boolean
  }>
  onSubmit: (data: Booking & { tel?: string; fieldId?: string; scheduleId?: string }) => void
  onCancel: () => void
}

export function BookingForm({ booking, fields, schedules, onSubmit, onCancel }: BookingFormProps) {
  const [isReady, setIsReady] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  type BookingFormValues = Booking & {
    tel?: string
    fieldId?: string
    scheduleId?: string
  }

  const defaultValues: BookingFormValues = booking
    ? {
        field: booking.field || "",
        fieldId: booking.fieldId || "",
        client: booking.client || "",
        tel: booking.tel || "",
        date: booking.date || new Date().toISOString().split("T")[0],
        startTime: booking.startTime || "",
        endTime: booking.endTime || "",
        scheduleId: booking.scheduleId || "",
      }
    : {
        field: "",
        fieldId: "",
        client: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        tel: "",
        scheduleId: "",
      }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    defaultValues,
    resolver: async (data) => {
      const { error } = bookingValidationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (!error) return { values: data, errors: {} }

      const formErrors: Record<string, { message: string }> = {}
      error.details.forEach((detail) => {
        const path = detail.path.join(".")
        formErrors[path] = { message: detail.message }
      })

      return { values: {}, errors: formErrors }
    },
  })

  useEffect(() => {
    setIsReady(true)
  }, [])

  const fieldValue = watch("field")
  const dateValue = watch("date")
  const startTimeValue = watch("startTime")
  const selectedScheduleId = watch("scheduleId")

  // incluir la cancha actual aunque no venga en "fields"
  const fieldOptions = useMemo(() => {
    const base = [...fields]
    if (booking?.field && !base.includes(booking.field)) base.push(booking.field)
    return base
  }, [fields, booking?.field])

  const selectedDay = useMemo(() => getDayNameFromDate(dateValue), [dateValue])

  // hidratar al abrir edición desde scheduleId
  useEffect(() => {
    if (!booking) return
    if (!booking.scheduleId) return

    const currentSchedule = schedules.find((s) => s._id === booking.scheduleId)
    if (!currentSchedule) return

    setValue("field", currentSchedule.field.name, { shouldValidate: true })
    setValue("fieldId", currentSchedule.field._id, { shouldValidate: true })
    setValue("scheduleId", currentSchedule._id, { shouldValidate: true })
    setValue("startTime", currentSchedule.time, { shouldValidate: true })

    const endHour = `${(parseInt(currentSchedule.time.split(":")[0], 10) + 1).toString().padStart(2, "0")}:00`
    setValue("endTime", endHour, { shouldValidate: true })
  }, [booking, schedules, setValue])

  const scheduleOptions = useMemo(() => {
    if (!fieldValue) return []
    return schedules
      .filter((s) => {
        const sameField = s.field.name === fieldValue
        const sameDay = s.day === selectedDay
        const keepCurrent = s._id === booking?.scheduleId
        return sameField && sameDay && (s.available || keepCurrent)
      })
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [schedules, fieldValue, selectedDay, booking?.scheduleId])

  // si no hay seleccionado, tomar el de la reserva o el primero
  useEffect(() => {
    if (!scheduleOptions.length) {
      setValue("scheduleId", "", { shouldValidate: true })
      setValue("startTime", "", { shouldValidate: true })
      setValue("endTime", "", { shouldValidate: true })
      return
    }

    const selected =
      scheduleOptions.find((s) => s._id === selectedScheduleId) ||
      scheduleOptions.find((s) => s._id === booking?.scheduleId) ||
      scheduleOptions.find((s) => s.time === startTimeValue) ||
      scheduleOptions[0]

    setValue("scheduleId", selected._id, { shouldValidate: true })
    setValue("fieldId", selected.field._id, { shouldValidate: true })
    setValue("startTime", selected.time, { shouldValidate: true })

    const endHour = `${(parseInt(selected.time.split(":")[0], 10) + 1).toString().padStart(2, "0")}:00`
    setValue("endTime", endHour, { shouldValidate: true })
  }, [scheduleOptions, selectedScheduleId, booking?.scheduleId, startTimeValue, setValue])

  if (!isReady) {
    return <div className="p-4 text-center text-zinc-400">Cargando...</div>
  }

  const handleFormSubmit = (data: Booking & { tel?: string; fieldId?: string; scheduleId?: string }) => {
    if (!data.fieldId || !data.scheduleId || !data.startTime) {
      setSubmitError("No hay un horario válido para esa cancha y fecha.")
      return
    }
    setSubmitError(null)
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <input type="hidden" {...register("fieldId")} />
      <input type="hidden" {...register("scheduleId")} />

      <div className="space-y-2">
        <Label htmlFor="booking-field" className="text-zinc-100">
          Cancha
        </Label>
        <Select
          value={fieldValue || ""}
          onValueChange={(value) => {
            setValue("field", value, { shouldValidate: true })
            setValue("scheduleId", "", { shouldValidate: true })
            setValue("fieldId", "", { shouldValidate: true })
            setValue("startTime", "", { shouldValidate: true })
            setValue("endTime", "", { shouldValidate: true })
          }}
        >
          <SelectTrigger id="booking-field" className="bg-zinc-800 border-zinc-700">
            <SelectValue placeholder="Seleccionar cancha" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((field) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.field && <p className="text-sm text-red-500">{errors.field.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-client" className="text-zinc-100">
          Cliente
        </Label>
        <Input id="booking-client" {...register("client")} className="bg-zinc-800 border-zinc-700" placeholder="Nombre del cliente" />
        {errors.client && <p className="text-sm text-red-500">{errors.client.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-tel" className="text-zinc-100">
          Teléfono
        </Label>
        <Input id="booking-tel" {...register("tel")} className="bg-zinc-800 border-zinc-700" placeholder="Número de teléfono" />
        {errors.tel && <p className="text-sm text-red-500">{errors.tel.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="booking-date" className="text-zinc-100">
            Fecha
          </Label>
          <Input id="booking-date" type="date" {...register("date")} className="bg-zinc-800 border-zinc-700" />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-schedule" className="text-zinc-100">
            Horario
          </Label>
          <Select
            value={selectedScheduleId || ""}
            onValueChange={(scheduleId) => {
              const selected = scheduleOptions.find((s) => s._id === scheduleId)
              if (!selected) return

              setValue("scheduleId", selected._id, { shouldValidate: true })
              setValue("fieldId", selected.field._id, { shouldValidate: true })
              setValue("startTime", selected.time, { shouldValidate: true })

              const endHour = `${(parseInt(selected.time.split(":")[0], 10) + 1).toString().padStart(2, "0")}:00`
              setValue("endTime", endHour, { shouldValidate: true })
            }}
          >
            <SelectTrigger id="booking-schedule" className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Seleccionar horario" />
            </SelectTrigger>
            <SelectContent>
              {scheduleOptions.map((schedule) => {
                const endHour = `${(parseInt(schedule.time.split(":")[0], 10) + 1).toString().padStart(2, "0")}:00`
                return (
                  <SelectItem key={schedule._id} value={schedule._id}>
                    {schedule.time} - {endHour}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {errors.startTime && <p className="text-sm text-red-500">{errors.startTime.message}</p>}
        </div>
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

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