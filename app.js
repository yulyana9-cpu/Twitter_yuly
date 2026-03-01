/* app.js - El Cerebro de Twitter Yuly */

// 1. Inicialización de Supabase
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// 2. Identificación del Usuario (Metáfora: Nuestra Huella Dactilar)
let deviceId = localStorage.getItem('yuly_device_id');
if (!deviceId) {
    deviceId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('yuly_device_id', deviceId);
}
console.log("Tu ID de dispositivo es:", deviceId);

// --- FUNCIONES GLOBALES ---

// Cargar posts desde la nube
async function cargarPosts() {
    const container = document.getElementById('posts-container');
    container.innerHTML = '<p class="loading">Sincronizando pensamientos...</p>';

    // Pedimos los posts y el conteo de likes (Relación Supabase)
    const { data: posts, error } = await supabaseClient
        .from('posts')
        .select('*, likes(count)')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = `<p class="loading">Ups! Error: ${error.message}</p>`;
        return;
    }

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="loading">Nadie ha pensado nada aún. <br> ¡Sé el primero en romper el hielo!</p>';
        return;
    }

    container.innerHTML = '';
    posts.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('es-ES', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
        const isAuthor = post.author_id === deviceId;
        const likeCount = post.likes[0]?.count || 0;
        const isFeatured = post.is_featured === true; // cast defensivo: null → false

        const card = document.createElement('div');
        card.className = `post-card ${isFeatured ? 'featured' : ''}`;
        card.innerHTML = `
            <div class="post-content">${escapeHTML(post.content)}</div>
            <div class="post-meta">
                <span>${date}</span>
                <div class="post-actions">
                    <button class="btn-like" onclick="darLike('${post.id}')">❤️ ${likeCount}</button>
                    ${isAuthor ? `
                        <button class="btn-star ${isFeatured ? 'active' : ''}" onclick="destacarPost('${post.id}', ${isFeatured})">⭐</button>
                        <button class="btn-delete" onclick="borrarPost('${post.id}')">🗑️</button>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Función para DESTACAR (Alternar amarillo)
async function destacarPost(postId, currentStatus) {
    console.log('⭐ Actualizando post:', postId, '→ is_featured:', !currentStatus);
    const { data, error } = await supabaseClient
        .from('posts')
        .update({ is_featured: !currentStatus })
        .eq('id', postId)
        .eq('author_id', deviceId)
        .select();

    if (error) {
        alert("No se pudo destacar: " + error.message);
    } else if (!data || data.length === 0) {
        alert("No se pudo destacar. Verifica que la política RLS de UPDATE esté activa en Supabase.");
    } else {
        cargarPosts();
    }
}

// Publicar un nuevo pensamiento
async function publicarPost() {
    const input = document.getElementById('post-content');
    const content = input.value.trim();

    if (!content) {
        alert("¡Escribe algo antes de publicar!");
        return;
    }

    const { error } = await supabaseClient
        .from('posts')
        .insert([{ content: content, author_id: deviceId }]);

    if (error) {
        alert("Error al publicar: " + error.message);
    } else {
        input.value = ''; // Limpiamos el texto
        window.location.hash = ''; // Volvemos al Inicio (esto dispara cargarPosts via router)
    }
}

// Dar amor a un post
async function darLike(postId) {
    const { error } = await supabaseClient
        .from('likes')
        .insert([{ post_id: postId, device_id: deviceId }]);

    if (error) {
        if (error.code === '23505') {
            alert("¡Ya le diste amor a este post!");
        } else {
            console.error(error);
        }
    } else {
        cargarPosts(); // Refrescar para ver el nuevo número
    }
}

// Borrar un post (Autorización local)
async function borrarPost(postId) {
    if (!confirm("¿Seguro que quieres borrar este pensamiento?")) return;

    const { error } = await supabaseClient
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', deviceId); // Seguridad extra: solo borro si soy el autor

    if (error) {
        alert("No se pudo borrar: " + error.message);
    } else {
        cargarPosts();
    }
}

// Función auxiliar para evitar código malicioso
function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

// Exponer funciones al objeto window para poder usarlas en 'onclick'
window.darLike = darLike;
window.borrarPost = borrarPost;
window.destacarPost = destacarPost;

// --- SISTEMA DE NAVEGACIÓN (SPA) ---

const routes = {
    '': { viewId: 'feed-view', navId: 'nav-home', action: cargarPosts },
    '#new': { viewId: 'new-post-view', navId: 'nav-new', action: null }
};

function router() {
    const hash = window.location.hash;
    const route = routes[hash] || routes[''];

    // Cambiar visualmente de pantalla
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(route.viewId).classList.add('active');

    // Cambiar color de la barra de navegación
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(route.navId).classList.add('active');

    // Ejecutar acción de la ruta (como cargar posts)
    if (route.action) route.action();
}

// Escuchar eventos
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Botones directos
document.getElementById('btn-cancel').onclick = () => window.location.hash = '';
document.getElementById('btn-publish').onclick = publicarPost;
