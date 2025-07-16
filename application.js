var path = require("path");
const fs = require("node:fs");
const mimeType = require("./mimetype.js"); // Import the mimeType object

module.exports = app; // Export the app function

function readFile(pathname, staticPath, filesDirectory) {
  var filePath = path.join(
    __dirname,
    filesDirectory,
    pathname.replace(staticPath, ""),
  );
  console.log("Reading file:", filePath);
  let size;
  try {
    let lstat = fs.lstatSync(filePath); // Check if file exists
    lstat.isFile(); // Ensure it's a file
    if (lstat.isDirectory()) {
      throw new Error("Not a file but directory");
    }
    size = lstat.size;
  } catch (err) {
    console.error("File not found:", filePath);
    throw new Error("File not found may be a directory");
  }
  try {
    let file = fs.createReadStream(filePath);
    return [file, size];
  } catch (err) {
    console.error("Error reading file:", err);
    throw new Error("Could not read file");
  }
}

function basicHTML(staticPath, input, filesDirectory, innerDirectory = "") {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"> 
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Static Server</title>
    </head> 
    <body>
      <h1>Welcome to the Static Server</h1>
      <p>${input}</p>
      <ul>
          ${listResources(staticPath, filesDirectory, innerDirectory)
            .map((file) => `<li><a href="${file}">${file}</a></li>`)
            .join("")}
      </ul>
    </body>
    </html>`;
}

function listResources(staticPath, filesDirectory, innerDirectory = "") {
  var dirPath = path.join(
    __dirname,
    innerDirectory ? filesDirectory + "/" + innerDirectory : filesDirectory,
  );
  if (!fs.existsSync(dirPath)) {
    console.error("Directory does not exist:", dirPath);
    throw new Error("Directory does not exist");
  }
  try {
    var files = fs.readdirSync(dirPath);
    return files.map((file) => {
      return path.join(
        staticPath,
        innerDirectory ? innerDirectory + "/" + file : file,
      );
    });
  } catch (err) {
    console.error("Error reading directory:", err);
  }
}

function app(staticPath, heading, headers, filesDirectory = "static", log) {
  filesDirectory = filesDirectory.includes("/")
    ? filesDirectory.replaceAll("/", "")
    : filesDirectory;

  return function (req, res, next) {
    if (staticPath === undefined) {
      staticPath = "/static/";
    }
    if (staticPath[0] !== "/") {
      staticPath = "/" + staticPath;
    }
    if (staticPath[staticPath.length - 1] !== "/") {
      staticPath += "/";
    }

    let baseURL = "http://" + req.headers.host + "/";
    let myURL = new URL(req.url, baseURL);
    const sanitizePath = path
      .normalize(myURL.pathname)
      .replace(/^(\.\.[\/\\])+/, "");

    if ("GET" == req.method && (sanitizePath === "/" || sanitizePath === "")) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(basicHTML(staticPath, heading, filesDirectory));
      console.log(req.method, "Request for", sanitizePath);
      log.info(
        req.method,
        "Request for",
        sanitizePath,
        "from ",
        req.socket.remoteAddress,
        `host: ${req.headers.host}`,
        `File name: ${path.basename(__filename)}`,
      );
      return;
    }

    if (sanitizePath.startsWith(staticPath) && "GET" == req.method) {
      try {
        const lastIndex = sanitizePath.lastIndexOf(".");
        const ext = lastIndex !== -1 ? sanitizePath.slice(lastIndex) : "";
        console.log(ext);
        let contentType = mimeType[ext] ? mimeType[ext] : "text/plain";

        let [file, size] = readFile(
          decodeURIComponent(sanitizePath),
          staticPath,
          filesDirectory,
        );
        res.writeHead(200, {
          "Content-Length": size,
          "Content-Type": contentType,
          ...headers,
        });
        log.info(
          req.method,
          "Request for",
          sanitizePath,
          "from ",
          req.socket.remoteAddress,
          `host: ${req.headers.host}`,
          `File name: ${path.basename(__filename)}`,
        );

        file.pipe(res);
        return;
      } catch (err) {
        try {
          if (
            err.message == "Not a file but directory" ||
            err.message == "File not found may be a directory"
          ) {
            log.warn(
              req.method,
              "Request for",
              sanitizePath,
              "from ",
              req.socket.remoteAddress,
              `host: ${req.headers.host}`,
              `Expected a file but got a directory or file not found`,
              `File name: ${path.basename(__filename)}`,
            );

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(
              basicHTML(
                staticPath,
                heading,
                filesDirectory,
                sanitizePath.replaceAll(staticPath, ""),
              ),
            );
            return;
          }
        } catch (err) {
          log.error(
            "Error handling request:",
            req.method,
            sanitizePath,
            "from",
            req.socket.remoteAddress,
            `host: ${req.headers.host}`,
            `Error: ${err.message}`,
            `File name: ${path.basename(__filename)}`,
          );
          res.statusCode = 404;
          res.end(`Path ${sanitizePath}: ${err.message}`);
          return;
        }
        log.error(
          "Error handling request:",
          req.method,
          sanitizePath,
          "from",
          req.socket.remoteAddress,
          `host: ${req.headers.host}`,
          `Error: ${err.message}`,
          `File name: ${path.basename(__filename)}`,
        );
        res.statusCode = 404;
        res.end(`Path ${sanitizePath}: ${err.message}`);
        return;
      }
    }
    log.error(
      "Error handling request:",
      req.method,
      sanitizePath,
      "from",
      req.socket.remoteAddress,
      `host: ${req.headers.host}`,
      "Error: method not allowed or path not found",
      `File name: ${path.basename(__filename)}`,
    );

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(
      `The requested resource ${sanitizePath} was not found on this server.`,
    );
  };
}

//https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs
//curl http://127.0.0.1:8080/echo
//http.createServer(app).listen(8080);
