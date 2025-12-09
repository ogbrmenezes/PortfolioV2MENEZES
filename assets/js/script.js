(() => {
    const THEME_KEY = 'portfolio-theme';
    const body = document.body;

    // ------------------------------
    // Tema (dark ↔ light) com persistência
    // ------------------------------
    const applyTheme = (theme) => {
        body.classList.remove('dark', 'dark-theme', 'light', 'light-theme');
        if (theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.add('dark-theme');
        }
    };

    const getSavedTheme = () => {
        try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
    };

    const saveTheme = (theme) => {
        try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* ignore */ }
    };

    const savedTheme = getSavedTheme();
    applyTheme(savedTheme === 'light' ? 'light' : 'dark');

    const themeToggle = document.querySelector('[data-theme-toggle]') ||
        document.getElementById('toggle-theme') ||
        document.querySelector('.theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = body.classList.contains('light') || body.classList.contains('light-theme');
            const nextTheme = isLight ? 'dark' : 'light';
            applyTheme(nextTheme);
            saveTheme(nextTheme);
        });
    }

    // ------------------------------
    // Menu hambúrguer (mobile)
    // ------------------------------
    const menuBtn = document.getElementById('menu-btn') || document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links') || document.querySelector('nav.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.add('mobile');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }

    // ------------------------------
    // Rolagem suave para âncoras internas
    // ------------------------------
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        link.addEventListener('click', (event) => {
            event.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (navLinks) navLinks.classList.remove('open');
        });
    });

    // ------------------------------
    // Chatbot IA (abrir/fechar)
    // ------------------------------
    const chatbotToggle = document.querySelector('.chatbot-btn') || document.querySelector('.chatbot-toggle');
    const chatbotBox = document.querySelector('.chatbot-box') || document.querySelector('.chatbot');
    const chatbotClose = document.querySelector('.chatbot-close');

    const toggleChat = (forceState) => {
        if (!chatbotBox) return;
        const shouldOpen = typeof forceState === 'boolean' ? forceState : chatbotBox.style.display !== 'flex';
        chatbotBox.style.display = shouldOpen ? 'flex' : 'none';
        if (shouldOpen) {
            chatbotBox.removeAttribute('hidden');
        } else {
            chatbotBox.setAttribute('hidden', 'hidden');
        }
        if (chatbotToggle) {
            chatbotToggle.classList.toggle('open', shouldOpen);
        }
    };

    if (chatbotToggle && chatbotBox) {
        chatbotToggle.addEventListener('click', () => toggleChat());
    }

    if (chatbotClose && chatbotBox) {
        chatbotClose.addEventListener('click', () => toggleChat(false));
    }

    document.addEventListener('click', (event) => {
        if (!chatbotBox || !chatbotToggle) return;
        const clickedOutside = !chatbotBox.contains(event.target) && !chatbotToggle.contains(event.target);
        if (clickedOutside && chatbotBox.style.display === 'flex') {
            toggleChat(false);
        }
    });

    // ------------------------------
    // Animações de entrada do Hero
    // ------------------------------
    window.addEventListener('load', () => {
        const hero = document.querySelector('.hero');
        const heroTitle = document.querySelector('.hero-title');
        const heroCta = document.querySelector('.hero .btn-primary');
        const heroPortrait = document.querySelector('.portrait-frame img');

        [hero, heroTitle, heroCta, heroPortrait].forEach((el) => {
            if (el) el.classList.add('show');
        });
    });

    // ------------------------------
    // Fade-in on scroll (timeline, cards)
    // ------------------------------
    const observeFade = (selector) => {
        const items = document.querySelectorAll(selector);
        if (!items.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        items.forEach((item) => observer.observe(item));
    };

    observeFade('.timeline-item');
    observeFade('.projeto-card');
    observeFade('.skill-card');

    // ------------------------------
    // Navegação simples de projetos
    // ------------------------------
    const projectTrack = document.querySelector('.project-track');
    const projectSlides = Array.from(document.querySelectorAll('.project-slide'));
    const btnPrev = document.querySelector('.project-prev');
    const btnNext = document.querySelector('.project-next');

    const slideWidth = projectSlides.length ? projectSlides[0].getBoundingClientRect().width + 16 : 0;

    const scrollToOffset = (direction) => {
        if (!projectTrack || !slideWidth) return;
        projectTrack.scrollBy({ left: direction * slideWidth, behavior: 'smooth' });
    };

    if (btnPrev) btnPrev.addEventListener('click', () => scrollToOffset(-1));
    if (btnNext) btnNext.addEventListener('click', () => scrollToOffset(1));
})();
