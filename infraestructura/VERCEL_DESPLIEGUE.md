# Vercel no despliega tras `git push`

El frontend está en la carpeta **`frontend/`**. Si Vercel no muestra despliegues nuevos, revisa esto en orden.

## 1. Repositorio conectado

En [vercel.com](https://vercel.com) → tu proyecto → **Settings** → **Git**:

- **Repository:** `AlbertoSanzAlonso/arunachala_web`
- Si no aparece o dice "Disconnected", pulsa **Connect Git Repository** y vuelve a enlazar GitHub.

## 2. Rama de producción = `master`

Los commits van a **`master`**, no a `main`.

**Settings** → **Git** → **Production Branch** → debe ser **`master`**.

Si está en `main`, Vercel no desplegará tus pushes.

## 3. Directorio raíz (elige UNA opción)

### Opción A — Raíz del repo (recomendado con `vercel.json` en la raíz)

**Settings** → **General** → **Root Directory** → déjalo **vacío** (`.`).

El archivo `/vercel.json` del repo ya indica:

- build: `cd frontend && npm run build`
- salida: `frontend/build`

### Opción B — Solo carpeta `frontend`

**Root Directory:** `frontend`

En ese caso usa el `frontend/vercel.json` y **no** hace falta el de la raíz. Build command: `npm run build`, Output: `build`.

## 4. Forzar un despliegue

**Deployments** → **Create Deployment** → rama **`master`** → **Deploy**.

O en la última fila de **Deployments** → menú **⋯** → **Redeploy**.

## 5. Comprobar en GitHub

En GitHub: `AlbertoSanzAlonso/arunachala_web` → **Settings** → **Integrations** → **Vercel** debe estar activo.

## 6. Build fallido (sí aparece deploy pero en rojo)

Abre el deploy → **Building** → lee el log. Suele ser:

- `npm ci` sin `package-lock.json` en `frontend/` → en Vercel cambia Install Command a `cd frontend && npm install`
- Variables de entorno faltantes (`REACT_APP_*`)

## Dominio

El sitio público suele ser `www.yogayterapiasarunachala.es`. Tras un deploy correcto, **Visit** en Vercel debe abrir la preview con los cambios.
