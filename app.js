
const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const router = require("./config/routes");
const fs = require('fs');
const path = require("path");
const http = require('http');
const https = require('https');
const cors = require('cors');
const controller = require("./app/controllers");
const envPath = path.resolve(__dirname, '.env');

require('dotenv').config({ path: envPath });

const app = express(); 

// Content web
app.use('/app/views/css', express.static(path.join(__dirname, 'app/views/css')));
app.use('/app/views/js', express.static(path.join(__dirname, 'app/views/js')));


// Cookie
app.use(cookieParser());

// CORS configuration
const corsOptions = {
    origin: process.env.CORS,
    credentials: true // Enable credentials (cookies, authorization headers, etc)
};

app.use(cors(corsOptions));

// Logger setup
const formatDateToWIB = (date) => {
    const offset = 7 * 60;
    const localDate = new Date(date.getTime() + offset * 60 * 1000);
    return localDate.toISOString().replace('T', ' ').replace(/\..+$/, '');
};
  
morgan.token('date', () => {
    return formatDateToWIB(new Date());
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Logger middleware
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan("dev"));

// JSON parser
app.use(express.json());

// Error handlers
app.use(controller.api.main.onParseError);
app.use(controller.api.main.onError);

// Router
app.use(router);

// Server configuration
const httpPort = process.env.HTTP_PORT || 8081;
const httpsPort = process.env.HTTPS_PORT || 8443;
const hostname = '0.0.0.0'; 

let server;

const getLocalIP = () => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
};

const localIP = getLocalIP();

if (process.env.NODE_ENV === 'production') {
    // HTTPS Setup for production
    const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8');
    const credentials = { key: privateKey, cert: certificate, minVersion: 'TLSv1.3' };
    
    server = https.createServer(credentials, app);
    server.listen(httpsPort, hostname, () => {
        console.log(`HTTPS Server running in ${process.env.NODE_ENV} mode`);
        console.log(`Available on:`);
        console.log(`  • Local:    https://localhost:${httpsPort}`);
        console.log(`  • Network:  https://${localIP}:${httpsPort}`);
    });
} else {
    // HTTP Setup for development
    server = http.createServer(app);
    server.listen(httpPort, hostname, () => {
        console.log(`HTTP Server running in ${process.env.NODE_ENV} mode`);
        console.log(`Available on:`);
        console.log(`  • Local:    http://localhost:${httpPort}`);
        console.log(`  • Network:  http://${localIP}:${httpPort}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});