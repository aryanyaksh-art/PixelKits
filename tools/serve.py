"""Local dev server for PixelKits with caching disabled.

Usage: python tools/serve.py [port]
Then open http://localhost:8765
"""
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"PixelKits running at http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
