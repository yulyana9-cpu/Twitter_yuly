# 🚀 TWITTER YULY - Guía de Lanzamiento

¡Felicidades! Has construido una Red Social moderna con **Vanilla JavaScript** y **Supabase**. Ahora es el momento de que todo el mundo la vea.

---

## 🛠️ Paso 1: Sube tu código a GitHub

GitHub es como el "almacén" de tu código en la nube.

1.  Crea un nuevo repositorio en [github.com](https://github.com/new) llamado `twitter-yuly`. (Déjalo como **Public**).
2.  En tu computadora, abre la terminal dentro de tu carpeta `Twitter_yuly` y escribe estos comandos uno por uno:
    ```bash
    git init
    git add .
    git commit -m "Lanzamiento inicial de Twitter Yuly 🚀"
    git branch -M main
    git remote add origin https://github.com/TU_USUARIO/twitter-yuly.git
    git push -u origin main
    ```
    *(Cambia `TU_USUARIO` por tu nombre de usuario de GitHub).*

---

## ☁️ Paso 2: Despliega en Cloudflare Pages

Cloudflare Pages hará que tu web tenga una URL real (ej: `twitter-yuly.pages.dev`).

1.  Entra en el [Panel de Cloudflare](https://dash.cloudflare.com/) y ve a **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2.  Selecciona tu repositorio `twitter-yuly`.
3.  En **Build settings**, deja todo como está:
    *   **Framework preset:** None
    *   **Build command:** (vacio)
    *   **Build output directory:** (vacio, o déjalo como raíz `/`)
4.  Pulsa **Save and Deploy**.

---

## 🔐 Paso 3: Configura la Seguridad en Supabase

Para que tu base de datos solo acepte conexiones desde TU nueva web:

1.  Ve a tu proyecto en **Supabase** > **Settings** > **API**.
2.  En la sección **URI Allow List**, añade la URL que te dio Cloudflare (ej: `https://twitter-yuly.pages.dev`).
3.  Esto evitará que otros usen tu base de datos desde sitios no autorizados.

---

## ✨ ¡Misión Cumplida!

Tu aplicación ya es accesible desde cualquier parte del mundo. 

### Recordatorios del Mentor:
- **SPA Inteligente**: Gracias al archivo `_redirects`, si alguien refresca la página en `#new`, la web no dará error.
- **Identidad**: Recuerda que si entras desde otro navegador o borras las cookies, la app te asignará un nuevo `device_id` y ya no podrás borrar tus posts antiguos (porque no sabrá que fuiste tú).

¡Disfruta de **Twitter Yuly**! 🐦✨