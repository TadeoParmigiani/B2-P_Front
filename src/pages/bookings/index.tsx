import { useEffect, useMemo, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock3, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BookingStatus } from "@/types/types"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { 
  fetchBookings, 
  selectAllBookings, 
  selectBookingsError, 
  selectBookingsStatus
} from "@/features/bookingSlices"
import { fetchFields, selectAllFields } from "@/features/fieldSlices"

const hours = Array.from({ length: 13 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`)

function getNextHourLabel(hour: string) {
  const hourValue = Number.parseInt(hour.split(":")[0], 10)
  const nextHour = Number.isNaN(hourValue) ? hour : `${(hourValue + 1).toString().padStart(2, "0")}:00`
  return nextHour
}

const today = new Date()

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
  const dispatch = useAppDispatch()
  const bookings = useAppSelector(selectAllBookings) ?? []
  const complexFields = useAppSelector(selectAllFields) ?? []
  const status = useAppSelector(selectBookingsStatus)
  const error = useAppSelector(selectBookingsError)

  const [dayOffset, setDayOffset] = useState(0)

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchFields(undefined))
  }, [dispatch])

  const selectedDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(today.getDate() + dayOffset)
    return d
  }, [dayOffset])

  const selectedDateKey = toDateKey(selectedDate)
  const selectedDateLabel = toCapitalizedDateLabel(selectedDate)

  const fields = useMemo(() => {
    const activeFieldNames = complexFields
      .filter((field) => field.isActive)
      .map((field) => field.name)

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
    const index = new Map()
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

  const loading = status === 'loading'

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="pt-12 lg:pt-0 mb-8 space-y-5">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-3xl lg:text-4xl tracking-tight text-white">
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
          {!loading && bookingsOfDay.map((booking) => (
            <Card
              key={booking.id}
              className="bg-black border border-white/10 shadow-lg"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-green-900/40 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center justify-center shrink-0">
                    <Clock3 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
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
              </CardContent>
            </Card>
          ))}
          {!loading && !bookingsOfDay.length && (
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
                  <div className="h-12 px-1 flex flex-col items-center justify-center border-r border-b border-zinc-800 text-sm font-medium text-zinc-300 text-center leading-tight">
                    <div className="leading-none">{hour}</div>
                    <div className="text-xs text-zinc-500 leading-none">{getNextHourLabel(hour)}</div>
                  </div>
                  {fields.map((field) => {
                    const booking = bookingIndex.get(`${field}-${hour}`)
                    const isOccupied = Boolean(booking)
                    return (
                      <div
                        key={`${field}-${hour}`}
                        className={`h-12 border-b border-zinc-800 text-sm flex items-center justify-center ${
                          isOccupied
                            ? "bg-green-500/10 text-green-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {booking ? getClientShortName(booking.client) : "-"}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}