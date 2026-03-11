import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { Layers } from 'lucide-react'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = () => {
    login()
    void navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Layers className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">BioTask Standard Edition</h1>
        <p className="text-sm text-muted-foreground">Generador inteligente de tareas para Jira</p>
      </div>

      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenido de nuevo</CardTitle>
          <CardDescription>
            Inicia sesión para acceder a tus plantillas y tareas
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Modo demostración</span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Sin credenciales requeridas por el momento. La autenticación real con Supabase llegará en la siguiente etapa.
          </p>
        </CardContent>

        <CardFooter>
          <Button onClick={handleLogin} className="w-full" size="lg">
            Entrar al Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
