var http = require('http');
var multiparty = require('multiparty');
var fs = require('fs');

var _root = '/home/zhouwei3-xy';

var server = http.createServer(function(req, res) {
  switch (req.url) {
    case '/':
      display_form(req, res);
      break;
    case '/fileupload.js':
      upload_js(req, res);
      break;
    case '/upload':
      upload_file(req, res);
      break;
    default:
      show_404(req, res);
      break;
  }
});
server.listen(8999);

function display_form(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const readable = fs.createReadStream(_root + '/vue-fileupload/demo/fileupload.html');
  readable.pipe(res);
}

function upload_js(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/javascript' });
  const readable = fs.createReadStream(_root + '/vue-fileupload/dist/js/fileupload.js');
  readable.pipe(res);
}
function upload_file(req, res) {
    console.log('--------upload_file-------');
    console.dir(req.headers);
    var count = 0;
    var form = new multiparty.Form({
        encoding: 'binary'
    });
    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    form.on('part', function(part) {

        console.log('--------------------part----------------');

        console.log('--------------------headers');
        console.dir(part.headers);
        console.log('--------------------filename');
        console.log(part.filename);

        if (part.filename) {
            var writable = fs.createWriteStream(_root + '/test/'+part.filename);
            count++;
            console.log('got file named ' + part.filename);
            part.pipe(writable);
            part.resume();
        }

        part.on('data', function(chunk){
            console.log(`Received ${chunk.length} bytes of data.`);
        });


        part.on('error', function(err) {
            console.log(err);
        });
    });

    form.on('close', function() {
      console.log('Upload completed!');
      res.writeHead(200, {'Content-Type': 'text/plain'});
      var data = {
        errno: 0,
        errmsg: '',
        msg: 'Received ' + count + ' files'
      }
      res.end(JSON.stringify(data));
  });

  form.parse(req);
}

function show_404(req, res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write('You\'r doing it wrong!');
  res.end();
}
