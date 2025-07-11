const { argv } = require("node:process");
const fs = require("node:fs");
const https = require("node:https");
const http = require("node:http");

const fetchStaticPages = require("./application.js"); // Import the app function from server1.js
const heading = "List of static resources:"; // Define a heading for the HTML page

const headers = {};
let host = "localhost";
let port = 8080;
let tls = false;
const options = {};
let filesDirectory = "static"; // Default directory for static files
let browserPath = "echo"; // This is a fake path for the browser to access the static files

const helpMessage = `
  -dir string
    	directory to serve static files from; default is "static" (default "static")
  -h, -help
    	show this help message and exit
  -addr string
    	full address (host:port) to listen on; don't use this if 'port' or 'host' are set (default "localhost:8080")
  -certfile string
    	TLS certificate file to use with -tls (default "cert.pem")
  -cors
    	enable CORS by returning Access-Control-Allow-Origin header
  -coop
    	enable Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
  -host string
    	specific host to listen on (default "localhost")
  -keyfile string
    	TLS key file to use with -tls (default "key.pem")
  -port string
    	port to listen on; if 0, a random available port will be used (default "8080")
  -tls
    	enable HTTPS serving with TLS
  -browserpath string
        path to serve static files for the browser; this is a fake path for the browser to access the static files (default "echo")
    `;
for (let i = 0; i < argv.length; i++) {
  const val = argv[i];

  if (val.startsWith("-port")) {
    port = parseInt(argv[i + 1], 10);
    i++;
  }

  if (val.startsWith("-browserpath")) {
    browserPath = argv[i + 1].trim();
    i++;
    console.log(`Browser path: ${browserPath}`);
  }

  if (val.startsWith("-dir")) {
    filesDirectory = argv[i + 1].trim();
    i++;
    console.log(`Files Directory: ${filesDirectory}`);
  }

  if (val.startsWith("-h")) {
    console.log(helpMessage);
    process.exit(0);
  }

  if (val.startsWith("-host")) {
    host = argv[i + 1].trim();
    if (host.startsWith("http://") || host.startsWith("https://")) {
      host = host.split("://")[1];
    }
    i++;
    console.log(`Host: ${host}`);
  }

  if (val.startsWith("-tls")) {
    tls = true;
    console.log("TLS enabled");
  }

if (val.startsWith("dir")) {
    filesDirectory = argv[i + 1].trim();
  }

  if (val.startsWith("-keyfile")) {
    options.key = fs.readFileSync(argv[i + 1].trim());
    i++;
  }

  if (val.startsWith("-certfile")) {
    options.cert = fs.readFileSync(argv[i + 1].trim());
    i++;
  }

  if (val.startsWith("-cors")) {
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    console.log("CORS headers added");
  }

  if (val.startsWith("-coop")) {
    headers["Cross-Origin-Opener-Policy"] = "same-origin";
    headers["Cross-Origin-Embedder-Policy"] = "require-corp";
  }

  if (val.startsWith("-addr")) {
    console.log(argv[i + 1]);
    const addr = argv[i + 1].split(":");
    if (addr.length === 2) {
      host = addr[0];
      port = parseInt(addr[1], 10);
      console.log(`Host: ${host}, Port: ${port}`);
    }
    i++;
  }
}

/**
 * The main entry point of the static server.
 * It initializes the server with the specified host, port, and TLS options.
 * If TLS is enabled, it creates an HTTPS server; otherwise, it creates an HTTP server.
 * The server serves static files from the specified path and returns a list of resources.  
 * It is assumed that your files are located in a directory named "static" within the same directory as this script.
 * @module static-server
 * @requires node:fs
 * @requires node:https
 * @requires node:http
 * @requires ./application.js   
 */

app = fetchStaticPages(browserPath, heading, headers, filesDirectory); // Initialize the app with the static path

if (tls) {
  https.createServer(options, app).listen(port, host, () => {
    console.log(`Server running at https://${host}:${port}/`);
  });
} else {
  http.createServer(app).listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
  });
}
