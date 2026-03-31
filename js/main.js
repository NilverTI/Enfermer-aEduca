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
    // 2. Bot Panel Toggle with ARIA Support
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
    // 5. Accordion Exclusive State (Optional)
    // ==========================================
    // The details name="ejes" attribute in HTML does this natively in modern browsers,
    // but just as a fallback/enhancement, we leave the DOM to handle the <details name="val">
});
