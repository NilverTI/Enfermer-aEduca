/**
 * Enfermería Educa - Main Logic (Premium Redux)
 * Optimized for performance and modern UX
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Navigation Scroll Effect
    // ==========================================
    const nav = document.querySelector('.nav');
    
    // Throttle function for performance
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : ''; // Evita scroll de fondo
        });

        // Cerrar menú al hacer clic en un enlace (Smooth UX)
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================
    // 3. Bot Panel Toggle with ARIA Support
    // ==========================================
    const botBtn = document.getElementById('botBtn');
    const botPanel = document.getElementById('botPanel');
    const botClose = document.getElementById('botClose');

    const togglePanel = (forceState) => {
        const isExpanded = botBtn.getAttribute('aria-expanded') === 'true';
        const newState = forceState !== undefined ? forceState : !isExpanded;
        
        if (newState) {
            botPanel.classList.add('active');
            botBtn.setAttribute('aria-expanded', 'true');
            botPanel.setAttribute('aria-hidden', 'false');
        } else {
            botPanel.classList.remove('active');
            botBtn.setAttribute('aria-expanded', 'false');
            botPanel.setAttribute('aria-hidden', 'true');
        }
    };

    if (botBtn && botPanel) {
        botBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel();
        });

        if (botClose) {
            botClose.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePanel(false);
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!botPanel.contains(e.target) && !botBtn.contains(e.target)) {
                togglePanel(false);
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                togglePanel(false);
            }
        });
    }

    // ==========================================
    // 3. Smooth Auto-Scroll
    // ==========================================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                // Add an offset specifically for our fixed header
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 4. Staggered Intersection Observer (Scroll Reveal)
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slighly before it hits the viewport bottom
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the class that triggers the CSS animation
                entry.target.classList.add('in-view');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 5. ScrollSpy (Active Nav Link)
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    const scrollSpyOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Detect when section is roughly in the middle
        threshold: 0
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    sections.forEach(section => scrollSpyObserver.observe(section));

    // Clear active if at the absolute top
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            navItems.forEach(link => link.classList.remove('active'));
        }
    });

    // ==========================================
    // 5. Topic Cards Modal Logic
    // ==========================================
    const topCardElements = document.querySelectorAll('.topic-card');
    const modalOverlay = document.getElementById('globalTopicModal');
    const modalBodyWrapper = document.getElementById('topicModalBody');
    const modalCloseBtn = document.getElementById('closeTopicModal');

    if (topCardElements.length > 0 && modalOverlay) {
        // Function to close modal
        const closeTopicModal = () => {
            modalOverlay.classList.remove('active');
            modalOverlay.setAttribute('aria-hidden', 'true');
            // Remove content after animation finishes
            setTimeout(() => {
                modalBodyWrapper.innerHTML = '';
            }, 300);
        };

        // Escuchar clics en tarjetas
        topCardElements.forEach(card => {
            card.addEventListener('click', () => {
                const hiddenContent = card.querySelector('.topic-hidden-content');
                if (hiddenContent) {
                    modalBodyWrapper.innerHTML = hiddenContent.innerHTML;
                    modalOverlay.classList.add('active');
                    modalOverlay.setAttribute('aria-hidden', 'false');
                }
            });

            // Accesibilidad con teclado (Enter/Space)
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Eventos para cerrar el modal
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeTopicModal);
        }

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeTopicModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeTopicModal();
            }
        });
    }

});
