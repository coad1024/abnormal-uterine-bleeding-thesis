/**
 * Advanced Visualizations JavaScript
 * Handles functionality for the advanced visualization component
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for components to be fully loaded
    setTimeout(initAdvancedVisualizations, 500);
});

/**
 * Initialize the advanced visualizations component
 */
function initAdvancedVisualizations() {
    // Add click handlers for "Open Full Screen" buttons
    document.querySelectorAll('.open-in-new').forEach(button => {
        button.addEventListener('click', function() {
            const src = this.getAttribute('data-src');
            if (src) {
                window.open(src, '_blank', 'noopener,noreferrer');
            }
        });
    });

    // Handle iframe loading states
    document.querySelectorAll('.visualization-container iframe').forEach(iframe => {
        // Add loading indicator
        const container = iframe.parentElement;
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70';
        loadingIndicator.innerHTML = '<div class="loader"></div><span class="ml-2">Loading visualization...</span>';
        container.style.position = 'relative';
        container.appendChild(loadingIndicator);

        // Remove loading indicator when iframe loads
        iframe.addEventListener('load', function() {
            const indicator = this.parentElement.querySelector('.loading-indicator');
            if (indicator) {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    indicator.remove();
                }, 500);
            }
        });
    });

    console.log('Advanced visualizations initialized');
}