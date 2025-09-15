#!/usr/bin/env python
"""
Simple HTTP Server for local development of the AUB Thesis Dashboard
This server correctly sets MIME types for HTML, CSS, JS, and visualization files
"""

import http.server
import socketserver
import os

# Configure the port
PORT = 8080

# Set up custom MIME types for HTML files and visualizations
class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

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
        return super().guess_type(path)

    def end_headers(self):
        """Add CORS headers to allow loading interactive visualizations."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

def run_server():
    """Start the HTTP server with the custom handler."""
    handler = CustomHTTPRequestHandler
    
    # Use the root directory instead of the dashboard directory
    # This ensures proper access to figures and other directories
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)
    print(f"Changed working directory to: {root_dir}")
    print(f"Dashboard should be accessible at: http://localhost:{PORT}/dashboard/")
    print(f"Figures should be accessible at: http://localhost:{PORT}/figures/")
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run_server()