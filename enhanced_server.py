#!/usr/bin/env python
"""
Enhanced HTTP Server for AUB Thesis Dashboard
Includes detailed error logging and debugging information
"""

import http.server
import socketserver
import os
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('dashboard-server')

# Configure the port
PORT = 9090

class DebugHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler with detailed logging and CORS support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def do_GET(self):
        """Handle GET requests with detailed logging"""
        # Log the request
        logger.info(f"GET request for: {self.path}")
        
        # Check if the file exists
        if self.path == '/':
            self.path = '/dashboard/'
        
        # Handle trailing slash redirects properly
        if self.path.endswith('/'):
            for index in ['index.html', 'index.htm']:
                index_path = self.translate_path(self.path + index)
                if os.path.exists(index_path):
                    self.path = self.path + index
                    break
        
        file_path = self.translate_path(self.path)
        file_exists = os.path.exists(file_path)
        
        if file_exists and os.path.isfile(file_path):
            logger.info(f"File found: {file_path}")
        else:
            logger.warning(f"File not found: {file_path}")
            
        try:
            return super().do_GET()
        except Exception as e:
            logger.error(f"Error serving {self.path}: {str(e)}")
            self.send_error(500, f"Server error: {str(e)}")

    def guess_type(self, path):
        """Customize MIME types for different file extensions."""
        if path.endswith(".html"):
            return "text/html; charset=UTF-8"
        elif path.endswith(".css"):
            return "text/css; charset=UTF-8"
        elif path.endswith(".js"):
            return "application/javascript; charset=UTF-8"
        elif path.endswith(".json"):
            return "application/json; charset=UTF-8"
        elif path.endswith(".png"):
            return "image/png"
        elif path.endswith(".jpg") or path.endswith(".jpeg"):
            return "image/jpeg"
        elif path.endswith(".svg"):
            return "image/svg+xml"
        mime_type = super().guess_type(path)
        logger.debug(f"MIME type for {path}: {mime_type}")
        return mime_type

    def end_headers(self):
        """Add CORS headers to allow loading interactive visualizations."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def log_message(self, format, *args):
        """Override to use our logger instead of stderr"""
        logger.info(format % args)

def check_directory_structure():
    """Verify that critical directories exist and log their contents"""
    root_dir = os.path.dirname(os.path.abspath(__file__))
    dashboard_dir = os.path.join(root_dir, 'dashboard')
    figures_dir = os.path.join(root_dir, 'figures')
    
    logger.info(f"Root directory: {root_dir}")
    
    # Check dashboard directory
    if os.path.exists(dashboard_dir):
        logger.info(f"Dashboard directory exists: {dashboard_dir}")
        dashboard_files = os.listdir(dashboard_dir)
        logger.info(f"Dashboard files: {dashboard_files[:10]}{'...' if len(dashboard_files) > 10 else ''}")
    else:
        logger.error(f"Dashboard directory missing: {dashboard_dir}")
    
    # Check figures directory
    if os.path.exists(figures_dir):
        logger.info(f"Figures directory exists: {figures_dir}")
        figures_files = os.listdir(figures_dir)
        logger.info(f"Figures files: {figures_files[:10]}{'...' if len(figures_files) > 10 else ''}")
        
        # Check for HTML files specifically
        html_files = [f for f in figures_files if f.endswith('.html')]
        logger.info(f"HTML files in figures: {html_files}")
    else:
        logger.error(f"Figures directory missing: {figures_dir}")

def run_server():
    """Start the HTTP server with the custom handler"""
    # Check directory structure
    check_directory_structure()
    
    # Use the root directory to ensure proper path resolution
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)
    logger.info(f"Changed working directory to: {root_dir}")
    
    handler = DebugHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            logger.info(f"Server running at http://localhost:{PORT}/")
            logger.info(f"Dashboard URL: http://localhost:{PORT}/dashboard/")
            logger.info("Press Ctrl+C to stop the server")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                logger.info("Server stopped by user.")
    except Exception as e:
        logger.error(f"Error starting server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_server()