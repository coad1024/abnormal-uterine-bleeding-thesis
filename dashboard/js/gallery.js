/**
 * Image gallery functionality for the AUB Thesis Dashboard
 * Handles filtering, modal viewing, and image zooming
 */

/**
 * Initialize the image gallery
 */
function initGallery() {
    // Setup filter buttons
    initGalleryFilters();
    
    // Setup image modal functionality
    initImageModal();
}

/**
 * Initialize gallery filter functionality
 */
function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (!filterButtons.length || !galleryItems.length) return;
    
    // Set up click handlers for filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button styling
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-teal-100', 'dark:bg-teal-900', 'text-teal-800', 'dark:text-teal-100', 'active');
                btn.classList.add('bg-gray-100', 'dark:bg-gray-700');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            button.classList.remove('bg-gray-100', 'dark:bg-gray-700');
            button.classList.add('bg-teal-100', 'dark:bg-teal-900', 'text-teal-800', 'dark:text-teal-100', 'active');
            button.setAttribute('aria-pressed', 'true');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * Initialize modal for viewing images
 */
function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const resetZoom = document.getElementById('reset-zoom');
    
    if (!modal || !modalImage || !closeModal || !galleryItems.length) return;
    
    // Current zoom level
    let currentZoom = 1;
    
    // Set up gallery item click handlers
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;
            
            // Set modal image source and reset zoom
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            currentZoom = 1;
            modalImage.style.transform = `scale(${currentZoom})`;
            
            // Show modal
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            
            // Set focus on close button for accessibility
            closeModal.focus();
        });
    });
    
    // Close modal functionality
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });
    
    // Zoom functionality
    if (zoomIn && zoomOut && resetZoom) {
        zoomIn.addEventListener('click', () => {
            currentZoom += 0.25;
            if (currentZoom > 3) currentZoom = 3;
            modalImage.style.transform = `scale(${currentZoom})`;
        });
        
        zoomOut.addEventListener('click', () => {
            currentZoom -= 0.25;
            if (currentZoom < 0.5) currentZoom = 0.5;
            modalImage.style.transform = `scale(${currentZoom})`;
        });
        
        resetZoom.addEventListener('click', () => {
            currentZoom = 1;
            modalImage.style.transform = `scale(${currentZoom})`;
        });
    }
    
    // Image dragging functionality
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    
    modalImage.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalImage.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        modalImage.style.transform = `scale(${currentZoom}) translate(${translateX/currentZoom}px, ${translateY/currentZoom}px)`;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        modalImage.style.cursor = 'grab';
    });
    
    // Reset position on zoom change
    [zoomIn, zoomOut, resetZoom].forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                translateX = 0;
                translateY = 0;
                modalImage.style.transform = `scale(${currentZoom})`;
            });
        }
    });
}