import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import type { AppDispatch, RootState } from "@/store/store"
import { loginUser, clearError } from "@/features/authSlice"
import { loginSchema } from "@/components/validations/login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  
  const { user, loading, error } = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormData) => {
    // Validar con Joi
    const { error: joiError } = loginSchema.validate(data, { abortEarly: false })

    if (joiError) {
      joiError.details.forEach((detail) => {
        const field = detail.path[0] as keyof LoginFormData
        setError(field, {
          type: "manual",
          message: detail.message,
        })
      })
      return
    }

    dispatch(loginUser(data))
  }

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md relative z-10 border-zinc-800/50 bg-zinc-900/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
            <span className="text-2xl font-bold text-green-500">B2</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">B2-P</CardTitle>
            <CardDescription className="text-zinc-400">Panel de administración de canchas</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-100">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@b2p.com"
                {...register("email")}
                className={`bg-zinc-800 border-zinc-700 focus:border-green-500 focus:ring-green-500 ${
                  errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-100">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`bg-zinc-800 border-zinc-700 focus:border-green-500 focus:ring-green-500 pr-10 ${
                    errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-500 text-zinc-950 hover:bg-green-600 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
          <p className="text-center text-xs text-zinc-500 mt-6">Sistema de gestión deportiva B2-P</p>
        </CardContent>
      </Card>
    </div>
  )
}