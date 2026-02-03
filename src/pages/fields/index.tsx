
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, MapPin } from "lucide-react"
import type { Field, FieldForm as FieldFormType } from "@/types/types"
import { FieldForm } from "@/components/forms/FieldForm"

const fieldsIniciales: Field[] = [
  { id: "1", name: "Cancha Principal", type: "CANCHA 11", pricePerHour: 150, isActive: true },
  { id: "2", name: "Cancha 2", type: "CANCHA 7", pricePerHour: 100, isActive: true },
  { id: "3", name: "Cancha 3", type: "CANCHA 5", pricePerHour: 80, isActive: true },
  { id: "4", name: "Cancha 4", type: "CANCHA 5", pricePerHour: 80, isActive: false },
  { id: "5", name: "Cancha Pádel 1", type: "PADEL", pricePerHour: 90, isActive: true },
]

export function FieldsPage() {
  const [fields, setFields] = useState<Field[]>(fieldsIniciales)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)

  const handleOpenDialog = (field?: Field) => {
    if (field) {
      setEditingField(field)
    } else {
      setEditingField(null)
    }
    setDialogOpen(true)
  }

  const handleFormSubmit = (data: FieldFormType) => {
    if (editingField) {
      setFields(
        fields.map((f) =>
          f.id === editingField.id
            ? { ...f, ...data, id: editingField.id }
            : f
        )
      )
    } else {
      const newField: Field = {
        id: (Math.max(...fields.map((f) => Number(f.id))) + 1).toString(),
        ...data,
      }
      setFields([...fields, newField])
    }
    setDialogOpen(false)
    setEditingField(null)
  }

  const handleCancel = () => {
    setDialogOpen(false)
    setEditingField(null)
  }

  const getEstadoBadge = (isActive: boolean) => {
    return (
      <Badge
        className={
          isActive
            ? "bg-green-500/10 text-green-500 border-green-500/20"
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }
        variant="outline"
      >
        {isActive ? "Activa" : "Inactiva"}
      </Badge>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-12 lg:pt-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Gestión de Canchas</h1>
          <p className="text-zinc-400 mt-1">Administra las canchas del complejo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 text-zinc-950 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cancha
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingField ? "Editar Cancha" : "Nueva Cancha"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingField ? "Modifica los datos de la cancha" : "Ingresa los datos de la nueva cancha"}
              </DialogDescription>
            </DialogHeader>
            <FieldForm
              editingField={editingField}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Canchas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {fields.map((field) => (
          <Card key={field.id} className="bg-zinc-900 border-zinc-800 hover:border-green-500/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{field.name}</CardTitle>
                    <CardDescription className="text-zinc-400">{field.type}</CardDescription>
                  </div>
                </div>
                {getEstadoBadge(field.isActive)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-green-500 font-semibold">
                  <span>${field.pricePerHour}/hr</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(field)}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}