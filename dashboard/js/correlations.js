/**
 * Correlations Tab Functionality
 * Handles tab switching in the correlations section
 */

function initCorrelationTabs() {
    console.log('Initializing correlation tabs');
    
    const tabs = document.querySelectorAll('.correlation-tab');
    const contents = document.querySelectorAll('.correlation-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('border-teal-500');
                t.classList.add('hover:border-gray-300', 'border-transparent');
                t.removeAttribute('style');
            });
            
            // Add active class to clicked tab
            this.classList.remove('hover:border-gray-300', 'border-transparent');
            this.classList.add('border-teal-500');
            this.style.color = 'var(--highlight)';
            
            // Hide all content divs
            contents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show the relevant content div
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });

    // Initialize figure references tooltips
    initFigureRefs();
}

function initFigureRefs() {
    const figureRefs = document.querySelectorAll('.figure-ref');
    const tooltip = document.querySelector('.citation-tooltip');
    
    if (!tooltip) return;
    
    figureRefs.forEach(ref => {
        ref.addEventListener('mouseover', function(e) {
            const figure = this.getAttribute('data-figure');
            tooltip.innerHTML = `<strong>${figure}</strong>: Statistical correlation analysis from the thesis research.`;
            tooltip.classList.remove('hidden');
            
            // Position the tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${window.scrollY + rect.bottom + 10}px`;
            tooltip.style.left = `${window.scrollX + rect.left}px`;
        });
        
        ref.addEventListener('mouseout', function() {
            tooltip.classList.add('hidden');
        });
    });
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for components to be fully loaded
    setTimeout(initCorrelationTabs, 500);
});

// Add a direct initialization function that can be called from HTML
window.initCorrelationTabs = function() {
    console.log('Manual initialization of correlation tabs');
    initCorrelationTabs();
};