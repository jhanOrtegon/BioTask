import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Layers, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export function LoginPage() {
 const login = useAuthStore((state) => state.login)
 const navigate = useNavigate()

 const [username, setUsername] = useState('')
 const [password, setPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [loading, setLoading] = useState(false)

 const handleSubmit = async (e: React.BaseSyntheticEvent) => {
 e.preventDefault()
 setError(null)

 if (!username.trim() || !password.trim()) {
 setError('Por favor ingresa tu usuario y contraseña.')
 return
 }

 setLoading(true)
 await new Promise((resolve) => setTimeout(resolve, 700))

 const ok = login(username.trim(), password)
 setLoading(false)

 if (ok) {
 void navigate('/', { replace: true })
 } else {
 setError('Usuario o contraseña incorrectos. Inténtalo de nuevo.')
 }
 }

 return (
 <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden bg-background">
 {/* Background decoration */}
 <div className="pointer-events-none absolute inset-0">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/[0.04] blur-[120px] rounded-full" />
 <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] rounded-full" />
 {/* Grid pattern */}
 <div 
 className="absolute inset-0 opacity-[0.015]" 
 style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
 />
 </div>

 {/* Brand */}
 <div className="relative mb-10 flex flex-col items-center gap-3 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
 <Layers className="h-6 w-6 text-primary-foreground" />
 </div>
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">BioTask</h1>
 <p className="text-sm text-muted-foreground mt-1">Centro de Comando para Equipos</p>
 </div>
 </div>

 <Card className="relative w-full max-w-sm border-border/50 shadow-xl bg-card/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
 <CardHeader className="pb-4 text-center">
 <CardTitle className="text-xl font-bold">Iniciar sesión</CardTitle>
 <CardDescription>
 Ingresa tus credenciales para continuar
 </CardDescription>
 </CardHeader>

 <CardContent>
 <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-4" noValidate>
 {/* Username */}
 <div className="flex flex-col gap-1.5">
 <Label htmlFor="username" className="text-sm font-medium">
 Usuario
 </Label>
 <Input
 id="username"
 type="text"
 placeholder="Ingresa tu usuario"
 value={username}
 onChange={(e) => {
 setUsername(e.target.value)
 setError(null)
 }}
 autoComplete="username"
 autoFocus
 disabled={loading}
 className="h-10"
 />
 </div>

 {/* Password */}
 <div className="flex flex-col gap-1.5">
 <Label htmlFor="password" className="text-sm font-medium">
 Contraseña
 </Label>
 <div className="relative">
 <Input
 id="password"
 type={showPassword ? 'text' : 'password'}
 placeholder="Ingresa tu contraseña"
 value={password}
 onChange={(e) => {
 setPassword(e.target.value)
 setError(null)
 }}
 autoComplete="current-password"
 disabled={loading}
 className="h-10 pr-10"
 />
 <button
 type="button"
 onClick={() => { setShowPassword((v) => !v); }}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
 tabIndex={-1}
 aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
 <AlertCircle className="h-4 w-4 shrink-0" />
 <span className="font-medium">{error}</span>
 </div>
 )}

 {/* Submit */}
 <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
 {loading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Verificando...
 </>
 ) : (
 'Iniciar sesión'
 )}
 </Button>
 </form>
 </CardContent>
 </Card>

 <p className="relative mt-8 text-xs text-muted-foreground/60">
 © {new Date().getFullYear()} BioTask. Todos los derechos reservados.
 </p>
 </div>
 )
}
