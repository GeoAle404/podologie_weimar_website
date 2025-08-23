/**
 * Podologie Weimar Website JavaScript
 * Modern, accessible, and performance-optimized
 */

'use strict';

// App initialization
class PodologieApp {
    constructor() {
        this.currentSlideIndex = 0;
        this.slides = [];
        this.dots = [];
        this.autoSlideInterval = null;
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
            this.initCarousel();
            this.initTabNavigation();
            this.initModal();
            this.initAccessibility();
            this.initEventListeners();
            this.preloadImages();
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

    // Initialize image carousel
    initCarousel() {
        try {
            this.slides = Array.from(document.querySelectorAll('.carousel-slide'));
            this.dots = Array.from(document.querySelectorAll('.carousel-dot'));

            if (this.slides.length === 0) {
                console.info('No carousel slides found');
                return;
            }

            // Add ARIA labels to carousel controls
            const prevBtn = document.querySelector('.carousel-nav--prev');
            const nextBtn = document.querySelector('.carousel-nav--next');

            if (prevBtn) {
                prevBtn.setAttribute('aria-label', 'Vorheriges Bild');
                prevBtn.setAttribute('title', 'Vorheriges Bild');
            }
            if (nextBtn) {
                nextBtn.setAttribute('aria-label', 'Nächstes Bild');
                nextBtn.setAttribute('title', 'Nächstes Bild');
            }

            // Add ARIA labels to dots
            this.dots.forEach((dot, index) => {
                dot.setAttribute('aria-label', `Zu Bild ${index + 1} wechseln`);
                dot.setAttribute('title', `Bild ${index + 1}`);
            });

            // Set up carousel container ARIA
            const carouselContainer = document.querySelector('.carousel-container');
            if (carouselContainer) {
                carouselContainer.setAttribute('role', 'region');
                carouselContainer.setAttribute('aria-label', 'Bildergalerie der Praxis');
            }

            // Initialize first slide
            this.showSlide(0);

            // Auto-advance slides (only if user doesn't prefer reduced motion)
            if (!this.isReducedMotion) {
                this.startAutoSlide();
            }

            console.info(`Carousel initialized with ${this.slides.length} slides`);
        } catch (error) {
            console.error('Error initializing carousel:', error);
        }
    }

    // Show specific slide
    showSlide(index, announceChange = false) {
        try {
            if (index < 0 || index >= this.slides.length) {
                console.warn(`Invalid slide index: ${index}`);
                return;
            }

            // Update slides
            this.slides.forEach((slide, i) => {
                const isActive = i === index;
                slide.classList.toggle('carousel-slide--active', isActive);
                slide.setAttribute('aria-hidden', !isActive);
            });

            // Update dots
            this.dots.forEach((dot, i) => {
                const isActive = i === index;
                dot.classList.toggle('carousel-dot--active', isActive);
                dot.setAttribute('aria-pressed', isActive);
            });

            this.currentSlideIndex = index;

            // Announce slide change to screen readers
            if (announceChange) {
                this.announceSlideChange(index);
            }
        } catch (error) {
            console.error('Error showing slide:', error);
        }
    }

    // Navigate to next slide
    nextSlide() {
        const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
        this.showSlide(nextIndex, true);
        this.resetAutoSlide();
    }

    // Navigate to previous slide
    prevSlide() {
        const prevIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex, true);
        this.resetAutoSlide();
    }

    // Navigate to specific slide (1-indexed for user interface)
    currentSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.slides.length) {
            console.warn(`Invalid slide number: ${slideNumber}`);
            return;
        }
        this.showSlide(slideNumber - 1, true);
        this.resetAutoSlide();
    }

    // Start auto-advancing slides
    startAutoSlide() {
        if (this.isReducedMotion) return;

        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    // Reset auto-slide timer
    resetAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.startAutoSlide();
        }
    }

    // Stop auto-slide
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    // Announce slide change to screen readers
    announceSlideChange(index) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Bild ${index + 1} von ${this.slides.length}`;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
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
            this.stopAutoSlide();
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

            // Page visibility change (pause/resume auto-slide)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopAutoSlide();
                } else if (!this.isReducedMotion) {
                    this.startAutoSlide();
                }
            });

            // Handle carousel mouse interactions
            const carouselContainer = document.querySelector('.carousel-container');
            if (carouselContainer) {
                carouselContainer.addEventListener('mouseenter', () => {
                    this.stopAutoSlide();
                });

                carouselContainer.addEventListener('mouseleave', () => {
                    if (!this.isReducedMotion) {
                        this.startAutoSlide();
                    }
                });
            }

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
        if (target.closest('.carousel-container')) {
            switch (key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.nextSlide();
                    break;
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

// Global functions for backwards compatibility with inline event handlers
let app;

function nextSlide() {
    if (app) app.nextSlide();
}

function prevSlide() {
    if (app) app.prevSlide();
}

function currentSlide(slideNumber) {
    if (app) app.currentSlide(slideNumber);
}

// Initialize application
app = new PodologieApp();

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