var express = require('express');
var app = express();
var path = require("path");
var fs = require('fs');
const port = 3000;

/**
 * Initial response format.
 */
const jsonFormat = {
  success: true,
  data: [],
  errors: false
}

/**
 * Returns error response.
 *
 * @param {NodeJSResponse} res
 * @param {any} errors
 */
function sendError(res, errors) {
  return res.send(Object.assign(jsonFormat, {
    success: false,
    errors
  }));
}

/**
 * Returns success response.
 *
 * @param {NodeJSResponse} res
 * @param {any} errors
 */
function sendSuccess(res, data) {
  return res.send(Object.assign(jsonFormat, {data}));
}

//allow us to fetch static scripts
app.use(express.static('public'));
// sends static file
app.get('/api/:file/', function (req, res) {
  const filePath = path.join(`${__dirname}/db/${req.params.file}.json`);
  fs.exists(filePath, function (isExists) {
    if (!isExists)
      return sendError(res, {message: 'No such file!'});
    return sendSuccess(res, JSON.parse(fs.readFileSync(filePath)));
  });
});
// catch all routes to fall back to our main file
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});


app.listen(port, function () {
  console.log(`localhost:${port}`);
});

