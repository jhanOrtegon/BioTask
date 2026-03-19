import { ShieldCheck, Fingerprint, Lock, Key, Eye, UserCheck, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Progress } from '@/shared/components/progress'

export function SecurityPage() {
 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 relative">
 <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
 
 {/* Header Section */}
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
 <div className="space-y-2">
 <Breadcrumbs items={[{ label: 'Configuración' }, { label: 'Centro de Seguridad' }]} />
 <div className="flex items-center gap-4 pt-4">
 <div className="h-14 w-14 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/10 shadow-inner">
 <Fingerprint className="h-8 w-8 text-rose-500" />
 </div>
 <div>
 <h1 className="text-4xl font-semibold tracking-tight text-foreground uppercase">
 Centro de <span className="text-rose-500">Seguridad</span>
 </h1>
 <p className="text-muted-foreground font-bold text-sm mt-1 opacity-60">
 Protección de datos y autenticación biométrica de última generación.
 </p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="px-6 py-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-xs font-medium text-emerald-600">SISTEMA PROTEGIDO</span>
 </div>
 </div>
 </header>

 {/* Security Overview */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <Card className="md:col-span-2 rounded-xl border-rose-500/20 bg-rose-500/[0.03] overflow-hidden relative">
 <CardContent className="p-10 space-y-6">
 <div className="flex justify-between items-start">
 <div className="space-y-2">
 <h2 className="text-2xl font-semibold">Puntaje de Seguridad</h2>
 <p className="text-xs font-bold text-muted-foreground opacity-60">Basado en sus protocolos actuales</p>
 </div>
 <span className="text-5xl font-semibold text-rose-500 lining-nums">98%</span>
 </div>
 <Progress value={98} className="h-3 bg-rose-500/20 rounded-full" />
 <div className="pt-4">
 <Button variant="outline" className="rounded-xl font-bold uppercase text-xs tracking-wide border-rose-500/20 text-rose-600 hover:bg-rose-500/5">
 Fortalecer Protocolo
 </Button>
 </div>
 </CardContent>
 <ShieldCheck className="absolute -bottom-10 -right-10 h-48 w-48 text-rose-500/5 rotate-12" />
 </Card>

 <Card className="rounded-xl border-border/40 bg-card/30 backdrop-blur-sm">
 <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
 <div className="h-16 w-16 rounded-[1.5rem] bg-secondary flex items-center justify-center text-muted-foreground">
 <Lock className="h-8 w-8" />
 </div>
 <div className="space-y-1">
 <h3 className="text-lg font-semibold">2FA Activado</h3>
 <p className="text-xs font-bold text-muted-foreground opacity-60">Segunda capa de verificación robusta.</p>
 </div>
 <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-semibold text-xs ">ACTIVO</Badge>
 </CardContent>
 </Card>

 <Card className="rounded-xl border-border/40 bg-card/30 backdrop-blur-sm">
 <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
 <div className="h-16 w-16 rounded-[1.5rem] bg-secondary flex items-center justify-center text-muted-foreground">
 <Key className="h-8 w-8" />
 </div>
 <div className="space-y-1">
 <h3 className="text-lg font-semibold">Claves API</h3>
 <p className="text-xs font-bold text-muted-foreground opacity-60">Gestione sus tokens de integración.</p>
 </div>
 <Button variant="ghost" className="text-xs font-medium hover:text-primary">Configurar</Button>
 </CardContent>
 </Card>
 </div>

 {/* Security Modules */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div className="md:col-span-2 space-y-8">
 <h3 className="text-xs font-semibold text-muted-foreground/60 pl-4">Registro de Sesiones Activas</h3>
 <div className="space-y-4">
 {[1, 2, 3].map(item => (
 <div key={item} className="flex items-center gap-6 p-6 bg-card/40 border border-border/40 rounded-xl hover:border-primary/20 transition-all cursor-pointer group">
 <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
 <Eye className="h-6 w-6" />
 </div>
 <div className="flex-1">
 <h4 className="text-sm font-semibold">Chrome / MacOS 14.5 (Sonoma)</h4>
 <p className="text-xs font-bold text-muted-foreground uppercase opacity-40">IP: 192.168.1.104 • San Francisco, US • Hace 10 min</p>
 </div>
 <Button variant="ghost" size="sm" className="text-rose-500 font-semibold text-xs ">Cerrar</Button>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-8">
 <h3 className="text-xs font-semibold text-muted-foreground/60 pl-4">Logs Críticos</h3>
 <Card className="rounded-xl border-border/40 bg-card/10 backdrop-blur-sm overflow-hidden">
 <CardContent className="p-0">
 {[1, 2, 3].map(i => (
 <div key={i} className="p-6 flex items-start gap-4 border-b border-border/70 last:border-none hover:bg-secondary/20 transition-colors">
 <div className={i === 1 ? 'text-rose-500' : 'text-amber-500'}>
 {i === 1 ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
 </div>
 <div className="space-y-1">
 <p className="text-xs font-bold leading-tight">
 {i === 1 ? 'Intento fallido de acceso técnico detectado.' : 'Nueva integración API creada por sys-admin.'}
 </p>
 <p className="text-xs font-bold text-muted-foreground opacity-40 ">Hace {i*15} min</p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 
 <div className="p-8 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-4">
 <div className="flex items-center gap-3">
 <UserCheck className="h-5 w-5 text-rose-500" />
 <h4 className="text-sm font-semibold text-rose-700">Auditores Externos</h4>
 </div>
 <p className="text-xs font-bold text-rose-900/40 leading-relaxed italic">
 "Todas las operaciones críticas son auditadas externamente para garantizar la inmutabilidad de los registros de seguridad."
 </p>
 </div>
 </div>
 </div>

 </div>

 <div className="fixed -bottom-48 -right-48 w-[800px] h-[800px] bg-rose-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />
 </div>
 )
}
