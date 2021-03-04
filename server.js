const http = require('http')
var fs = require('fs')

const server = http.createServer(function (req, res) {
    fs.readFile(__dirname + req.url, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
})

const port = process.argv[2] || 5000;

server.listen(port, () => {
    console.log(`server started at ${port}`);
})