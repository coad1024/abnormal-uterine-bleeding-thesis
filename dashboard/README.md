# Thesis Dashboard Viewing Instructions

## Method 1: Using Python HTTP Server (Recommended)

This method provides the most reliable experience with all features working correctly.

1. Open a terminal/command prompt
2. Navigate to the scripts folder:
   ```
   cd "C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\scripts"
   ```
3. Run the serve_dashboard.py script:
   ```
   python serve_dashboard.py
   ```
4. This will automatically open your browser to http://localhost:8000/dashboard/
5. The dashboard will now load with all components and interactive visualizations

## Method 2: Direct File Opening (Simple but Limited)

This method is quick but some features might not work properly.

1. Open File Explorer
2. Navigate to: `C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\dashboard`
3. Double-click on `index.html`
4. The dashboard will open in your default browser
5. Note: Some interactive visualizations may not load due to browser security restrictions

## Troubleshooting

If you encounter issues with the dashboard:

1. **Components not loading**: Make sure all component files are present in the components folder
2. **Interactive visualizations not appearing**: These require the HTTP server method (Method 1)
3. **Images not showing**: Check that the figures folder paths are correct
4. **Browser console errors**: Right-click in the browser, select "Inspect" and check the Console tab for error messages

## Dashboard Features

- **Advanced Visualizations**: Interactive charts including Sankey diagrams and sunburst charts
- **Responsive Design**: Works on both desktop and mobile devices
- **Search Functionality**: Find specific content within the thesis
- **Theme Switching**: Toggle between light and dark mode
- **PDF Export**: Generate a PDF version of the dashboard content