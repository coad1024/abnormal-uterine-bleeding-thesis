/**
 * Path correction script for the dashboard
 * This script fixes issues with absolute vs relative paths
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Path correction script loaded');
    
    // Fix iframe sources
    document.querySelectorAll('iframe').forEach(function(iframe) {
        const src = iframe.getAttribute('src');
        if (src && src.startsWith('/figures/')) {
            console.log('Fixing iframe path:', src);
            iframe.setAttribute('src', '../figures' + src.substring('/figures'.length));
        }
    });
    
    // Fix image sources
    document.querySelectorAll('img').forEach(function(img) {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/figures/')) {
            console.log('Fixing image path:', src);
            img.setAttribute('src', '../figures' + src.substring('/figures'.length));
        }
    });
    
    // Fix open-in-new buttons
    document.querySelectorAll('.open-in-new').forEach(function(button) {
        const src = button.getAttribute('data-src');
        if (src && src.startsWith('/figures/')) {
            console.log('Fixing button path:', src);
            button.setAttribute('data-src', '../figures' + src.substring('/figures'.length));
        }
    });
    
    console.log('Path correction complete');
});