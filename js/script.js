document.addEventListener('DOMContentLoaded', () => {
    // GA4 Event Tracking Helper
    const trackEvent = (eventName, params = {}) => {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        }
    };

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
            let nextTheme = 'light';
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
                nextTheme = 'dark';
            }
            trackEvent('theme_toggle', { 'theme': nextTheme });
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
                trackEvent('press_show_more', { 'action': 'expand' });
            } else {
                const visibleItems = document.querySelectorAll('.visible-press-item');
                visibleItems.forEach(item => {
                    item.classList.remove('visible-press-item');
                    item.classList.add('hidden-press-item');
                });
                showMorePressBtn.innerHTML = 'Show More <i class="fa-solid fa-chevron-down"></i>';
                trackEvent('press_show_more', { 'action': 'collapse' });
            }
        });
    }

    // 5. News "Show More" functionality
    const showMoreNewsBtn = document.getElementById('show-more-news-btn');
    if (showMoreNewsBtn) {
        const newsItems = document.querySelectorAll('.news-list li');
        const headings = document.querySelectorAll('.news-year-heading');
        
        const setNewsExpanded = (expanded) => {
            let visibleCount = 0;
            headings.forEach(heading => {
                const list = heading.nextElementSibling;
                if (list && list.classList.contains('news-list')) {
                    const items = list.querySelectorAll('li');
                    let listHasVisibleItems = false;
                    
                    items.forEach(item => {
                        if (expanded) {
                            item.classList.remove('hidden-news-item');
                            listHasVisibleItems = true;
                        } else {
                            if (visibleCount < 3) {
                                item.classList.remove('hidden-news-item');
                                listHasVisibleItems = true;
                                visibleCount++;
                            } else {
                                item.classList.add('hidden-news-item');
                            }
                        }
                    });
                    
                    if (listHasVisibleItems) {
                        heading.style.display = '';
                        list.style.display = '';
                    } else {
                        heading.style.display = 'none';
                        list.style.display = 'none';
                    }
                }
            });
        };

        if (newsItems.length > 3) {
            // Start collapsed
            setNewsExpanded(false);
            showMoreNewsBtn.style.display = 'inline-flex';
            
            showMoreNewsBtn.addEventListener('click', () => {
                const isExpanded = showMoreNewsBtn.innerHTML.includes('Show Less');
                if (isExpanded) {
                    setNewsExpanded(false);
                    showMoreNewsBtn.innerHTML = 'Show More <i class="fa-solid fa-chevron-down"></i>';
                    document.getElementById('news').scrollIntoView({ behavior: 'smooth' });
                    trackEvent('news_show_more', { 'action': 'collapse' });
                } else {
                    setNewsExpanded(true);
                    showMoreNewsBtn.innerHTML = 'Show Less <i class="fa-solid fa-chevron-up"></i>';
                    trackEvent('news_show_more', { 'action': 'expand' });
                }
            });
        } else {
            showMoreNewsBtn.style.display = 'none';
        }
    }

    // 6. Google Analytics Click Tracking
    
    // Navigation clicks
    if (typeof navLinks !== 'undefined' && navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                trackEvent('nav_click', {
                    'section': link.getAttribute('href').replace('#', '')
                });
            });
        });
    }

    // Social links clicks
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', () => {
            const platform = link.getAttribute('aria-label') || 'unknown';
            trackEvent('social_click', {
                'platform': platform,
                'url': link.getAttribute('href')
            });
        });
    });

    // Contact & Email clicks
    const emailLink = document.querySelector('.contact-row a[href^="mailto:"]');
    if (emailLink) {
        emailLink.addEventListener('click', () => {
            trackEvent('contact_click', {
                'type': 'email',
                'value': emailLink.getAttribute('href')
            });
        });
    }

    // Publication links clicks
    const publicationLinks = document.querySelectorAll('.pub-links a');
    publicationLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pubItem = link.closest('.publication-item');
            const title = pubItem ? pubItem.querySelector('.pub-title').textContent.trim() : 'Unknown';
            const label = link.textContent.trim();
            trackEvent('publication_click', {
                'paper_title': title,
                'link_label': label,
                'url': link.getAttribute('href')
            });
        });
    });

    // Press list clicks
    const pressItems = document.querySelectorAll('.press-list a');
    pressItems.forEach(link => {
        link.addEventListener('click', () => {
            const title = link.querySelector('.press-title') ? link.querySelector('.press-title').textContent.trim() : 'Unknown';
            const source = link.querySelector('.press-meta') ? link.querySelector('.press-meta').textContent.split('·')[1].trim() : 'Unknown';
            trackEvent('press_click', {
                'title': title,
                'source': source,
                'url': link.getAttribute('href')
            });
        });
    });
});
