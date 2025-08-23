/**
 * Podologie Weimar Website JavaScript
 * Modern, accessible, and performance-optimized
 */

'use strict';

// Unified Carousel Component
class UnifiedCarousel {
    constructor(containerSelector, autoSlideDelay = 4000) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.currentSlideIndex = 0;
        this.slides = [];
        this.dots = [];
        this.autoSlideInterval = null;
        this.autoSlideDelay = autoSlideDelay;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.containerSelector = containerSelector;

        this.init();
    }

    init() {
        this.waitForDOM(() => {
            this.initCarousel();
            this.startAutoSlide();
        });
    }

    waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    initCarousel() {
        try {
            this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'));
            this.dots = Array.from(this.container.querySelectorAll('.carousel-dot'));

            if (this.slides.length === 0) {
                console.info(`No carousel slides found in ${this.containerSelector}`);
                return;
            }

            // Set up navigation buttons
            const prevBtn = this.container.querySelector('.carousel-nav--prev');
            const nextBtn = this.container.querySelector('.carousel-nav--next');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.prevSlide());
                prevBtn.setAttribute('aria-label', 'Vorheriges Bild');
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextSlide());
                nextBtn.setAttribute('aria-label', 'Nächstes Bild');
            }

            // Set up dot navigation
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
                dot.setAttribute('aria-label', `Zu Bild ${index + 1} wechseln`);
            });

            // Set up mouse interactions for auto-slide
            this.container.addEventListener('mouseenter', () => this.pauseAutoSlide());
            this.container.addEventListener('mouseleave', () => this.resumeAutoSlide());

            // Initialize first slide
            this.showSlide(0);

            console.info(`Carousel initialized: ${this.containerSelector} with ${this.slides.length} slides`);
        } catch (error) {
            console.error('Error initializing carousel:', error);
        }
    }

    showSlide(index, announceChange = false) {
        try {
            if (index < 0 || index >= this.slides.length) return;

            // Remove active classes
            this.slides.forEach((slide) => {
                slide.classList.remove('carousel-slide--active');
                slide.setAttribute('aria-hidden', 'true');
            });

            this.dots.forEach((dot) => {
                dot.classList.remove('carousel-dot--active');
                dot.setAttribute('aria-selected', 'false');
            });

            // Add active classes
            this.slides[index].classList.add('carousel-slide--active');
            this.slides[index].setAttribute('aria-hidden', 'false');

            if (this.dots[index]) {
                this.dots[index].classList.add('carousel-dot--active');
                this.dots[index].setAttribute('aria-selected', 'true');
            }

            this.currentSlideIndex = index;

            if (announceChange) {
                this.announceSlideChange(index);
            }
        } catch (error) {
            console.error('Error showing slide:', error);
        }
    }

    nextSlide() {
        const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
        this.showSlide(nextIndex, true);
    }

    prevSlide() {
        const prevIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex, true);
    }

    goToSlide(index) {
        this.showSlide(index, true);
        this.resetAutoSlide();
    }

    startAutoSlide() {
        if (this.isReducedMotion || this.slides.length <= 1) return;

        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }

    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resumeAutoSlide() {
        if (!this.isReducedMotion && this.slides.length > 1) {
            this.startAutoSlide();
        }
    }

    resetAutoSlide() {
        this.pauseAutoSlide();
        this.resumeAutoSlide();
    }

    announceSlideChange(index) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Bild ${index + 1} von ${this.slides.length}`;

        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }
}

// App initialization
class PodologieApp {
    constructor() {
        this.carousels = [];
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Bind methods to maintain context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleResize = this.debounce(this.handleResize.bind(this), 250);

        this.init();
    }

    // Initialize the application
    init() {
        this.waitForDOM(() => {
            this.initCarousels();
            this.initTabNavigation();
            this.initModal();
            this.initAccessibility();
            this.initEventListeners();
            this.preloadImages();
        });
    }

    // Initialize all carousels
    initCarousels() {
        // Find all carousel containers and initialize them
        const carouselContainers = document.querySelectorAll('.carousel-container');
        carouselContainers.forEach((container, index) => {
            // Add unique ID to each container for reliable targeting
            const carouselId = `carousel-${index + 1}`;
            container.id = carouselId;

            const carousel = new UnifiedCarousel(`#${carouselId}`, 4000);
            this.carousels.push(carousel);
        });
    }

    // Wait for DOM to be ready
    waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Debounce utility function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize tab navigation
    initTabNavigation() {
        try {
            const navLinks = Array.from(document.querySelectorAll('.nav__link'));
            const tabContents = Array.from(document.querySelectorAll('.tab-content'));

            if (navLinks.length === 0 || tabContents.length === 0) {
                console.info('No tab navigation found');
                return;
            }

            navLinks.forEach((link, index) => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(link, navLinks, tabContents);
                });

                // Add keyboard navigation
                link.addEventListener('keydown', (e) => {
                    this.handleTabKeyDown(e, navLinks, index);
                });
            });

            console.info(`Tab navigation initialized with ${navLinks.length} tabs`);
        } catch (error) {
            console.error('Error initializing tab navigation:', error);
        }
    }

    // Switch to specific tab
    switchTab(activeLink, allLinks, allContents) {
        try {
            // Remove active classes
            allLinks.forEach(link => {
                link.classList.remove('nav__link--active');
                link.setAttribute('aria-selected', 'false');
            });
            allContents.forEach(content => {
                content.classList.remove('tab-content--active');
                content.setAttribute('aria-hidden', 'true');
            });

            // Add active class to clicked link
            activeLink.classList.add('nav__link--active');
            activeLink.setAttribute('aria-selected', 'true');

            // Show corresponding tab content
            const targetId = activeLink.getAttribute('href').substring(1);
            const targetContent = document.getElementById(targetId);

            if (targetContent) {
                targetContent.classList.add('tab-content--active');
                targetContent.setAttribute('aria-hidden', 'false');

                // Focus management for accessibility
                const firstFocusable = targetContent.querySelector('h1, h2, h3, [tabindex="0"], button, a, input');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }
        } catch (error) {
            console.error('Error switching tab:', error);
        }
    }

    // Handle keyboard navigation for tabs
    handleTabKeyDown(event, navLinks, currentIndex) {
        const { key } = event;
        let newIndex = currentIndex;

        switch (key) {
            case 'ArrowLeft':
                event.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : navLinks.length - 1;
                break;
            case 'ArrowRight':
                event.preventDefault();
                newIndex = currentIndex < navLinks.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = navLinks.length - 1;
                break;
            default:
                return;
        }

        navLinks[newIndex].focus();
        navLinks[newIndex].click();
    }

    // Initialize modal functionality
    initModal() {
        try {
            const impressumLink = document.getElementById('impressum-link');
            const impressumModal = document.getElementById('impressum-modal');
            const closeButton = impressumModal?.querySelector('.modal__close');

            if (!impressumLink || !impressumModal || !closeButton) {
                console.info('Modal elements not found');
                return;
            }

            // Add ARIA attributes
            impressumModal.setAttribute('role', 'dialog');
            impressumModal.setAttribute('aria-modal', 'true');
            impressumModal.setAttribute('aria-labelledby', 'modal-title');

            const modalTitle = impressumModal.querySelector('.modal__title');
            if (modalTitle) {
                modalTitle.id = 'modal-title';
            }

            // Open modal
            impressumLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(impressumModal);
            });

            // Close modal
            closeButton.addEventListener('click', () => {
                this.closeModal(impressumModal);
            });

            // Close on overlay click
            impressumModal.addEventListener('click', (e) => {
                if (e.target === impressumModal) {
                    this.closeModal(impressumModal);
                }
            });

            console.info('Modal functionality initialized');
        } catch (error) {
            console.error('Error initializing modal:', error);
        }
    }

    // Open modal with proper accessibility
    openModal(modal) {
        try {
            // Store currently focused element
            this.previousFocus = document.activeElement;

            // Show modal
            modal.classList.add('modal--active');
            modal.style.display = 'flex';

            // Prevent background scrolling
            document.body.style.overflow = 'hidden';

            // Focus first focusable element in modal
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }

            // Trap focus
            this.trapFocus(modal);
        } catch (error) {
            console.error('Error opening modal:', error);
        }
    }

    // Close modal and restore focus
    closeModal(modal) {
        try {
            modal.classList.remove('modal--active');
            modal.style.display = 'none';

            // Restore background scrolling
            document.body.style.overflow = '';

            // Restore focus to trigger element
            if (this.previousFocus) {
                this.previousFocus.focus();
                this.previousFocus = null;
            }

            // Remove focus trap
            document.removeEventListener('keydown', this.handleKeyDown);
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    // Trap focus within modal
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }

    // Initialize accessibility features
    initAccessibility() {
        try {
            // Add skip links
            this.addSkipLinks();

            // Improve form accessibility
            this.improveFormAccessibility();

            // Add reduced motion support
            this.handleReducedMotion();

            console.info('Accessibility features initialized');
        } catch (error) {
            console.error('Error initializing accessibility:', error);
        }
    }

    // Add skip navigation links
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Zum Hauptinhalt springen';

        document.body.insertBefore(skipLink, document.body.firstChild);

        const main = document.querySelector('.main');
        if (main) {
            main.id = 'main';
        }
    }

    // Improve form accessibility
    improveFormAccessibility() {
        // Add proper labels and descriptions for interactive elements
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            if (!link.getAttribute('aria-label')) {
                link.setAttribute('aria-label', `Telefonnummer ${link.textContent} anrufen`);
            }
        });
    }

    // Handle reduced motion preference
    handleReducedMotion() {
        if (this.isReducedMotion) {
            document.documentElement.style.setProperty('--transition-fast', '0.01ms');
            document.documentElement.style.setProperty('--transition-smooth', '0.01ms');
            // Pause all carousels auto-slide
            this.carousels.forEach(carousel => carousel.pauseAutoSlide());
        }

        // Listen for changes in motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            this.handleReducedMotion();
        });
    }

    // Initialize global event listeners
    initEventListeners() {
        try {
            // Global keyboard shortcuts
            document.addEventListener('keydown', this.handleKeyDown);

            // Window resize handler
            window.addEventListener('resize', this.handleResize);


            // Handle page visibility change (pause/resume auto-slide for all carousels)
            document.addEventListener('visibilitychange', () => {
                this.carousels.forEach(carousel => {
                    if (document.hidden) {
                        carousel.pauseAutoSlide();
                    } else {
                        carousel.resumeAutoSlide();
                    }
                });
            });

            console.info('Event listeners initialized');
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    // Global keyboard event handler
    handleKeyDown(event) {
        const { key, target } = event;

        // Close modal with Escape key
        if (key === 'Escape') {
            const openModal = document.querySelector('.modal--active');
            if (openModal) {
                this.closeModal(openModal);
                return;
            }
        }

        // Carousel keyboard navigation (only when carousel is focused)
        const carouselContainer = target.closest('.carousel-container');
        if (carouselContainer) {
            // Find which carousel this container belongs to
            const carouselIndex = Array.from(document.querySelectorAll('.carousel-container')).indexOf(carouselContainer);
            const carousel = this.carousels[carouselIndex];

            if (carousel) {
                switch (key) {
                    case 'ArrowLeft':
                        event.preventDefault();
                        carousel.prevSlide();
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        carousel.nextSlide();
                        break;
                }
            }
        }
    }

    // Handle outside clicks
    handleOutsideClick(event) {
        // Could be used for closing dropdowns, tooltips, etc.
    }

    // Handle window resize
    handleResize() {
        // Recalculate carousel dimensions if needed
        // Update any layout-dependent features
    }

    // Preload images for better performance
    preloadImages() {
        try {
            const images = document.querySelectorAll('img[src]');
            const imagePromises = Array.from(images).map(img => {
                return new Promise((resolve, reject) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.addEventListener('load', resolve);
                        img.addEventListener('error', reject);
                    }
                });
            });

            Promise.allSettled(imagePromises).then(results => {
                const failed = results.filter(result => result.status === 'rejected').length;
                if (failed > 0) {
                    console.warn(`${failed} images failed to load`);
                } else {
                    console.info('All images preloaded successfully');
                }
            });
        } catch (error) {
            console.error('Error preloading images:', error);
        }
    }
}

// Initialize application
const app = new PodologieApp();

// Service Worker Registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.info('ServiceWorker registration successful');
            })
            .catch((err) => {
                console.info('ServiceWorker registration failed (this is normal if sw.js doesn\'t exist)');
            });
    });
}

// Analytics placeholder (GDPR compliant)
window.addEventListener('load', () => {
    // Add your analytics code here
    // Make sure to implement proper GDPR consent before tracking
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PodologieApp };
}