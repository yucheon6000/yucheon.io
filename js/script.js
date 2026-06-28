document.addEventListener('DOMContentLoaded', () => {
    // 1. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    if (themeToggle) {
        const icon = themeToggle.querySelector('i');

        // Check for saved theme or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            html.setAttribute('data-theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }

        themeToggle.addEventListener('click', () => {
            if (html.getAttribute('data-theme') === 'dark') {
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });
    }

    // 2. Intersection Observer for subtle fade-in
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -30px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // 3. Active Nav Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length > 0 && navLinks.length > 0) {
        const updateActiveNav = () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= (sectionTop - 160)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current) && current !== '') {
                    link.classList.add('active');
                }
            });
        };

        // Throttle scroll handler
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveNav();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // 4. Press "Show More" functionality
    const showMorePressBtn = document.getElementById('show-more-press-btn');
    if (showMorePressBtn) {
        showMorePressBtn.addEventListener('click', () => {
            const hiddenItems = document.querySelectorAll('.hidden-press-item');
            
            if (hiddenItems.length > 0) {
                hiddenItems.forEach(item => {
                    item.classList.remove('hidden-press-item');
                    item.classList.add('visible-press-item');
                });
                showMorePressBtn.innerHTML = 'Show Less <i class="fa-solid fa-chevron-up"></i>';
            } else {
                const visibleItems = document.querySelectorAll('.visible-press-item');
                visibleItems.forEach(item => {
                    item.classList.remove('visible-press-item');
                    item.classList.add('hidden-press-item');
                });
                showMorePressBtn.innerHTML = 'Show More <i class="fa-solid fa-chevron-down"></i>';
            }
        });
    }
});
