# HANDOFF — Cruz Control Tours (Panel)

Contexto acumulado del proyecto para continuar el trabajo sin volver a preguntar.
**Actualiza este archivo al terminar cada sesión.**

Última actualización: 2026-11-18

## Stack

- **Next.js 15.1** (App Router) + React 19 + TypeScript, puerto **3001** (`dev`/`start` con `-p 3001`).
- **Tailwind CSS v3** + componentes **shadcn/ui** (`src/components/ui/`), tablas con **TanStack Table** (`DataTable` genérico en `src/components/ui/table/`).
- HTTP con **axios** (`src/lib/api-client.ts`), fechas con **moment** (locale `es`), toasts con **react-hot-toast**.
- Estado global con **Redux Toolkit + react-redux** (`src/lib/store/`: `toursSlice` con CRUD completo, `customersSlice` con lista/borrado).
- Login local con **formik + yup** y **bcryptjs** (sin backend de auth, ver "Auth").
- Estructura:
  - `src/app/page.tsx` — login (`/`) con video lateral `/videos/1.mp4` (copiado del front)
  - `src/app/layout.tsx` — layout raíz con `<Toaster />` global (login + panel)
  - `src/app/panel/layout.tsx` — layout protegido (cookie `auth_token`, si no hay redirige a `/`)
  - `src/app/panel/clientes/page.tsx` — tabla de clientes (ver + borrar, sin crear)
  - `src/app/panel/tours/page.tsx` — CRUD de tours (ver, crear, editar, borrar)
  - `src/features/customer/components/customer-table/` — `column.tsx` (columnas) + `customer-table.tsx` (lista con Redux)
  - `src/features/tour/components/tour-table/` — `column.tsx` + `tour-table.tsx` (lista con Redux) + `tour-form-dialog.tsx` (modal crear/editar con validación)
  - `src/services/customer-service.ts` — `getCustomers()`, `deleteCustomer(id)` + tipo `Customer`
  - `src/services/tour-service.ts` — `list/get/create/update/deleteTour` + tipos `Tour`/`NewTourInput` (`price` llega como string)
  - `src/lib/store/` — `store.ts`, `hooks.ts` (`useAppDispatch`, `useAppSelector`), `toursSlice.ts` (thunks `fetchTours`, `createTour`, `updateTour`, `removeTour` + `resetSave`), `customersSlice.ts` (`fetchCustomers`, `removeCustomer`)
  - `src/components/providers.tsx` — monta el store (usado en `panel/layout.tsx`)
  - `src/lib/api-client.ts` — axios con `NEXT_PUBLIC_API_URL`, desenvuelve `{ data }`, `toErrorMessage()`
  - `src/constants/data.ts` — `navItems` (Clientes + Tours)
  - `src/forms/login-form.tsx` — formulario de login (error con `toast.error`, sin `alert`)
  - `src/components/view-dialog.tsx` — `ViewDialog` genérico: modal "Ver detalle" reusable en cualquier tabla (`data` + `fields?` con etiquetas en español; sin `fields` deriva las filas del objeto)
  - `src/components/layouts/` — `app-sidebar.tsx`, `header.tsx`, `user-nav.tsx`, `page-container.tsx`
  - `public/logocruztours.png` — logo e icono (copiado del front)

## Enlace con el backend

- Backend: `http://localhost:3002/api/v1` (var `NEXT_PUBLIC_API_URL`, con ese fallback si falta).
- Endpoints usados: `GET /customers` (lista, ya ordenada DESC por el backend) y `DELETE /customers/:id` (204, con confirmación `window.confirm` + toast); CRUD de tours: `GET/POST /tours`, `GET/PUT/DELETE /tours/:id`.
- Los clientes **solo se crean desde el formulario `/contacto` del front**: el panel no tiene botón de crear, solo lista/busca/borra.
- Misma tabla `customers` que la bandeja `/mensajes` del front (mismo contrato `{ data }`, `mensaje` puede ser `null`).

## Auth

- Login en `/`: usuario fijo `cruzcontroltours@gmail.com` + contraseña de `NEXT_PUBLIC_PASSWORD` (comparada con bcrypt en el cliente).
- Al entrar se crea la cookie `auth_token=fake_token` (24 h); `src/app/panel/layout.tsx` la exige para todo `/panel`. El flag `Secure` se pone solo en https (en `http://localhost` el navegador rechazaría la cookie y la sesión no persistiría).
- ⚠️ La clave viaja en variable `NEXT_PUBLIC_*` (visible en el bundle): es auth temporal, no real. Ver pendientes.

