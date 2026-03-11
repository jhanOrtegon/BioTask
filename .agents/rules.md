# Reglas Globales de TaskCraft

Este proyecto utiliza **Feature-Sliced Design (FSD)** adaptado para NextJS/Vite con el fin de maximizar la mantenibilidad y **reducir drásticamente el uso de tokens de IA**.

## 🔴 REGLA MAESTRA (Ahorro de Tokens)
**NUNCA** leas el proyecto entero. Si modificas una Feature concreta, **SÓLO** debes referenciar la documentación específica de esa feature que se encuentra en `frontend/.agents/features/[nombre-feature]-agent.md`.
Si quieres entender la arquitectura base, lee `frontend_architecture.md`.

## Estándares del Código
1. **Lenguaje:** TypeScript (`.ts`, `.tsx`). NUNCA uses JavaScript puro.
2. **UI:** Utilizamos Shadcn UI y Tailwind CSS. Si necesitas un componente visual, primero intenta importarlo de `src/shared/ui/`.
   - NUNCA inventes nombres de clases CSS sueltas (como `.btn-primary`). Usa clases de Tailwind.
3. **Estado:** Usamos `Zustand`. Cada "feature" tiene su propio Store independiente en `src/features/[feature]/store.ts`. No uses Context API a menos que sea estrictamente necesario.
4. **Clean Code:** 
   - Funciones cortas y autodescriptivas.
   - Tipado estricto en interfaces en la carpeta `types.ts` de cada feature.
   - Los componentes de UI NO deben tener lógica de negocio pesada, delega la lógica en `utils.ts` o en custom hooks.

## Flujo para resolver un issue:
1. Identifica a qué Feature (`src/features/*`) o pieza compartida (`src/shared/*`) pertenece el cambio.
2. Lee el archivo `-agent.md` correspondiente en `frontend/.agents/`.
3. Edita ÚNICAMENTE los archivos de esa feature.
