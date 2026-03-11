# Agente de Feature: Auth

## Responsabilidad
Esta feature (`src/features/auth/`) controla el estado de autenticación de la aplicación y los guardias de ruta que protegen las páginas internas.

## Contexto de la Feature
- **UI:** Dos componentes de guarda: `GuestRoute` (bloquea `/login` si ya estás autenticado) y `ProtectedRoute` (requiere autenticación para acceder al shell de la app).
- **Estado:** Un booleano `isAuthenticated` administrado con Zustand + persist (`biotask-auth-storage`).
- **Acciones del Store:** `login()` y `logout()`.
- **Página asociada:** `src/pages/LoginPage.tsx`.

## Límites de la IA (Tokens)
- **DEBES** restringir tus lecturas a `src/features/auth/` y ocasionalmente a `src/pages/LoginPage.tsx`.
- **NO LEAS** otras features a menos que exista un bug directo de integración con los guardias de ruta.

## Archivos Clave a Modificar
- `store.ts`: Estado de autenticación y acciones `login`/`logout`.
- `types.ts`: Interface `AuthState`.
- `ui/GuestRoute.tsx`: Redirección de usuarios autenticados fuera de `/login`.
- `ui/ProtectedRoute.tsx`: Protección de rutas internas que requieren sesión activa.
