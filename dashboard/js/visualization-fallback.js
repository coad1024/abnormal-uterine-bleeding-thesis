/**
 * Visualization fallback script
 * This script checks if iframe content fails to load and provides a fallback
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for advanced visualizations to be loaded
    setTimeout(setupVisualizationFallbacks, 1000);
});

/**
 * Set up fallbacks for visualizations that fail to load
 */
function setupVisualizationFallbacks() {
    // Get all iframes in visualization containers
    const iframes = document.querySelectorAll('.visualization-container iframe');
    
    iframes.forEach(iframe => {
        // Check if the iframe failed to load
        iframe.addEventListener('error', handleIframeError);
        
        // Fix the src attribute if necessary (convert absolute to relative path)
        const src = iframe.getAttribute('src');
        if (src && src.startsWith('/figures/')) {
            console.log(`Converting absolute path to relative: ${src}`);
            iframe.setAttribute('src', `..${src}`);
        }
        
        // Also set a timeout to check if iframe loaded
        setTimeout(() => {
            try {
                // Try accessing iframe content - will throw error if cross-origin or not loaded
                const iframeContent = iframe.contentWindow || iframe.contentDocument;
                if (!iframeContent || !iframeContent.document) {
                    handleIframeError({ target: iframe });
                }
            } catch (error) {
                handleIframeError({ target: iframe });
            }
        }, 3000);
    });
}

/**
 * Handle iframe loading errors by showing a fallback image or message
 * @param {Event} event - The error event
 */
function handleIframeError(event) {
    const iframe = event.target;
    const container = iframe.parentElement;
    
    // Get the visualization type from iframe title or source
    const title = iframe.getAttribute('title') || '';
    const src = iframe.getAttribute('src') || '';
    
    // Create fallback element
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 p-4 rounded';
    
    // Determine if there's a static image fallback available
    let staticImagePath = '';
    
    if (src.includes('diagnosis_hierarchy_sunburst')) {
        staticImagePath = '../figures/histopathological_diagnoses.png';
    } else if (src.includes('age_to_diagnosis_sankey')) {
        staticImagePath = '../figures/diagnosis_by_age_group.png';
    } else if (src.includes('histopathological_diagnoses_log')) {
        staticImagePath = '../figures/histopathological_diagnoses_log.png';
    } else if (src.includes('common_complaints_log')) {
        staticImagePath = '../figures/common_complaints.png';
    }
    
    // Create appropriate fallback content
    if (staticImagePath) {
        fallbackDiv.innerHTML = `
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">Interactive visualization could not be loaded.</p>
            <img src="${staticImagePath}" alt="${title}" class="max-w-full max-h-64 object-contain" />
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">Displaying static version</p>
        `;
    } else {
        fallbackDiv.innerHTML = `
            <i class="fas fa-chart-bar text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
            <p class="text-center">The interactive visualization could not be loaded.</p>
            <p class="text-center text-sm mt-2">Please try using the server script to view this content.</p>
            <button class="mt-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded refresh-iframe">Try Again</button>
        `;
    }
    
    // Replace the iframe with fallback
    iframe.style.display = 'none';
    container.appendChild(fallbackDiv);
    
    // Add event listener to retry button if present
    const retryButton = fallbackDiv.querySelector('.refresh-iframe');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            iframe.style.display = '';
            fallbackDiv.remove();
            iframe.src = iframe.src; // Reload the iframe
        });
    }
}