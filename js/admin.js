const SUPABASE_URL = 'https://jywsnwexfpqnzwvpksmi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5d3Nud2V4ZnBxbnp3dnBrc21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODU4NTksImV4cCI6MjA5MDc2MTg1OX0.GE8c9uG4kQi9ZIOhlcD1bxxRsbHYCQ1wY6_OENE09Vg';

// Initialize Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on Login or Dashboard
    const loginForm = document.getElementById('loginForm');

    // Basic Auth Check for Dashboard
    if (window.location.pathname.includes('/dashboard/')) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            window.location.href = '../login/';
            return;
        }
        initDashboard();
    }

    // Auth state listener: If session disappears, redirect to login
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' && window.location.pathname.includes('/dashboard/')) {
            window.location.href = '../login/';
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// --- Authentication ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorMsg.textContent = 'Error: ' + error.message;
    } else {
        // Redirect to clean URL dashboard
        window.location.href = '../dashboard/';
    }
}

// --- Dashboard Logic ---
function initDashboard() {
    const logoutBtn = document.getElementById('logoutBtn');
    const addBookForm = document.getElementById('addBookForm');

    loadBooks();

    logoutBtn?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = '../login/';
    });

    addBookForm?.addEventListener('submit', handleAddBook);
}

async function loadBooks() {
    const booksList = document.getElementById('booksList');
    const { data: books, error } = await supabaseClient
        .from('libros')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error loading books:', error);
        return;
    }

    renderBooks(books);
}

function renderBooks(books) {
    const list = document.getElementById('booksList');
    list.innerHTML = '';

    if (books.length === 0) {
        list.innerHTML = '<p>No hay libros publicados aún.</p>';
        return;
    }

    books.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card fade-up';
        div.innerHTML = `
            <img src="${book.cover_url}" alt="${book.titulo}" style="width:100%; height:150px; object-fit:cover; border-radius:10px; margin-bottom:1rem;">
            <h4>${book.titulo}</h4>
            <p>${book.autor}</p>
            <span class="badge">${book.categoria}</span>
            <button onclick="deleteBook(${book.id})" class="btn-danger">Eliminar</button>
        `;
        list.appendChild(div);
    });
}

async function handleAddBook(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('formMsg');

    const bookData = {
        titulo: document.getElementById('bookTitle').value,
        autor: document.getElementById('bookAuthor').value,
        categoria: document.getElementById('bookCategory').value,
        url_descarga: document.getElementById('bookUrl').value,
        cover_url: document.getElementById('bookCover').value,
    };

    btn.disabled = true;
    btn.textContent = 'Publicando...';

    const { data, error } = await supabaseClient
        .from('libros')
        .insert([bookData]);

    if (error) {
        msg.textContent = 'Error: ' + error.message;
        msg.style.color = 'red';
    } else {
        msg.textContent = '¡Libro publicado con éxito!';
        msg.style.color = 'green';
        e.target.reset();
        loadBooks();
    }

    btn.disabled = false;
    btn.textContent = 'Publicar Libro';
}

async function deleteBook(id) {
    if (!confirm('¿Estás seguro de eliminar este libro?')) return;

    const { error } = await supabaseClient
        .from('libros')
        .delete()
        .eq('id', id);

    if (error) alert('Error: ' + error.message);
    else loadBooks();
}
