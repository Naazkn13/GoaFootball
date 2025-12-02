const express = require("express");
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const config = require('./config/config_api.json');
const cors = require('cors');
const helmet = require('helmet');
const url = require('url');
const proxy = require('http-proxy');
const apiProxy = proxy.createProxyServer();
const request = require('request');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { exec } = require('child_process');
const port = config.port || 3000;

app.prepare().then(() => {
  const server = express();

  // CORS configuration
  server.use(cors({ 
    origin: [/\localhost:3000$/, /\.yourdomain\.com$/] 
  }));
  
  server.disable('x-powered-by');
  
  // Helmet for security headers
  server.use(helmet({
    contentSecurityPolicy: false
  }));

  server.use('/assets', express.static('public'));

  // API proxy routes - to be configured based on your backend
  server.use('/api/auth/*', api_Proxy);
  server.use('/api/user/*', api_Proxy);
  server.use('/api/payment/*', api_Proxy);

  // Health check endpoint
  server.get('/healthcheck', function (req, res) {
    checkDiskSpace(config.diskPath || '/')
      .then(function (result) {
        if (result && result.free && result.free > 500000) {
          res.status(200).send({ 
            status: true, 
            message: 'Server is healthy',
            diskSpace: result 
          });
        } else {
          res.status(500).send({ 
            status: false, 
            message: 'Low disk space' 
          });
        }
      })
      .catch(function (err) {
        console.log("Health check error:", err);
        res.status(500).send({ 
          status: false, 
          message: 'Health check failed' 
        });
      });
  });

  // Disk check endpoint
  server.get('/diskcheck', function (req, res) {
    checkDiskSpace(config.diskPath || '/')
      .then(function (result) {
        res.status(200).send({ 
          status: true, 
          free: result.free, 
          size: result.size,
          diskPath: result.diskPath 
        });
      })
      .catch(function (err) {
        console.log("Disk check error:", err);
        res.status(500).send({ 
          status: false, 
          message: err.message 
        });
      });
  });

  // Handle all other routes with Next.js
  server.get("*", (req, res) => {
    return handle(req, res);
  });
  
  server.post("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});

// API Proxy function
function api_Proxy(req, res) {
  var proxiedUrl = req.baseUrl;
  var url_parts = url.parse(req.url, true);
  
  if (url_parts.search !== null) {
    proxiedUrl += url_parts.search;
  }
  
  var parts = proxiedUrl.split('/');
  
  if (config.proxyUrl && config.proxyUrl[parts[2]]) {
    proxiedUrl = proxiedUrl.replace("/api/" + parts[2] + "/", "");
    req.url = proxiedUrl;
    
    apiProxy.web(req, res, {
      target: config.proxyUrl[parts[2]]
    });

    apiProxy.on('error', function (e) {
      console.log("Proxy error:", e);
      res.status(500).send({
        error: "Proxy error",
        message: e.message
      });
    });
  } else {
    res.status(404).send({
      error: "Not Found",
      message: "API endpoint not configured"
    });
  }
}

// Disk space check for Unix systems
function checkDiskSpace(directoryPath) {
  if (!path.normalize(directoryPath).startsWith(path.sep)) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Invalid path (should start with " + path.sep + "): " + directoryPath));
    });
  }
  
  return check(
    "df -Pk \"" + getFirstExistingParentPath(directoryPath) + "\"",
    function () { return true; },
    {
      diskPath: 5,
      free: 3,
      size: 1
    },
    1024 // Convert kB to bytes
  );
}

// Execute command and parse output
function check(cmd, filter, mapping, coefficient) {
  if (coefficient === void 0) { coefficient = 1; }
  
  return new Promise(function (resolve, reject) {
    exec(cmd, function (error, stdout) {
      if (error) {
        reject(error);
        return;
      }
      
      try {
        resolve(mapOutput(stdout, filter, mapping, coefficient));
      } catch (error2) {
        reject(error2);
      }
    });
  });
}

// Map command output to disk space info
function mapOutput(stdout, filter, mapping, coefficient) {
  if (coefficient === void 0) { coefficient = 1; }
  
  var parsed = stdout.trim().split('\n').slice(1).map(function (line) {
    return line.trim().split(/\s+(?=[\d/])/);
  });
  
  var filtered = parsed.filter(filter);
  
  if (filtered.length === 0) {
    throw new Error("No disk space information found");
  }
  
  filtered = filtered[0];
  
  return {
    diskPath: filtered[mapping.diskPath],
    free: parseInt(filtered[mapping.free], 10) * coefficient,
    size: parseInt(filtered[mapping.size], 10) * coefficient
  };
}

// Get first existing parent path
function getFirstExistingParentPath(directoryPath) {
  var parentDirectoryPath = directoryPath;
  var parentDirectoryFound = fs.existsSync(parentDirectoryPath);
  
  while (!parentDirectoryFound) {
    parentDirectoryPath = path.normalize(parentDirectoryPath + '/..');
    parentDirectoryFound = fs.existsSync(parentDirectoryPath);
  }
  
  return parentDirectoryPath;
}