## Decisiones tomadas (NO volver a preguntar)

- **Secciones Clientes + Tours**: los clientes solo se listan/ven/borran (se crean en el front); los tours tienen CRUD completo. No recrear Eventos/Noticias (ver historial).
- Puerto **3001** para no chocar con el front (3000); el backend espera ambos orígenes en `CORS_ORIGINS`.
- Marca **Cruz Control Tours** en todo el panel (título, sidebar, user-nav, favicon `/logocruztours.png`): nada de Fedepatel.
- Búsqueda de la tabla por columna `nombre`; columna "Recibido" con formato `LLL` en español.

## Variables de entorno (`.env.example`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
NEXT_PUBLIC_PASSWORD=cambia-esta-clave
```

## Comandos

```bash
npm run dev    # next dev --turbopack -p 3001
npm run build  # build de producción (verifica tipos)
npm start      # servir el build en 3001
npm run lint   # next lint
```

## Pendientes / recomendaciones

- ⚠️ Auth real contra el backend (hoy la clave está en el bundle y la cookie es un string fijo): cuando el backend agregue login con roles, cambiar `login-form.tsx` y el guard de `panel/layout.tsx`.
- ⚠️ Correr `npm install` en el panel (deps nuevas `@reduxjs/toolkit` y `react-redux` agregadas a `package.json`).
- Revisar deps sin uso tras la limpieza (`formik` solo lo usa el login; `yup`, `cmdk`, `embla-carousel`, `recharts`, `react-google-recaptcha`, `react-select` podrían sobrar).

## Historial de sesiones

### 2026-11-18 (5) — crear tour en página + archivos + select categoría + switch

1. Nuevo `TourForm` compartido (`tour-table/tour-form.tsx`): lo usan la página `/panel/tours/nuevo` (crear, a donde va el botón) y el diálogo (solo editar).
2. Imágenes/videos son `<input type=file multiple>` (accept image/video): suben a S3 al guardar (`services/upload-service.ts` → `POST /uploads`) y se combinan con las existentes (lista con miniaturas y quitar). Categoría es select simple con "Ninguna" (null); Activo es `Switch` propio (`ui/switch.tsx`, sin radix-switch).
3. Sin verificación (el usuario pidió no correr tests/tsc/checks/builds ni tocar probes).

### 2026-11-18 (4) — protocolos con tour (select) + fuera protocolId de tours

1. Protocolos: `tourId` requerido (tipos, columna Tour en tabla, campo en Ver). La tabla carga tours del store y el diálogo trae select `#id — título` (validación: obligatorio; "Sin tours disponibles" si está vacío).
2. Tours: borrado `protocolId` de tipos, formulario y Ver (la relación vive en `protocols.tourId`; ambos FKs rompían el tsc del backend).
3. `tables-verify.tmp.cjs` actualizado (store de prueba incluye `tours`, que la tabla de protocolos ahora lee): 13/13 PASS. tsc: solo pre-existentes + `.next` stale.

### 2026-11-18 (3) — fix filtro userId en reservas + borrada la sección Salidas

1. Reservas pasaba `filterColumn="userId"` sin definir esa columna → error `[Table] Column with id 'userId' does not exist`. Fix: agregada la columna Usuario a `booking/column.tsx`.
2. Borrada la sección Salidas del panel (el usuario la considera redundante con reservas): `features/departure/`, `app/panel/salidas/`, `services/departure-service.ts`, `store/departuresSlice.ts`, registro en `store.ts` y entrada del nav. El backend conserva la tabla y endpoints de departures (para la futura automatización).
3. Nuevo `tables-verify.tmp.cjs` (13/13 PASS): renderiza las 7 tablas restantes y comprueba que cada `filterColumn` exista en sus columnas. tsc: solo los 3 errores pre-existentes de `process`/`require` + 1 referencia a salidas en `.next/types` (caché stale, se regenera solo).

### 2026-11-18 — slices Redux + CRUD de tours en el panel

