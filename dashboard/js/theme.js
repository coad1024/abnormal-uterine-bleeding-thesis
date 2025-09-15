/**
 * Theme toggle functionality for the AUB Thesis Dashboard
 * Handles light/dark mode switching and persistence
 */

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Set initial theme
    applyTheme(dashboardState.theme);
    
    themeToggle.addEventListener('click', () => {
        // Toggle theme
        const newTheme = dashboardState.theme === 'dark' ? 'light' : 'dark';
        dashboardState.theme = newTheme;
        
        // Save to local storage and apply
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}

/**
 * Apply theme to document and update UI
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
    const isDark = theme === 'dark';
    
    // Update data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply class for Tailwind dark mode
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Update system preference meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#1e293b' : '#ffffff');
    }
    
    // Update charts if they exist
    if (window.dashboardState && window.dashboardState.chartInstances) {
        Object.values(window.dashboardState.chartInstances).forEach(chart => {
            if (chart && chart.options) {
                updateChartTheme(chart, isDark);
            }
        });
    }
}

/**
 * Update chart theme based on current theme
 * @param {Chart} chart - Chart.js instance
 * @param {boolean} isDark - Whether dark mode is active
 */
function updateChartTheme(chart, isDark) {
    // Update chart colors for theme
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update options
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.grid.color = gridColor;
    chart.options.plugins.legend.labels.color = textColor;
    chart.options.plugins.title.color = textColor;
    
    // Update and render
    chart.update();
}