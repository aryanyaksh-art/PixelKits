"""Local dev server for PixelKits with caching disabled.

Usage: python tools/serve.py [port]
Then open http://localhost:8765

Dev-only: POST /__shot?name=foo with a PNG data URL body saves .shots/foo.png
(used by the in-page test harness in src/scenes/debug.js).
"""
import base64
import http.server
import os
import sys
import urllib.parse

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        if url.path != "/__shot":
            self.send_error(404)
            return
        name = urllib.parse.parse_qs(url.query).get("name", ["shot"])[0]
        name = "".join(c for c in name if c.isalnum() or c in "-_") or "shot"
        body = self.rfile.read(int(self.headers.get("Content-Length", 0))).decode()
        data = base64.b64decode(body.split(",", 1)[1])
        os.makedirs(os.path.join(ROOT, ".shots"), exist_ok=True)
        with open(os.path.join(ROOT, ".shots", name + ".png"), "wb") as f:
            f.write(data)
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):
        if "__shot" not in (args[0] if args else ""):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    os.chdir(ROOT)
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"PixelKits running at http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), Handler).serve_forever()
