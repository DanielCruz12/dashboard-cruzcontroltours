# HANDOFF — Cruz Control Tours (Panel)

Contexto acumulado del proyecto para continuar el trabajo sin volver a preguntar.
**Actualiza este archivo al terminar cada sesión.**

Última actualización: 2026-11-25

## Stack

- **Next.js 15.1** (App Router) + React 19 + TypeScript, puerto **3001** (`dev`/`start` con `-p 3001`).
- **Tailwind CSS v3** + componentes **shadcn/ui** (`src/components/ui/`), tablas con **TanStack Table** (`DataTable` genérico en `src/components/ui/table/`).
- HTTP con **axios** (`src/lib/api-client.ts`), fechas con **moment** (locale `es`), toasts con **react-hot-toast**.
- Estado global con **Redux Toolkit + react-redux** (`src/lib/store/`: slices por entidad con CRUD).
- Auth real contra el backend (JWT + roles, ver "Auth").
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
- Endpoints usados: `GET /customers` (lista, ya ordenada DESC por el backend) y `DELETE /customers/:id` (204, con confirmación `ConfirmDialog` + toast); CRUD de tours: `GET/POST /tours`, `GET/PUT/DELETE /tours/:id`.
- Los clientes **solo se crean desde el formulario `/contacto` del front**: el panel no tiene botón de crear, solo lista/busca/borra.
- Misma tabla `customers` que la bandeja `/mensajes` del front (mismo contrato `{ data }`, `mensaje` puede ser `null`).

## Auth

- Login en `/` contra `POST /auth/login` (`services/auth-service.ts`): guarda JWT + usuario en localStorage y cookie `auth_token` (12 h). El flag `Secure` se pone solo en https (en `http://localhost` el navegador rechazaría la cookie y la sesión no persistiría).
- `src/app/panel/layout.tsx` exige la cookie para todo `/panel`; `api-client` adjunta el Bearer y ante un 401 limpia la sesión y vuelve al login.
- Roles (`src/lib/session.ts`, hook `useSession`): `host` solo lectura (sin crear/editar/borrar en las 7 tablas), `admin` CRUD de contenido, `superadmin` además gestiona `/panel/usuarios` (único en el nav con `roles`, página blindada con `RequireRole`).
- Usuarios iniciales (seed del backend): `superadmin@` / `admin@` / `host@cruzcontroltours.com`.

## Decisiones tomadas (NO volver a preguntar)

- **Secciones Clientes + Tours**: los clientes solo se listan/ven/borran (se crean en el front); los tours tienen CRUD completo. No recrear Eventos/Noticias (ver historial).
- Puerto **3001** para no chocar con el front (3000); el backend espera ambos orígenes en `CORS_ORIGINS`.
- Marca **Cruz Control Tours** en todo el panel (título, sidebar, user-nav, favicon `/logocruztours.png`): nada de Fedepatel.
- Búsqueda de la tabla por columna `nombre`; columna "Recibido" con formato `LLL` en español.

