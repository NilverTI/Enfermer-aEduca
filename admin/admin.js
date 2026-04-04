const SUPABASE_URL = 'https://jywsnwexfpqnzwvpksmi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5d3Nud2V4ZnBxbnp3dnBrc21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODU4NTksImV4cCI6MjA5MDc2MTg1OX0.GE8c9uG4kQi9ZIOhlcD1bxxRsbHYCQ1wY6_OENE09Vg';

// Initialize Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginForm');

    // Basic Auth Check for Dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        initDashboard();
    }

    // Auth state listener
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
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
        window.location.href = 'dashboard.html';
    }
}

// --- Dashboard Logic ---
function initDashboard() {
    const logoutBtn = document.getElementById('logoutBtn');
    const openAddModal = document.getElementById('openAddModal');
    const closeModal = document.getElementById('closeModal');
    const bookModal = document.getElementById('bookModal');
    const bookForm = document.getElementById('bookForm');

    loadBooks();

    // Modal Events
    openAddModal?.addEventListener('click', () => {
        resetForm();
        bookModal.classList.add('active');
    });

    closeModal?.addEventListener('click', () => {
        bookModal.classList.remove('active');
    });

    // Close on overlay click
    bookModal?.addEventListener('click', (e) => {
        if (e.target === bookModal) bookModal.classList.remove('active');
    });

    logoutBtn?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        // Redirect to public books page as requested
        window.location.href = '../html/libros.html';
    });

    bookForm?.addEventListener('submit', handleFormSubmit);
}

function resetForm() {
    const form = document.getElementById('bookForm');
    const title = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const bookIdInput = document.getElementById('bookId');
    const msg = document.getElementById('formMsg');

    form.reset();
    bookIdInput.value = '';
    title.textContent = 'Publicar Libro';
    submitBtn.textContent = 'Confirmar Publicación';
    msg.textContent = '';
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
        div.className = 'book-card';
        div.innerHTML = `
            <img src="${book.cover_url}" alt="${book.titulo}" onerror="this.src='../img/placeholder.png'">
            <div class="book-info">
                <h4>${book.titulo}</h4>
                <p>Por: ${book.autor}</p>
                <span class="badge">${book.categoria}</span>
            </div>
            <div class="card-actions">
                <button onclick="editBook(${book.id})" class="btn btn-edit">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Editar
                </button>
                <button onclick="deleteBook(${book.id})" class="btn btn-danger">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Borrar
                </button>
            </div>
        `;
        list.appendChild(div);
    });
}

// --- CRUD Operations ---

async function handleFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('formMsg');
    const bookId = document.getElementById('bookId').value;

    const bookData = {
        titulo: document.getElementById('bookTitle').value,
        autor: document.getElementById('bookAuthor').value,
        categoria: document.getElementById('bookCategory').value,
        url_descarga: document.getElementById('bookUrl').value,
        cover_url: document.getElementById('bookCover').value,
    };

    btn.disabled = true;
    btn.textContent = 'Procesando...';

    let result;
    if (bookId) {
        // UPDATE
        result = await supabaseClient
            .from('libros')
            .update(bookData)
            .eq('id', bookId);
    } else {
        // INSERT
        result = await supabaseClient
            .from('libros')
            .insert([bookData]);
    }

    const { error } = result;

    if (error) {
        msg.textContent = 'Error: ' + error.message;
        msg.style.color = 'red';
    } else {
        // Success
        document.getElementById('bookModal').classList.remove('active');
        loadBooks();
        resetForm();
    }

    btn.disabled = false;
    btn.textContent = bookId ? 'Actualizar Libro' : 'Confirmar Publicación';
}

window.editBook = async function(id) {
    const { data: book, error } = await supabaseClient
        .from('libros')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert('Error al cargar el libro: ' + error.message);
        return;
    }

    // Populate Modal
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.titulo;
    document.getElementById('bookAuthor').value = book.autor;
    document.getElementById('bookCategory').value = book.categoria;
    document.getElementById('bookUrl').value = book.url_descarga;
    document.getElementById('bookCover').value = book.cover_url;

    document.getElementById('modalTitle').textContent = 'Editar Libro';
    document.getElementById('submitBtn').textContent = 'Actualizar Libro';
    document.getElementById('bookModal').classList.add('active');
}

window.deleteBook = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este libro?')) return;

    const { error } = await supabaseClient
        .from('libros')
        .delete()
        .eq('id', id);

    if (error) alert('Error: ' + error.message);
    else loadBooks();
}
