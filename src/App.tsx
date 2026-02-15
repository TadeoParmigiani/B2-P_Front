import './App.css'
import { MapPin, Calendar, Users, Clock, CheckCircle2 } from "lucide-react"
import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchFields, selectFieldsStats, selectAllFields } from '@/features/fieldSlices'
import { fetchBookings, selectAllBookings } from '@/features/bookingSlices'

export function App() {
  const dispatch = useAppDispatch()
  
  // Obtener estadísticas de canchas
  const fieldsStats = useAppSelector(selectFieldsStats)
  const allFields = useAppSelector(selectAllFields)
  
  // Obtener todas las reservas
  const allBookings = useAppSelector(selectAllBookings)
  
  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchFields(undefined))
    dispatch(fetchBookings())
  }, [dispatch])
  
  // Calcular estadísticas del dashboard
  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    // Reservas de hoy
    const bookingsToday = allBookings.filter(booking => booking.date === today)
    
    // Reservas de la última semana
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    
    const bookingsThisWeek = allBookings.filter(booking => 
      booking.date >= weekAgoStr && booking.date <= today
    )
    
    // Promedio semanal de reservas
    const avgWeeklyBookings = Math.round(bookingsThisWeek.length)
    
    // Función para calcular el precio de una reserva
    const calculateBookingPrice = (booking: typeof allBookings[0]) => {
      const field = allFields.find(f => 
        f.name === booking.field || (f._id || f.id) === booking.fieldId
      )
      return field?.pricePerHour || 0
    }
    
    // Dinero estimado hoy
    const estimatedRevenueToday = bookingsToday.reduce((total, booking) => {
      return total + calculateBookingPrice(booking)
    }, 0)
    
    return {
      totalFields: fieldsStats.active,
      bookingsTodayCount: bookingsToday.length,
      avgWeeklyBookings,
      estimatedRevenueToday,
      bookingsTodayList: bookingsToday
    }
  }, [allBookings, allFields, fieldsStats])
  
  // Próximas reservas 
  const proximasReservas = useMemo(() => {
    return dashboardStats.bookingsTodayList
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 4)
      .map(booking => ({
        id: booking.id,
        cancha: booking.field,
        hora: `${booking.startTime} - ${booking.endTime}`,
        cliente: booking.client
      }))
  }, [dashboardStats.bookingsTodayList])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="pt-12 lg:pt-0 mb-8 space-y-2">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-400">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Canchas</p>
              <p className="text-3xl font-bold text-white mt-1">{dashboardStats.totalFields}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-zinc-400">Canchas activas</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Reservas Hoy</p>
              <p className="text-3xl font-bold text-white mt-1">{dashboardStats.bookingsTodayCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-zinc-400">Reservas confirmadas</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Reservas Semanales</p>
              <p className="text-3xl font-bold text-white mt-1">{dashboardStats.avgWeeklyBookings}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-zinc-400">Últimos 7 días</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Ingresos Total</p>
              <p className="text-3xl font-bold text-white mt-1">${dashboardStats.estimatedRevenueToday.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-zinc-400">Dinero estimado para hoy</span>
          </div>
        </div>
      </div>

      {/* Próximas Reservas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Próximas Reservas</h2>
          <p className="text-zinc-400 text-sm mt-1">Reservas programadas para hoy</p>
        </div>
        <div className="p-6">
          {proximasReservas.length > 0 ? (
            <div className="space-y-3">
              {proximasReservas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{reserva.cancha}</p>
                      <p className="text-sm text-zinc-400">{reserva.cliente}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{reserva.hora}</p>
                    <p className="text-sm text-green-500">Confirmada</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">No hay reservas programadas para hoy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