## Variables de entorno (`.env.example`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
```

## Comandos

```bash
npm run dev    # next dev --turbopack -p 3001
npm run build  # build de producción (verifica tipos)
npm start      # servir el build en 3001
npm run lint   # next lint
```

## Pendientes / recomendaciones

- ⚠️ Correr `npm install` en el panel (deps nuevas `@reduxjs/toolkit` y `react-redux` agregadas a `package.json`).
- `bcryptjs` y `formik` solo los usa el login (formik) o nada (bcryptjs ya no): candidatos a limpieza junto a `yup`, `cmdk`, `embla-carousel`, `recharts`, `react-google-recaptcha`, `react-select`.
- Revisar deps sin uso tras la limpieza (`formik` solo lo usa el login; `yup`, `cmdk`, `embla-carousel`, `recharts`, `react-google-recaptcha`, `react-select` podrían sobrar).

## Historial de sesiones

### 2026-11-25 (2) — ajustes al rediseño + cards en Reservas/Despachos

1. Sidebar sin campana de notificaciones ni filas Search/Home (el workspace conserva "Ir al inicio" en su menú).
2. Fuente revertida a la anterior (fuera el `fontFamily` de Geist del `tailwind.config.ts`); tamaños y resto del diseño intactos.
3. Nuevo `components/stat-card.tsx` (icono + etiqueta + valor + detalle) y resúmenes calculados desde el store: `booking-summary-cards.tsx` (total, ingresos cobrados, personas, pendientes con monto por cobrar) y `rental-summary-cards.tsx` (total, hoy por fecha local, en ruta, completados con %). Renderizados encima de cada tabla; sin datos inventados.
4. Sin verificación (el usuario corre lint/build/tsc/migraciones/tests). Revisado por lectura.

### 2026-11-25 — rediseño SaaS minimalista tipo Linear/Refero (solo diseño)

1. Tokens en `globals.css`: acento `#2F44E0` (`--primary`/`--ring`), bordes `#EAEAEA`, sidebar `#F7F7F8`, hover `#F1F1F2`, base 14px, foco visible azul, gráficas en escala de azules; Geist como `font-sans` en `tailwind.config.ts` (antes la variable se cargaba pero no se aplicaba).
2. Sidebar (`layouts/app-sidebar.tsx`, 240px vía `ui/sidebar.tsx`): selector de espacio (logo 20px + nombre + chevron con menú real), campana (toast) y avatar (`UserNav`); Search (enfoca el filtro de la tabla), Home (`/panel/clientes`, destino del login); grupos "Favoritos" (Tours/Reservas/Clientes) y "Principal" (módulos con filtro de roles intacto); botón azul "+ Nuevo" (dropdown a los 4 `/nuevo`, solo `canWrite`); tarjeta fija abajo (estado + rol, Upgrade con toast, Ayuda → faqs, Salir con logout real). Activo `#EBEBEC` + radio 8px + `aria-current`; transición de fondo 120ms; móvil sigue con Sheet.
3. Header sin UserNav (vive en el sidebar): breadcrumbs grises con títulos en español (nav + Nuevo/Editar + `#shortId`) y último nivel en negro con chevron; solo enlazan raíces de sección existentes; borde inferior, sin sombras.
4. Área principal blanca con padding 32px (`page-container.tsx`); `Button` primario azul h-10 radio 8px sin sombras; `Card` borde `#EAEAEA` radio 12px sin sombra; títulos (`Heading`, `CardTitle`, `DialogTitle`) en `font-medium`; tooltip de gráficas oscuro y pequeño + ejes mínimos.
5. `components/welcome-dialog.tsx` nuevo: 480px, radio 20px, padding 24px, overlay claro con `blur(6px)`, una sola vez por navegador (`localStorage cct-welcomed`), focus trap + Esc de Radix, animación fade + scale .96→1 en 200ms. Montado en `panel/layout.tsx`.
6. Animaciones solo transform/opacity: fade-up con escalonado 60ms (`rise-group` en PageContainer y DataTable, `rise` en Card/ChartContainer), barras crecen desde 0 con la animación nativa de recharts, `prefers-reduced-motion` las desactiva.
7. Sin verificación (el usuario corre lint/build/tsc/migraciones/tests). Revisado por lectura: rutas, roles y lógica intactos; iconos de dropdowns con `h-4 w-4` según convención.

### 2026-11-23 (2) — respuestas movidas a Reseñas + reorden del nav

1. La pestaña "Respuestas" salió de `/panel/formularios` (página sin tabs, solo `FormList`) y su contenido vive ahora en `/panel/resenas` como `features/review/components/review-table/responses-list.tsx` (`ResponsesList`; textos "reseñas" en vez de "respuestas").
2. Borrado el flujo antiguo de `reviews` (nadie lo escribía: el front envía por formularios): `review-table.tsx`, `column.tsx`, `store/reviewsSlice.ts` (+ registro en `store.ts`) y `services/review-service.ts`. Backend conserva la tabla/endpoints.
3. Nav en el orden pedido: tours, categorías, reservas, clientes, formularios, reseñas, blog, preguntas, usuarios. ⚠️ "Protocolos" quedó FUERA del nav (no venía en la lista); la ruta `/panel/protocolos` sigue viva — confirmar si se agrega y dónde.
4. Sin verificación (el usuario corre lint/build/tsc/migraciones/tests). Revisado por lectura: sin imports colgando de los archivos borrados.

