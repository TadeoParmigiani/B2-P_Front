import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Calendar, ChevronLeft, ChevronRight, Clock3, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Booking, BookingStatus } from "@/types/types"
import { bookingValidationSchema } from "@/components/validations/bookings"

const fields = ["CPrincipal", "C2", "C3", "C5", "C6", "C8"]
const hours = Array.from({ length: 13 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`)

function getNextHourLabel(hour: string) {
  const hourValue = Number.parseInt(hour.split(":")[0], 10)
  const nextHour = Number.isNaN(hourValue) ? hour : `${(hourValue + 1).toString().padStart(2, "0")}:00`
  return nextHour
}

const today = new Date()

const initialBookings: Booking[] = [
  { id: "1", date: toDateKey(today), field: "CPrincipal", client: "Juan Perez", startTime: "16:00", endTime: "17:00", status: "Confirmada" },
  { id: "2", date: toDateKey(today), field: "C2", client: "Maria Garcia", startTime: "17:00", endTime: "18:00", status: "Pendiente" },
  { id: "3", date: toDateKey(today), field: "C3", client: "Carlos Lopez", startTime: "18:00", endTime: "19:00", status: "Cancelada" },
  { id: "4", date: toDateKey(today), field: "C5", client: "Ana Martinez", startTime: "10:00", endTime: "11:00", status: "Confirmada" },
]

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0]
}

function toCapitalizedDateLabel(date: Date) {
  const raw = date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return raw
    .split(" ")
    .map((word) => (word.length ? `${word[0].toUpperCase()}${word.slice(1)}` : word))
    .join(" ")
}

function getStatusBadgeClasses(status: BookingStatus) {
  if (status === "Confirmada") {
    return "bg-green-500/15 text-green-400 border-green-500/30 rounded-full"
  }
  if (status === "Pendiente") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30 rounded-full"
  }
  return "bg-red-500/15 text-red-300 border-red-500/30 rounded-full"
}

function getClientShortName(client: string) {
  const parts = client.split(" ").filter(Boolean)
  if (!parts.length) return client
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0]}.`
}

export function BookingsPage() {
  const [dayOffset, setDayOffset] = useState(0)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<Booking>({
    defaultValues: {
      field: "",
      client: "",
      date: toDateKey(today),
      startTime: hours[0],
      endTime: hours[1],
      status: "Pendiente",
    },
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

  const selectedDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(today.getDate() + dayOffset)
    return d
  }, [dayOffset])

  const selectedDateKey = toDateKey(selectedDate)
  const selectedDateLabel = toCapitalizedDateLabel(selectedDate)

  const bookingsOfDay = useMemo(
    () =>
      bookings
        .filter((booking) => booking.date === selectedDateKey)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings, selectedDateKey]
  )

  const bookingIndex = useMemo(() => {
    const index = new Map<string, Booking>()
    bookingsOfDay.forEach((booking) => {
      const startHour = Number.parseInt(booking.startTime.split(":")[0], 10)
      const endHour = Number.parseInt(booking.endTime.split(":")[0], 10)
      for (let hour = startHour; hour < endHour; hour += 1) {
        const key = `${booking.field}-${hour.toString().padStart(2, "0")}:00`
        index.set(key, booking)
      }
    })
    return index
  }, [bookingsOfDay])

  const openEditDialog = (booking: Booking) => {
    setEditingBookingId(booking.id)
    reset({
      field: booking.field,
      client: booking.client,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    })
    setIsDialogOpen(true)
  }

  const handleSaveBooking = (data: Booking) => {
    if (!editingBookingId) return

    setBookings((prev) =>
      prev.map((booking) => (booking.id === editingBookingId ? { ...booking, ...data } : booking))
    )
    setIsDialogOpen(false)
    setEditingBookingId(null)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingBookingId(null)
    reset({
      field: "",
      client: "",
      date: toDateKey(today),
      startTime: hours[0],
      endTime: hours[1],
      status: "Pendiente",
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="pt-12 lg:pt-0 mb-8 space-y-5">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            Gestión de Reservas
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Visualiza y gestiona las reservas
          </CardDescription>
        </CardHeader>
        <Card className="max-w-2xl mx-auto bg-black border border-zinc-800/80 rounded-2xl shadow-xl">
          <CardContent className="min-h-16 p-0 px-3 sm:px-4 pt-4 pb-4 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDayOffset((prev) => prev - 1)}
              className="text-zinc-200 h-10 w-10 rounded-xl hover:bg-white/10 bg-white/5 flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 flex items-center gap-2 text-zinc-100 font-medium px-2">
              <Calendar className="h-4 w-4 text-green-500 shrink-0" />
              <span>{selectedDateLabel}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDayOffset((prev) => prev + 1)}
              className="text-zinc-200 h-10 w-10 rounded-xl hover:bg-white/10 bg-white/5 flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-5">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl font-extrabold">
            Reservas del día <span className="text-zinc-300">({bookingsOfDay.length})</span>
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {bookingsOfDay.map((booking) => (
            <Card
              key={booking.id}
              className="bg-black border border-white/10 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-12">
                  <div className="flex items-center gap-4 min-w-0 pr-2 sm:pr-4">
                  <div className="w-11 h-11 rounded-full bg-green-900/40 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center justify-center shrink-0">
                    <Clock3 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <Badge variant="outline" className={getStatusBadgeClasses(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">
                      {booking.field} - {booking.client}
                    </p>
                  </div>
                  </div>
                  <CardFooter className="!p-0 !pt-0 self-stretch flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-4 border border-white/10 text-zinc-200 hover:bg-zinc-800 rounded-md"
                      onClick={() => openEditDialog(booking)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </CardFooter>
                </div>
              </CardContent>
            </Card>
          ))}
          {!bookingsOfDay.length && (
            <Card className="bg-black border border-white/10 shadow-lg">
              <CardContent className="p-6 text-center text-zinc-400">
                No hay reservas cargadas para esta fecha.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <CardHeader className="p-0 space-y-1">
          <CardTitle className="text-xl font-bold">Vista de Horarios</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Disponibilidad por cancha
          </CardDescription>
        </CardHeader>
        <Card className="bg-zinc-900 border-zinc-800 overflow-x-auto">
          <CardContent className="p-0 min-w-[780px]">
            <div className="grid grid-cols-[90px_repeat(6,minmax(0,1fr))]">
              <div className="h-12 px-1 flex items-center justify-center border-b border-r border-zinc-800 text-xs text-zinc-500 uppercase text-center">
                Hora
              </div>
              {fields.map((field) => (
                <div
                  key={field}
                  className="h-12 px-1 flex items-center justify-center border-b border-zinc-800 text-xs text-zinc-400 font-semibold text-center"
                >
                  {field}
                </div>
              ))}
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  <div className="h-12 px-1 flex flex-col items-center justify-center border-r border-b border-zinc-800 text-sm font-medium text-zinc-300 text-center leading-tight">
                    <div className="leading-none">{hour}</div>
                    <div className="text-xs text-zinc-500 leading-none">{getNextHourLabel(hour)}</div>
                  </div>
                  {fields.map((field) => {
                    const booking = bookingIndex.get(`${field}-${hour}`)
                    const isOccupied = Boolean(booking)
                    return (
                      <button
                        key={`${field}-${hour}`}
                        type="button"
                        onClick={() => {
                          if (booking) {
                            openEditDialog(booking)
                          }
                        }}
                        className={`h-12 border-b border-zinc-800 text-sm transition-colors ${
                          isOccupied
                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            : "text-zinc-600 hover:bg-zinc-800/60"
                        }`}
                      >
                        {isOccupied ? getClientShortName(booking.client) : "-"}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>Ajusta los datos y guarda los cambios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveBooking)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-field" className="text-zinc-100">
                  Cancha
                </Label>
                <Select value={watch("field")} onValueChange={(value) => setValue("field", value)}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-client" className="text-zinc-100">
                  Cliente
                </Label>
                <Input
                  id="booking-client"
                  {...register("client")}
                  className="bg-zinc-800 border-zinc-700"
                />
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
              </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-status" className="text-zinc-100">
                    Estado
                  </Label>
                <Select
                    value={watch("status")}
                    onValueChange={(value) => setValue("status", value as BookingStatus)}
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-start" className="text-zinc-100">
                    Hora inicio
                  </Label>
                <Select
                    value={watch("startTime")}
                    onValueChange={(value) => setValue("startTime", value)}
                  >
                    <SelectTrigger id="booking-start" className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-end" className="text-zinc-100">
                    Hora fin
                  </Label>
                <Select
                    value={watch("endTime")}
                    onValueChange={(value) => setValue("endTime", value)}
                  >
                    <SelectTrigger id="booking-end" className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.slice(1).map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                      <SelectItem value="21:00">21:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar cambios
                </Button>
              </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}






