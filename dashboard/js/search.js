/**
 * Search functionality for the AUB Thesis Dashboard
 * Handles the search overlay and content searching
 */

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchToggle || !searchOverlay || !closeSearch || !searchInput || !searchResults) return;
    
    // Toggle search overlay
    searchToggle.addEventListener('click', () => {
        searchOverlay.classList.remove('hidden');
        searchInput.focus();
        searchInput.value = '';
        searchResults.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400 p-4">Enter a search term above to search through the thesis content.</p>';
    });
    
    // Close search overlay
    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.add('hidden');
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
            searchOverlay.classList.add('hidden');
        }
    });
    
    // Search functionality
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        
        // Show loading state
        searchResults.innerHTML = '<div class="flex justify-center p-4"><div class="loader"></div></div>';
        
        // Debounce search to avoid excessive processing
        debounceTimeout = setTimeout(() => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm.length < 2) {
                searchResults.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400 p-4">Please enter at least 2 characters to search.</p>';
                return;
            }
            
            performSearch(searchTerm, searchResults);
        }, 300);
    });
}

/**
 * Perform search across dashboard content
 * @param {string} searchTerm - The term to search for
 * @param {HTMLElement} resultsContainer - Where to display the results
 */
function performSearch(searchTerm, resultsContainer) {
    // Get all text content from the page
    const mainContent = document.querySelector('main');
    if (!mainContent) {
        resultsContainer.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400 p-4">Search functionality is not available.</p>';
        return;
    }
    
    // Get all sections
    const sections = mainContent.querySelectorAll('section[id]');
    const results = [];
    
    // Search through each section
    sections.forEach(section => {
        const sectionId = section.getAttribute('id');
        const sectionTitle = section.querySelector('h2') ? section.querySelector('h2').textContent : sectionId;
        
        // Get paragraphs from section
        const paragraphs = section.querySelectorAll('p');
        
        paragraphs.forEach(paragraph => {
            const text = paragraph.textContent.toLowerCase();
            
            if (text.includes(searchTerm)) {
                // Create excerpt with highlighted search term
                let excerpt = paragraph.textContent;
                
                // Limit excerpt length
                if (excerpt.length > 150) {
                    const searchTermIndex = excerpt.toLowerCase().indexOf(searchTerm);
                    const startIndex = Math.max(0, searchTermIndex - 50);
                    const endIndex = Math.min(excerpt.length, searchTermIndex + searchTerm.length + 50);
                    
                    excerpt = (startIndex > 0 ? '...' : '') + 
                              excerpt.substring(startIndex, endIndex) + 
                              (endIndex < excerpt.length ? '...' : '');
                }
                
                // Highlight search term
                const highlightedExcerpt = excerpt.replace(
                    new RegExp(searchTerm, 'gi'), 
                    match => `<span class="bg-yellow-200 dark:bg-yellow-800">${match}</span>`
                );
                
                results.push({
                    sectionId,
                    sectionTitle,
                    highlightedExcerpt
                });
            }
        });
    });
    
    // Display results
    if (results.length > 0) {
        resultsContainer.innerHTML = `
            <p class="text-sm mb-4">Found ${results.length} result${results.length !== 1 ? 's' : ''}:</p>
            <div class="space-y-4">
                ${results.map(result => `
                    <div class="p-3 rounded bg-gray-50 dark:bg-gray-700">
                        <a href="#${result.sectionId}" class="text-teal-600 dark:text-teal-400 hover:underline font-medium" 
                           onclick="document.getElementById('search-overlay').classList.add('hidden')">
                            ${result.sectionTitle}
                        </a>
                        <p class="text-sm mt-1">${result.highlightedExcerpt}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        resultsContainer.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400 p-4">No matching results found.</p>';
    }
}