### 2026-11-23 — CRUD de blog con editor tipo Word

1. Nuevos `services/post-service.ts` (`Post`/`PostInput` + 5 funciones) y `store/postsSlice.ts` (thunks `fetchPosts`/`createPost`/`updatePost`/`removePost` + `resetSave`, registrado en `store.ts`). Nav "Blog" con icono nuevo `blog` (Newspaper) en `components/icons.tsx`.
2. Nuevo feature `post/components/post-table/`: `column.tsx` (Título, Categoría, Estado Publicado/Borrador con Badge, Creado con moment; acciones ver/editar/borrar), `post-form.tsx` (título requerido, categoría, resumen, portada con subida a S3 al guardar, contenido con el `RichTextEditor` de protocolos, switch Publicado) y `post-table.tsx` (DataTable + `ConfirmDialog`).
3. Páginas `/panel/blog`, `/panel/blog/nuevo`, `/panel/blog/[id]` (portada, resumen y contenido saneado con `sanitizeHtml`) y `/panel/blog/[id]/editar`; crear/editar blindadas con `RequireRole` admin/superadmin. Sin duplicar ni PDF (propios de protocolos).
4. El asistente corrió build (OK: 4 rutas `/panel/blog*`) y eslint (0 errores en archivos nuevos; 2 warnings `no-img-element`, mismo patrón pre-existente de `tour-form.tsx`). NOTA: el usuario corre lint/build/tsc/migraciones/tests (no volver a correrlos).

### 2026-11-22 — protocolos en páginas + editor enriquecido

1. Protocolos fuera de modales: crear en `/panel/protocolos/nuevo`, ver en `/panel/protocolos/[id]` (documento completo) y editar en `/panel/protocolos/[id]/editar`. La tabla navega con `router.push`; borrado `protocol-form-dialog.tsx`.
2. Nuevo `components/ui/rich-text-editor.tsx` (contentEditable sin dependencias: H1–H3, párrafo, negrita/cursiva/subrayado/tachado, listas, sangrías, alineación, cita, separador, enlaces, limpiar formato) + estilos `.rich-text-content` en `globals.css`. La descripción se guarda como HTML.
3. Nuevo `lib/sanitize-html.ts` (`sanitizeHtml` para la vista, `htmlToText` para la columna de la tabla). `ProtocolForm` en página con el editor. Backend: `description` de protocolos ahora `max(100000)`.
4. Verificación: backend `tsc --noEmit` limpio; panel tsc full falla por entorno (`@types/node/index.d.ts` "not found" aunque existe — pre-existente, ver nota 2026-11-18 (4)); con `types: [react, react-dom]` solo fallan `process`/`require` pre-existentes en archivos no tocados. ESLint roto en el entorno (`Cannot find module 'debug'`).
5. Fix editor (mismo día): `formatBlock` nativo convertía TODO en H1 porque el contenido era un solo bloque. Ahora `applyBlock` normaliza a `<p>` por bloque (`defaultParagraphSeparator=p`, convierte `<div>` de Enter, envuelve texto suelto) y si la selección es parcial parte el bloque e inserta el título/cita solo con el texto elegido (con fallback a nativo si el DOM es raro). Normalización diferida al pegar.
6. Editor: color de texto y resaltado (mismo día). Paletas con presets + color personalizado + "Quitar" en popovers (`applyColor` con `styleWithCSS=true` para generar `<span style>`, `clearInk` quita solo el color de la selección sin tocar el resto del formato).
7. Botón "Descargar PDF" en ver protocolo (mismo día). Primero vía impresión; luego cambiado a descarga directa con `html2pdf.js` (el usuario instala: `pnpm add html2pdf.js` en panel-cruzcontroltours): nodo oculto A4 con estilos inline + `sanitizeCloneForCanvas` (quita oklch/lab/color-mix que rompen html2canvas), `import()` dinámico solo en el clic, A4 vertical, estado "Generando…". Tipos propios en `src/types/html2pdf.d.ts` (la lib no trae).
8. Duplicar protocolo (mismo día): opción en el dropdown de la tabla y botón en la página de ver (tras duplicar navega a la copia). Solo canWrite. Al duplicar se abre `ProtocolDuplicateDialog` para elegir el tour de la copia (obligatorio, sin preselección); la copia hereda título + " (copia)" y descripción.
9. Fuera diálogos nativos (mismo día): nuevo `components/confirm-dialog.tsx` (AlertDialog genérico) usado en los 9 borrados (reservas, categorías, clientes, faqs, protocolos, reseñas, formularios, tours, usuarios) con toasts; el `window.prompt` de enlaces del editor ahora es un Dialog propio con validación (guarda/restaura el rango de selección).
10. Migración a UUID string (mismo día): servicios, slices, tablas (`handleDelete`/`deleteId`), formularios (`tourId`/`categoryId` sin `Number()`), páginas `[id]` (validan no-vacío), respuestas/duplicados de formularios. Nuevo `lib/utils.shortId()` para mostrar `#` + 8 chars en celdas/selects. Backend y front migrados en la misma sesión (ver HANDOFF del backend).
11. Espaciado icono-texto en menús (mismo día): `gap-2` en el `DropdownMenuItem` base; afecta a las acciones de todas las tablas.
12. Crear cliente y reserva manuales (mismo día): botones "Crear" visibles a todos los roles (host incluido). Clientes: `CustomerFormDialog` (nombre/teléfono/correo/mensaje) + thunk `createCustomer` (slice con `saveStatus`/`resetSave` nuevos). Reservas: `BookingFormDialog` en modo crear (tour/userId/personas/total/estado; edición sin cambios) + thunk `createBooking`; la tabla carga tours. Editar/borrar siguen solo admin/superadmin.
13. Módulo Despachos/rentals (mismo día): `services/rental-service.ts` + `rentalsSlice` (sin borrado) + feature `rental/` (column con Badge por status, form-dialog crear/editar con validación, tabla con filtros fecha/estado y búsqueda por cliente) + página `/panel/despachos` con `RequireRole(superadmin,host)` + nav `roles: [superadmin, host]` e icono `dispatch` (Truck). UI en español, campos/status en inglés.

