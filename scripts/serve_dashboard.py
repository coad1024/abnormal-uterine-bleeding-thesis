import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = str(Path(__file__).parent.parent)  # Navigate up one directory to reach thesis root

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    handler = MyHttpRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"\nServing Thesis Dashboard at http://localhost:{PORT}/dashboard/")
        print(f"Serving from directory: {DIRECTORY}")
        print("Press Ctrl+C to stop the server\n")
        
        # Open browser automatically
        webbrowser.open(f"http://localhost:{PORT}/dashboard/")
        
        # Keep the server running
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run_server()