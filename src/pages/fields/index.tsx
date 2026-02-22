import { useEffect, useState } from "react"
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
import { Plus, Pencil, MapPin, Loader2 } from "lucide-react"
import type { Field, FieldForm as FieldFormType } from "@/types/types"
import { FieldForm } from "@/components/forms/FieldForm"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { 
  fetchFields, 
  createField, 
  updateField,
  selectAllFields,
  selectFieldsLoading,
  selectFieldsError
} from "@/features/fieldSlices"

export function FieldsPage() {
  const dispatch = useAppDispatch();
  const fields = useAppSelector(selectAllFields);
  const loading = useAppSelector(selectFieldsLoading);
  const error = useAppSelector(selectFieldsError);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  useEffect(() => {
    dispatch(fetchFields());
  }, [dispatch]);

  const handleOpenDialog = (field?: Field) => {
    if (field) {
      setEditingField(field);
    } else {
      setEditingField(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Limpiar el estado cuando se cierra el diálogo
      setEditingField(null);
    }
  };

  const handleFormSubmit = async (data: FieldFormType) => {
    try {
      if (editingField) {
        await dispatch(updateField({ 
          id: editingField._id || editingField.id, 
          data 
        })).unwrap();
      } else {
        await dispatch(createField(data)).unwrap();
      }
      
      setDialogOpen(false);
      setEditingField(null);
    } catch (err: any) {
      console.error("Error al guardar la cancha:", err);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingField(null);
  };

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
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-12 lg:pt-0 mb-8">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-3xl lg:text-4xl tracking-tight text-white">
            Gestión de Canchas
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Administra las canchas del complejo
          </CardDescription>
        </CardHeader>
        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-500 text-zinc-950 hover:bg-green-600"
              onClick={() => handleOpenDialog()}
            >
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

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      )}

      {/* Grid de Canchas */}
      {!loading && fields.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No hay canchas disponibles</p>
        </div>
      )}

      {!loading && fields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fields.map((field) => (
            <Card key={field._id || field.id} className="bg-zinc-900 border-zinc-800 hover:border-green-500/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{field.name}</CardTitle>
                      <CardDescription className="text-zinc-400 text-xs">{field.type}</CardDescription>
                    </div>
                  </div>
                  {getEstadoBadge(field.isActive)}
                </div>
                
                {/* Descripción */}
                {field.description && (
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                    {field.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-green-500 font-semibold text-base">
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
      )}
    </div>
  );
}




