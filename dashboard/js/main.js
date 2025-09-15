/**
 * Main JavaScript file for the AUB Thesis Dashboard
 * Handles component loading, initialization, and core functionality
 * Version: 1.0.0 (All components modularized)
 */

console.log('Loading AUB Thesis Dashboard v1.0.0 - Modular Implementation');

// Global state for the dashboard
const dashboardState = {
    theme: localStorage.getItem('theme') || 'light',
    activeFilters: new Set(['all']),
    searchResults: [],
    chartInstances: {}
};

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing dashboard...');
    
    // Load all components
    loadAllComponents().then(() => {
        console.log('All components loaded');
        
        // Initialize functionality after components are loaded
        if (typeof initThemeToggle === 'function') initThemeToggle();
        if (typeof initMobileMenu === 'function') initMobileMenu();
        if (typeof initSearch === 'function') initSearch();
        if (typeof initPdfExport === 'function') initPdfExport();
        
        // Initialize specific components
        if (typeof initCharts === 'function') initCharts();
        if (typeof initGallery === 'function') initGallery();
        if (typeof initCorrelationTabs === 'function') {
            console.log('Initializing correlation tabs from main.js');
            initCorrelationTabs();
        }
        if (typeof initAdvancedVisualizations === 'function') initAdvancedVisualizations();
        if (typeof initAskThesis === 'function') initAskThesis();
        
        // Update navigation based on scroll position
        updateActiveNavLinks();
        window.addEventListener('scroll', updateActiveNavLinks);
        
        // Hide loading spinner if it exists
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    });
});

/**
 * Load all HTML components into their respective containers
 */
async function loadAllComponents() {
    // Load all components
    const components = [
        { name: 'header', target: '#header-container' },
        { name: 'overview', target: '#overview-container' },
        { name: 'demographics', target: '#demographics-container' },
        { name: 'findings', target: '#findings-container' },
        { name: 'correlations', target: '#correlations-container' },
        { name: 'advanced-visualizations', target: '#advanced-visualizations-container' },
        { name: 'gallery', target: '#gallery-container' },
        { name: 'discussion', target: '#discussion-container' },
        { name: 'ask', target: '#ask-container' },
        { name: 'conclusion', target: '#conclusion-container' }
    ];
    
    const loadPromises = components.map(component => 
        loadComponent(component.name, component.target)
    );
    
    return Promise.all(loadPromises);
}

/**
 * Load a single component from the components directory
 * @param {string} name - The component name
 * @param {string} targetSelector - The CSS selector for the target container
 */
async function loadComponent(name, targetSelector) {
    try {
        console.log(`Trying to load component: ${name}`);
        const response = await fetch(`./components/${name}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${name} (Status: ${response.status})`);
        }
        
        const html = await response.text();
        const targetElement = document.querySelector(targetSelector);
        
        if (targetElement) {
            targetElement.innerHTML = html;
            console.log(`Successfully loaded component: ${name}`);
        } else {
            console.error(`Target element not found: ${targetSelector}`);
        }
        
        return true;
    } catch (error) {
        console.error(`Error loading component ${name}:`, error);
        
        // Add a visible error message in the container
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.innerHTML = `
                <div class="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                    <h3 class="font-bold">Error Loading Component: ${name}</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
        
        return false;
    }
}

/**
 * Update active navigation links based on current scroll position
 */
function updateActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSectionId = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = window.scrollY;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Close mobile menu when a nav item is clicked
        const mobileNavLinks = mobileMenu.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

// Export functions for use in other modules
window.dashboardState = dashboardState;
window.dashboardUtils = {
    loadComponent
};