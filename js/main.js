document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core Logic
    initNavigation();
    initWhatsAppBot();
    initRevealObserver();

    // 2. Initialize Section Logic
    // Since everything is now in index.html, we just call the init functions
    if (typeof initContenido === 'function') {
        initContenido();
    }

    console.log('Enfermería Educa: All modules initialized from DOM.');
});

/* ==========================================
   Base Logic (Navigation, Scroll, WhatsApp)
   ========================================== */

function initNavigation() {
    const nav = document.querySelector('.nav');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('nav-scrolled');
        else nav.classList.remove('nav-scrolled');
    });

    // Mobile Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Smooth Scroll for dynamic sections
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 100;
                const top = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    });

    // Scroll-Spy: Actualiza el enlace activo según el scroll
    const sections = ['proyecto', 'contenido', 'equipo', 'comunidad'];
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sId => {
            const el = document.getElementById(sId);
            if (el) {
                const sectionTop = el.offsetTop;
                if (pageYOffset >= sectionTop - 120) current = sId;
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

function initWhatsAppBot() {
    const botBtn = document.getElementById('botBtn');
    const botPanel = document.getElementById('botPanel');
    const botClose = document.getElementById('botClose');

    if (botBtn && botPanel) {
        botBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            botPanel.classList.toggle('active');
        });

        if (botClose) {
            botClose.addEventListener('click', () => botPanel.classList.remove('active'));
        }

        document.addEventListener('click', (e) => {
            if (!botPanel.contains(e.target) && !botBtn.contains(e.target)) {
                botPanel.classList.remove('active');
            }
        });
    }
}

function initRevealObserver() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const observeElements = () => {
        document.querySelectorAll('.fade-up:not(.in-view)').forEach(el => observer.observe(el));
    };

    observeElements();

    // Watch for new components
    window.addEventListener('componentsLoaded', observeElements);
}