1. **Store** (`src/lib/store/`): `store.ts`, `hooks.ts`, `toursSlice.ts` (CRUD completo, misma forma que el front tenía) y `customersSlice.ts` (lista/borrado); `src/components/providers.tsx` montado en `panel/layout.tsx`. Deps nuevas: `@reduxjs/toolkit ^2.5.0`, `react-redux ^9.2.0` (falta `npm install`).
2. **Servicio tours** (`src/services/tour-service.ts`): `list/get/create/update/deleteTour` + tipos `Tour`/`NewTourInput`.
3. **Sección /panel/tours**: tabla (título, precio, duración, estado, creado) con Ver (ViewDialog), Editar y Borrar + botón "Crear tour"; crear/editar en `tour-form-dialog.tsx` (modal con validación: título requerido, precio positivo máx. 2 decimales, duración ≥ 1). Nav con Clientes + Tours.
4. **Clientes migrado al slice**: `customer-table.tsx` usa `fetchCustomers`/`removeCustomer`; borrado `src/hooks/use-customers.tsx`.
5. Del front se quitaron `lib/store/toursSlice.ts` y `lib/api/tours.ts` (nadie los usaba): el CRUD de tours vive solo en el panel.
6. ⚠️ No se corrió build, tsc ni lint (el usuario lo hace). Verificación solo por lectura.

### 2026-11-17 (2) — modal Ver dinámico, toast en login y video lateral

1. **ViewDialog** (`src/components/view-dialog.tsx`): modal genérico de detalle para cualquier tabla — recibe la fila (`data`) y config opcional (`fields` con etiqueta + formato; fechas ISO → `LLL` en español, booleanos → Sí/No, vacíos → "—"). Clientes lo usa con campos ID/Nombre/Teléfono/Correo/Mensaje/Recibido; futuras tablas solo definen sus `fields`.
2. Tabla clientes: nueva opción **"Ver cliente"** (icono Eye) en el menú de cada fila; `getColumns(handleDelete, handleView)` y `customer-table.tsx` abre el modal con la fila seleccionada.
3. Login: `alert()` → `toast.error("Correo o contraseña incorrectos.")`; `<Toaster />` movido de `panel/layout.tsx` al layout raíz para que sirva en login y panel sin duplicarse.
4. Login visual: lado izquierdo con video `/videos/1.mp4` (copiado del front, autoplay muted loop) + overlay oscuro y título; borrado `public/colorfull-bg.jpg`.
5. ⚠️ No se corrió build, tsc ni lint (el usuario lo hace). Verificación solo por lectura.

### 2026-11-17 — limpieza, rebranding y enlace con el backend

1. **Borrado** (todo lo de Fedepatel/eventos/noticias): `src/app/panel/eventos/`, `src/app/panel/noticias/`, `src/features/event/`, `src/features/post/`, `src/forms/create-event.tsx`, `src/forms/create-post.tsx`, `src/schemas/`, `src/services/event-service.ts`, `src/services/post-service.ts`, `src/hooks/use-data.tsx`, `src/components/react-select.tsx`, `src/components/reusable-input.tsx`, `src/components/toaster-alert.tsx`, `src/components/icons/` y `public/logo.png`.
2. **Rebranding**: `package.json` → `panel-cruzcontroltours`; título "Cruz Control Tours | Panel", `lang="es"`, favicon `/logocruztours.png` (copiado de `cruzcontroltours-nextjs/public/`); sidebar "Cruz Control Tours / Panel de administración"; user-nav "Administrador Cruz Control Tours / cruzcontroltours@gmail.com"; login con ese usuario y redirect a `/panel/clientes`.
3. **Enlace**: nuevo `src/lib/api-client.ts` (axios + `NEXT_PUBLIC_API_URL`), `src/services/customer-service.ts`, `src/hooks/use-customers.tsx`, feature `customer-table` (columnas nombre/teléfono/correo/mensaje/recibido + borrar) y página `/panel/clientes`; nav con un solo item (Clientes); `.env` + `.env.example` nuevos; dev/start en puerto 3001.
4. Otra sesión en paralelo aportó: versión final de `customer-table.tsx`, cookie `Secure` solo en https (localhost funcionaba sin persistir sesión) y nav/redirect a `/panel/clientes`; se fusionó con el rebranding (correo `cruzcontroltours@gmail.com`, mensajes en español).
5. ⚠️ No se corrió build, tsc ni lint (el usuario lo hace; el sandbox además bloquea `node_modules`). Verificación solo por lectura: imports/exports cruzados revisados.
6. Creado este `HANDOFF.md`.
