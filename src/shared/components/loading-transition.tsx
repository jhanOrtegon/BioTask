import { useState, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { LoadingScreen } from './loading-screen'

interface LoadingTransitionProps {
 children: ReactNode
}

/**
 * Componente que asegura que la pantalla de carga sea visible 
 * durante un tiempo mínimo para evitar parpadeos y mostrar la marca.
 * Solución al problema de "cargador pegado" evitando cierres prematuros de timers.
 */
export function LoadingTransition({ children }: LoadingTransitionProps) {
 const location = useLocation()
 const [displayLocation, setDisplayLocation] = useState(location)
 
 // Determinamos si la transición está pendiente basándonos en si la ubicación actual
 // es diferente a la que estamos mostrando actualmente en pantalla.
 // Esto evita el warning de "cascading renders" al no llamar a setState en el body del efecto.
 const isPending = location.pathname !== displayLocation.pathname

 useEffect(() => {
 if (isPending) {
 const timer = setTimeout(() => {
 setDisplayLocation(location)
 // Scroll al inicio del contenedor principal
 document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' })
 }, 700) 

 return () => { clearTimeout(timer); }
 }
 }, [isPending, location])

 return (
 <>
 {isPending && <LoadingScreen />}
 <div className={isPending ? "hidden" : "contents"}>
 <div key={displayLocation.pathname} className="contents">
 {children}
 </div>
 </div>
 </>
 )
}
