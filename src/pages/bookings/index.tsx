import { useEffect, useMemo, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock3, Loader2, Pencil, Phone, User2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchBookings, selectAllBookings, selectBookingsError, selectBookingsStatus, updateBooking } from "@/features/bookingSlices"
import { fetchFields, selectAllFields } from "@/features/fieldSlices"
import { fetchSchedules, selectAllSchedules } from "@/features/schedulesSlices"
import { BookingForm } from "@/components/forms/BookingForm"
import type { Booking } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const hours = Array.from({ length: 16 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`)
const today = new Date()

function getNextHourLabel(hour: string) {
  const hourValue = Number.parseInt(hour.split(":")[0], 10)
  const nextHour = Number.isNaN(hourValue) ? hour : `${(hourValue + 1).toString().padStart(2, "0")}:00`
  return nextHour
}

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

function getClientShortName(client: string) {
  const parts = client.split(" ").filter(Boolean)
  if (!parts.length) return client
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0]}.`
}

export function BookingsPage() {
  const dispatch = useAppDispatch()
  const bookings = useAppSelector(selectAllBookings) ?? []
  const complexFields = useAppSelector(selectAllFields) ?? []
  const schedules = useAppSelector(selectAllSchedules) ?? []
  const status = useAppSelector(selectBookingsStatus)
  const error = useAppSelector(selectBookingsError)

  const [dayOffset, setDayOffset] = useState(0)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchFields(undefined))
    dispatch(fetchSchedules())
  }, [dispatch])

  const selectedDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(today.getDate() + dayOffset)
    return d
  }, [dayOffset])

  const selectedDateKey = toDateKey(selectedDate)
  const selectedDateLabel = toCapitalizedDateLabel(selectedDate)

  const fields = useMemo(() => {
    const activeFieldNames = complexFields.filter((field) => field.isActive).map((field) => field.name)
    if (activeFieldNames.length) return activeFieldNames

    const allFieldNames = complexFields.map((field) => field.name)
    if (allFieldNames.length) return allFieldNames

    const bookingFieldNames = Array.from(new Set(bookings.map((booking) => booking.field)))
    return bookingFieldNames.length ? bookingFieldNames : ["CPrincipal", "C2", "C3", "C5", "C6", "C8"]
  }, [bookings, complexFields])

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

  const loading = status === "loading"

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setIsEditOpen(true)
  }

  const handleSubmitEdit = async (data: Booking & { tel?: string; fieldId?: string; scheduleId?: string }) => {
    if (!editingBooking?.id) return
    await dispatch(updateBooking({ id: editingBooking.id, data }))
    setIsEditOpen(false)
    setEditingBooking(null)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="pt-12 lg:pt-0 mb-8 space-y-5">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-3xl lg:text-4xl tracking-tight text-white">Gestión de Reservas</CardTitle>
          <CardDescription className="text-zinc-400">Visualiza y gestiona las reservas</CardDescription>
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        )}

        <div className="space-y-4">
          {!loading &&
            bookingsOfDay.map((booking) => (
              <Card key={booking.id} className="bg-black border border-white/10 shadow-lg">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-zinc-200">
                        <User2 className="h-4 w-4 text-zinc-400" />
                        <span className="font-semibold">{booking.client}</span>
                        <span className="text-zinc-500">({getClientShortName(booking.client)})</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Phone className="h-4 w-4 text-zinc-500" />
                        <span>{booking.tel || "Sin teléfono"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Clock3 className="h-4 w-4 text-zinc-500" />
                        <span>
                          {booking.startTime} - {booking.endTime}
                        </span>
                        <span className="text-zinc-500">·</span>
                        <span>{booking.field}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="border-zinc-700 text-zinc-200" onClick={() => handleEditBooking(booking)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          {!loading && !bookingsOfDay.length && (
            <Card className="bg-black border border-white/10 shadow-lg">
              <CardContent className="p-6 text-center text-zinc-400">No hay reservas cargadas para esta fecha.</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <CardHeader className="p-0 space-y-1">
          <CardTitle className="text-xl font-bold">Vista de Horarios</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">Disponibilidad por cancha</CardDescription>
        </CardHeader>

        <Card className="bg-zinc-900 border-zinc-800 overflow-x-auto">
          <CardContent className="p-0">
            <div className="grid" style={{ gridTemplateColumns: `90px repeat(${fields.length}, minmax(0,1fr))` }}>
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
                  <div className="h-14 px-2 border-b border-r border-zinc-800 text-xs text-zinc-500 flex items-center justify-center text-center">
                    {hour} - {getNextHourLabel(hour)}
                  </div>

                  {fields.map((field) => {
                    const key = `${field}-${hour}`
                    const booking = bookingIndex.get(key)

                    return (
                      <div key={key} className="h-14 border-b border-zinc-800 p-1">
                        {booking ? (
                          <button
                            type="button"
                            onClick={() => handleEditBooking(booking)}
                            className="w-full h-full rounded-md bg-green-500/15 border border-green-500/30 text-green-300 text-xs px-2 hover:bg-green-500/20"
                          >
                            {booking.client}
                          </button>
                        ) : (
                          <div className="w-full h-full rounded-md bg-zinc-800/40 border border-zinc-800" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Editar reserva</DialogTitle>
          </DialogHeader>

          {editingBooking && (
            <BookingForm
              booking={editingBooking}
              fields={fields}
              schedules={schedules}
              onCancel={() => {
                setIsEditOpen(false)
                setEditingBooking(null)
              }}
              onSubmit={handleSubmitEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}