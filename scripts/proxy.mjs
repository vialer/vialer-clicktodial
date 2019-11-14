import http from 'http';
import connect from 'connect';
import serveStatic from 'serve-static';
import request from 'request';
import cors from 'cors';

const portalUrl = process.env.VENDOR_PORTAL_URL;
const proxyPort = process.env.npm_package_config_proxyPort;
const servePort = process.env.npm_package_config_servePort;
const buildServePort = process.env.npm_package_config_buildServePort;

const staticDir = 'dist';
const corsOptions = {
  origin: [`http://localhost:${servePort}`, `http://localhost:${buildServePort}`],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
};

const app = connect();
app.use(cors(corsOptions));
app.use(serveStatic(staticDir));

function proxy(req, url, res) {
  return req.pipe(request(url).on('error', (err) => {
    console.error('proxy error to', url, err);
    // res.status(500).send('Proxy error') // doesn't work?
  })).pipe(res);
}

app.use('/api', (req, res) => {
  const url = `${portalUrl}api${req.url}`;
  proxy(req, url, res);
});

app.use('/segment', (req, res) => {
  const url = `https://api.segment.io${req.url}`;
  proxy(req, url, res);
});

app.use('/logentries', (req, res) => {
  const url = `https://js.logentries.com/v1/logs${req.url}`;
  proxy(req, url, res);
});

http.createServer(app).listen(proxyPort);
console.log(`HTTP proxy service listening on http://localhost:${proxyPort}`);
