import { useMemo, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock3, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

type BookingStatus = "Confirmada" | "Pendiente" | "Cancelada"

interface Booking {
  id: string
  date: string
  field: string
  client: string
  startTime: string
  endTime: string
  status: BookingStatus
}

interface BookingForm {
  field: string
  client: string
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
}

const fields = ["CPrincipal", "C2", "C3", "C5", "C6", "C8"]
const hours = Array.from({ length: 13 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`)

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
    return "bg-green-500/10 text-green-500 border-green-500/20"
  }
  if (status === "Pendiente") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20"
  }
  return "bg-red-500/10 text-red-500 border-red-500/20"
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
  const [form, setForm] = useState<BookingForm | null>(null)

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
    setForm({
      field: booking.field,
      client: booking.client,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    })
    setIsDialogOpen(true)
  }

  const handleSaveBooking = () => {
    if (!editingBookingId || !form) return

    setBookings((prev) =>
      prev.map((booking) => (booking.id === editingBookingId ? { ...booking, ...form } : booking))
    )
    setIsDialogOpen(false)
    setEditingBookingId(null)
    setForm(null)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingBookingId(null)
    setForm(null)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="pt-12 lg:pt-0 space-y-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Gestion de Reservas</h1>
          <p className="text-zinc-400 mt-1">Visualiza y gestiona las reservas</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800 max-w-2xl mx-auto">
          <CardContent className="py-3 px-3 sm:px-4 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDayOffset((prev) => prev - 1)}
              className="text-zinc-300 hover:bg-zinc-800 h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-zinc-100 font-medium bg-zinc-800/60 border border-zinc-700 rounded-md px-3 py-2">
              <Calendar className="h-4 w-4 text-green-500 shrink-0" />
              <span>{selectedDateLabel}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDayOffset((prev) => prev + 1)}
              className="text-zinc-300 hover:bg-zinc-800 h-9 w-9"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Reservas del dia ({bookingsOfDay.length})</h2>
        <div className="space-y-3">
          {bookingsOfDay.map((booking) => (
            <Card key={booking.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 h-8 px-3 self-center"
                  onClick={() => openEditDialog(booking)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
          {!bookingsOfDay.length && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6 text-center text-zinc-400">
                No hay reservas cargadas para esta fecha.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Vista de Horarios</h2>
          <p className="text-zinc-400 text-sm">Disponibilidad por cancha</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800 overflow-x-auto">
          <CardContent className="p-0 min-w-[780px]">
            <div className="grid grid-cols-[90px_repeat(6,minmax(0,1fr))]">
              <div className="p-3 border-b border-r border-zinc-800 text-xs text-zinc-500 uppercase">Hora</div>
              {fields.map((field) => (
                <div key={field} className="p-3 border-b border-zinc-800 text-xs text-zinc-400 font-semibold">
                  {field}
                </div>
              ))}
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  <div className="p-3 border-r border-b border-zinc-800 text-sm font-medium text-zinc-300">{hour}</div>
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
          {form && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-field" className="text-zinc-100">
                  Cancha
                </Label>
                <Select value={form.field} onValueChange={(value) => setForm((prev) => (prev ? { ...prev, field: value } : prev))}>
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
                  value={form.client}
                  onChange={(event) => setForm((prev) => (prev ? { ...prev, client: event.target.value } : prev))}
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
                    value={form.date}
                    onChange={(event) => setForm((prev) => (prev ? { ...prev, date: event.target.value } : prev))}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-status" className="text-zinc-100">
                    Estado
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((prev) => (prev ? { ...prev, status: value as BookingStatus } : prev))
                    }
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
                    value={form.startTime}
                    onValueChange={(value) => setForm((prev) => (prev ? { ...prev, startTime: value } : prev))}
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
                    value={form.endTime}
                    onValueChange={(value) => setForm((prev) => (prev ? { ...prev, endTime: value } : prev))}
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
                <Button type="button" onClick={handleSaveBooking}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