### 2026-11-20 — sección Formularios de reseñas

1. Nueva sección `/panel/formularios` (nav, visible a todos; mutaciones solo admin/superadmin): pestaña Formularios (tabla + constructor con título/tour/preguntas reordenables/tipo/obligatoria/activa + duplicar con modal y manejo del 409 + copiar link) y pestaña Respuestas (filtros por tour/formulario, promedios por pregunta, tabla paginada, detalle).
2. Nuevos: `services/review-form-service.ts` (incluye `reviewLinkFor` con `NEXT_PUBLIC_FRONT_URL` y `copyText` con fallback), `store/reviewFormsSlice.ts`, feature `review-form/` (column, form-table, form-builder-dialog, duplicate-dialog, responses-tab). Link base del front en `.env.example`.
3. Front público: `/review/[token]` (`app/review/[token]/page.tsx` + `components/ReviewSubmitForm.tsx`): estrellas clicables, textarea, validación, gracias; mensaje claro si el token no existe o está inactivo.

### 2026-11-19 — auth real + roles + sección Usuarios

1. Login contra `POST /auth/login` (fuera bcrypt/clave fija/`fake_token`): `services/auth-service.ts`, `lib/session.ts` (token+usuario, `useSession` con `canWrite`/`isSuperadmin`), `api-client` con Bearer y redirect al login ante 401. `NEXT_PUBLIC_PASSWORD` eliminado del ejemplo.
2. Permisos: host sin crear/editar/borrar en las 7 tablas (`canWrite` en cada `column.tsx` + botones); `/panel/tours/nuevo` y `/panel/usuarios` blindadas con `RequireRole`; nav filtra Usuarios (solo superadmin); user-nav muestra el rol.
3. Sección Usuarios (superadmin): `services/user-service.ts`, `store/usersSlice.ts`, feature `user-table` (columnas+tabla+diálogo con rol/estado/clave opcional en edición), página `/panel/usuarios`, item del nav.
4. Backend: ver HANDOFF del backend (tablas, endpoints, seed).

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
