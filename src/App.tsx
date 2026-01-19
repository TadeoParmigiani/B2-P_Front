import './App.css'
import { MapPin, Calendar, Users, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

const proximasReservas = [
  { id: 1, cancha: "Cancha Principal", hora: "16:00 - 17:00", cliente: "Juan Pérez" },
  { id: 2, cancha: "Cancha 2", hora: "17:00 - 18:00", cliente: "María García" },
  { id: 3, cancha: "Cancha 3", hora: "18:00 - 19:00", cliente: "Carlos López" },
  { id: 4, cancha: "Cancha Principal", hora: "19:00 - 20:00", cliente: "Ana Martínez" },
]

export function App() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Canchas</p>
              <p className="text-3xl font-bold text-white mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-green-500">6 activas</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Reservas Hoy</p>
              <p className="text-3xl font-bold text-white mt-1">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-zinc-400">Reservas totales</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Ocupación</p>
              <p className="text-3xl font-bold text-white mt-1">78%</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-zinc-400">Promedio semanal</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Dinero supuesto para hoy</p>
              <p className="text-3xl font-bold text-white mt-1">$156</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="text-zinc-400">Total dinero  acumulado</span>
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
        </div>
      </div>
    </div>
  )
}

export default App