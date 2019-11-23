/*
  Copyright 2015 Johannes Filter, Rosario Raulin

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  */

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');

var app = express();
var router = express.Router();
var cfg = require('./config').Config;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./routes')(router);
app.use('/', router);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));

var fs = require('fs');

const isProduction = global.process.env.NODE_ENV === 'production';

if (isProduction) {
  var hskey = fs.readFileSync('/path/to/your/ssl/key.pem', 'utf8');
  var hscert = fs.readFileSync('/path/to/your/ssl/cert.pem', 'utf8');
  var options = {
      key: hskey,
      cert: hscert
  };
}


// module interface
var server = http.createServer(app);
if (isProduction) {
  var serverHttps = https.createServer(options, app);
}


var boot = function (port, httpsPort) {
  server.listen(port);
  if (isProduction) {
    serverHttps.listen(httpsPort);
  }
};

var shutdown = function () {
  server.close();
  if (isProduction) {
    serverHttps.close();
  }
};

if (require.main === module) {
  boot(cfg.port, cfg.httpsPort);
} else {
  exports.boot = boot;
  exports.shutdown = shutdown;
}
