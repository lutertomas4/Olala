# 💇‍♀️ Salón & Nails · Gestión Integral en Tiempo Real

Aplicación web progresiva (PWA) para gestión de peluquería (Yamila) y manicuría en mesa compartida (Katya y Gisel).

---

## 🚀 Arquitectura: GitHub + Vercel + Supabase

- **Frontend:** HTML5, CSS3, JavaScript moderno (cero dependencias pesadas, ultra rápido).
- **Hosting & CI/CD:** **Vercel** (despliegue continuo con SSL automático).
- **Base de Datos & Tiempo Real:** **Supabase** (PostgreSQL gratuito con sincronización instantánea vía WebSockets).

---

## 🛠️ Guía Rápida de Despliegue (Paso a Paso)

### 1. Configurar Supabase (2 minutos)
1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta gratuita (podés usar el mail del salón o el tuyo).
2. Creá un nuevo proyecto (ej: `salon-yamila`).
3. En el menú lateral izquierdo, andá a **SQL Editor ➔ New query**.
4. Abrí el archivo [`supabase-schema.sql`](./supabase-schema.sql), copiá todo su contenido, pegalo en el editor de Supabase y hacé clic en **Run**.
   - *Esto crea las tablas de clientas, fichas de pelo, turnos de uñas, usuarios y activa el Realtime.*
5. Andá a **Project Settings ➔ API** y copiá:
   - **Project URL** (ej: `https://xyzabcdef.supabase.co`)
   - **Project API Keys ➔ `anon` `public`**

---

### 2. Subir este proyecto a GitHub
Desde tu terminal, posicionate dentro de esta carpeta (`salon-yamila`) y ejecutá:

```bash
# 1. Inicializar git en esta carpeta limpia
git init
git branch -M main

# 2. Agregar todos los archivos y commitear
git add .
git commit -m "feat: lanzamiento inicial salon y nails con supabase"

# 3. Vincular con tu repositorio de GitHub (crealo antes en github.com/new)
git remote add origin https://github.com/TU_USUARIO/salon-yamila.git

# 4. Subir a GitHub
git push -u origin main
```

---

### 3. Publicar en Vercel (1 minuto)
1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con tu GitHub.
2. Tocá en **Add New... ➔ Project**.
3. Seleccioná el repositorio `salon-yamila`.
4. Dejá todas las opciones por defecto (Framework Preset: Other) y tocá **Deploy**.
5. ¡Listo! Vercel te dará una URL con HTTPS tipo `https://salon-yamila.vercel.app`.

---

### 4. Conectar la App con Supabase
Al abrir la app publicada en el celular o la compu:
1. Tocá el botón **⚡ Nube** en la esquina superior derecha.
2. Pegá la **Project URL** y la **Anon Key** que copiaste de Supabase en el paso 1.
3. Tocá **Guardar y Conectar**.
4. ¡El indicador cambiará a **🟢 Supabase En Línea** y los 3 celulares estarán sincronizados al segundo!

---

## 👥 Usuarios y PINes por Defecto

| Usuario | Rol | PIN por Defecto |
| :--- | :--- | :--- |
| **Yamila** | Dueña (Peluquería, cobro 100% propio y 40% comisión de uñas) | `1234` |
| **Katya** | Manicurista (Mesa 1, cobro directo 100%, retiene 60%, rinde 40%) | `1111` |
| **Gisel** | Manicurista (Mesa 2, cobro directo 100%, retiene 60%, rinde 40%) | `2222` |

---

## 📱 Instalar como App en el Celular (PWA)
En el celular de Yamila, Katya y Gisel:
- **Android (Chrome):** Abrir el enlace ➔ Tocar los 3 puntitos ➔ **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
- **iPhone (Safari):** Abrir el enlace ➔ Tocar el botón Compartir (flechita hacia arriba) ➔ **"Agregar al inicio"**.
