# Static Server

A simple Node.js static file server. This is experimental.

## Features

- Serves static files (HTML, CSS, JS, images, etc.)
- Handles common browser MIME types
- Easy to configure and run
- It is assumed that your files are located in a directory named "static" within the same directory as this script.


## Usage

1. Start the server:

   ```bash
   node static-server.js
   ```

2. By default, the server listens on port 8080. You can access it in your browser:

   ```
   http://localhost:8080/
   ```


## Configuration

1. Flags one could use to configure the server: 
    ```
    $ node static-server -h

    -dir string
    	directory to serve static files from; default is "static" (default "static")
    -h
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
    ```

2. Use as API:
    ```
    const http = require('node:http');
    const https = require('node:https');
    const fetchStaticPages = require('./static-server/application.js'); // Import the app function from server1.js


    var heading = "List of static resources:"; // Define a heading for the HTML page
    const headers = {}; // Your header settings
    app = fetchStaticPages("echo", heading, headers); // Initialize the app with the static path

    http.createServer(app).listen(8080);

    ```

## Limitations
   If the the file is a folder, it won't open it from broswer action after listing.

## License

MIT

