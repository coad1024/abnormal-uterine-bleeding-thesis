/**
 * Direct tab functionality for correlation tabs
 * This is a fallback script that ensures tabs work even if the main script fails
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the components to be fully loaded
    setTimeout(function() {
        console.log('Initializing direct correlation tab functionality');
        
        // Find all tabs in the correlations section
        const correlationSection = document.getElementById('correlations');
        if (!correlationSection) {
            console.log('Correlations section not found');
            return;
        }
        
        // Get the tabs and content areas
        const tabs = correlationSection.querySelectorAll('.correlation-tab');
        const contents = correlationSection.querySelectorAll('.correlation-content');
        
        if (!tabs.length || !contents.length) {
            console.log('Correlation tabs or contents not found');
            return;
        }
        
        console.log(`Found ${tabs.length} tabs and ${contents.length} content areas`);
        
        // Add click handlers to each tab
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get target content ID
                const targetId = this.getAttribute('data-target');
                console.log(`Tab clicked: ${targetId}`);
                
                // Remove active states from all tabs
                tabs.forEach(t => {
                    t.classList.remove('border-teal-500');
                    t.classList.add('hover:border-gray-300', 'border-transparent');
                    t.removeAttribute('style');
                });
                
                // Add active state to clicked tab
                this.classList.remove('hover:border-gray-300', 'border-transparent');
                this.classList.add('border-teal-500');
                this.style.color = 'var(--highlight)';
                
                // Hide all content divs
                contents.forEach(content => {
                    content.classList.add('hidden');
                });
                
                // Show the target content
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    console.log(`Content shown: ${targetId}`);
                } else {
                    console.error(`Target content not found: ${targetId}`);
                }
            });
            
            console.log(`Added click handler to tab: ${tab.getAttribute('data-target')}`);
        });
        
        console.log('Direct correlation tab functionality initialized');
    }, 1500);
});