import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, MapPin} from "lucide-react"
import type { Field, FieldForm } from "@/types/types"

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
  const [formData, setFormData] = useState<FieldForm>({
    name: "",
    type: "",
    pricePerHour: 0,
    isActive: true,
  })

  const handleOpenDialog = (field?: Field) => {
    if (field) {
      setEditingField(field)
      setFormData({
        id: field.id,
        name: field.name,
        type: field.type,
        pricePerHour: field.pricePerHour,
        isActive: field.isActive,
      })
    } else {
      setEditingField(null)
      setFormData({ name: "", type: "", pricePerHour: 0, isActive: true })
    }
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingField) {
      setFields(
        fields.map((f) =>
          f.id === editingField.id
            ? { ...f, ...formData, id: editingField.id }
            : f
        )
      )
    } else {
      const newField: Field = {
        id: (Math.max(...fields.map((f) => Number(f.id))) + 1).toString(),
        ...formData,
      }
      setFields([...fields, newField])
    }
    setDialogOpen(false)
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-100">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-zinc-100">
                    Tipo
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CANCHA 5">Cancha 5</SelectItem>
                      <SelectItem value="CANCHA 7">Cancha 7</SelectItem>
                      <SelectItem value="CANCHA 11">Cancha 11</SelectItem>
                      <SelectItem value="PADEL">Pádel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour" className="text-zinc-100">
                    Precio/hora ($)
                  </Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive" className="text-zinc-100">
                  Estado
                </Label>
                <Select
                  value={formData.isActive ? "true" : "false"}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activa</SelectItem>
                    <SelectItem value="false">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-500 text-zinc-950 hover:bg-green-600">
                  {editingField ? "Guardar cambios" : "Crear cancha"}
                </Button>
              </div>
            </form>
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