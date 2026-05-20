# Cómo actualizar el backend en el servidor (paso a paso)

El backend de producción corre en un **servidor Hetzner** con Docker. Sigue estos pasos en orden.

---

## Paso 1 — Abrir una terminal

- **Linux**: `Ctrl + Alt + T`
- **Windows**: busca "PowerShell" o "Terminal"
- **Mac**: `Cmd + Espacio` → escribe "Terminal"

---

## Paso 2 — Conectarte al servidor

Necesitas la **IP del servidor** y tu **usuario SSH** (los tienes en el panel de Hetzner o donde configuraste el VPS).

Sustituye `TU_USUARIO` e `IP_DEL_SERVIDOR` por los tuyos:

```bash
ssh TU_USUARIO@IP_DEL_SERVIDOR
```

Te pedirá la contraseña o usará tu clave SSH. Cuando entres, verás un prompt del servidor (no de tu PC).

> Si no sabes la IP ni el usuario, míralo en [Hetzner Cloud](https://console.hetzner.cloud/) → tu servidor → pestaña Overview / Networking.

---

## Paso 3 — Ir a la carpeta del proyecto en el servidor

La ruta puede variar. Prueba una de estas (la que exista en tu servidor):

```bash
cd ~/arunachala/infraestructura
```

o

```bash
cd ~/Projects/arunachala/infraestructura
```

o

```bash
cd ~/arunachala_web/infraestructura
```

Comprueba que estás en el sitio correcto:

```bash
ls
```

Deberías ver archivos como `docker-compose.prod.yml` y `deploy-backend.sh`.

---

## Paso 4 — Traer el código nuevo (si usas Git en el servidor)

```bash
cd ..
git pull
cd infraestructura
```

Si el código **no** está en Git en el servidor, tendrás que subir los archivos cambiados por otro medio (SFTP, rsync, etc.) antes de continuar.

---

## Paso 5 — Ejecutar el script de despliegue (un solo comando)

```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

Espera a que termine. Al final verás logs del backend.

**Correcto** si aparece algo como:

- `📅 Scheduler enabled on worker pid=...` (una vez)
- `⏭️ Automation Scheduler disabled in this worker process` (varias)

Con eso el arreglo de “4 publicaciones en n8n” queda aplicado.

---

## Si algo falla

| Mensaje | Qué hacer |
|--------|-----------|
| `docker: command not found` | En el servidor: instalar Docker o usar otro usuario que tenga Docker |
| `permission denied` | Prueba: `sudo ./deploy-backend.sh` |
| `no such file` en `cd` | Busca dónde está el repo: `find ~ -name docker-compose.prod.yml 2>/dev/null` |
| No tienes acceso SSH | Pide a quien administre el VPS que ejecute el Paso 5 por ti |

---

## Alternativa: copiar solo desde tu PC (sin Git en servidor)

Si trabajas en local y el servidor tiene otra ruta, desde **tu PC** (con los cambios ya guardados):

```bash
cd /home/albertosanzdev/Projects/arunachala
rsync -avz backend/ TU_USUARIO@IP_DEL_SERVIDOR:~/ruta/al/proyecto/backend/
ssh TU_USUARIO@IP_DEL_SERVIDOR 'cd ~/ruta/al/proyecto/infraestructura && ./deploy-backend.sh'
```

(Ajusta rutas y usuario.)

---

## Resumen en 3 líneas (cuando ya estás en el servidor)

```bash
cd ~/TU_RUTA/arunachala/infraestructura
git pull   # si aplica
./deploy-backend.sh
```
