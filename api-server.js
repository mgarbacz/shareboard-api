// App Config
var application_root = __dirname,
    express = require('express'),
    path = require('path'),
    mongoose = require('mongoose');

var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(application_root, 'public')));
    app.use(express.errorHandler({dumpExceptions: 'true', showStack: 'true'}))
});

// Database
mongoose.connect('mongodb://localhost/shareboard_database');

var Schema = mongoose.Schema;

var Board = new Schema({
    lists: [Lists]
});

var Lists = new Schema({
    name: String,
    items: [Items]
});

var Items = new Schema({
    text: String
});

var BoardModel = mongoose.model('Board', Board);

// API spec
app.get('/boards', function(request, response) {
    return BoardModel.find(function(error, boards) {
        if (!error) {
            return response.send(boards);
        } else {
            return console.log(error);
        }
    });
});

app.post('/boards', function(request, response) {
    var board;
    console.log('POST: ');
    console.log(request.body);
    board = new BoardModel({
        lists: request.body.lists
    });
    board.save(function(error) {
        if (!error) {
            console.log('Board created successfully');
        } else {
            return console.log(error);
        }
    });
    return response.send(board);
});

app.all('/boards/:id', function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

app.get('/boards/:id', function(request, response, next) {
    return BoardModel.findById(request.params.id, function(error, board) {
        if (!error) {
            return response.send(board);
        } else {
            return console.log(error);
        }
    });
});

app.put('/boards/:id', function(request, response) {
    return BoardModel.findById(request.params.id, function(error, board) {
        board.lists = request.body.lists;
        return board.save(function(error) {
            if (!error) {
                console.log('Board updated successfully');
                return response.send('');
            } else {
                return console.log(error);
            }
        });
    });
});

app.delete('/boards/:id', function(request, response) {
    return BoardModel.findById(request.params.id, function(error, board) {
        return board.remove(function(error) {
            if (!error) {
                console.log('Board removed successfully');
            } else {
                return console.log(error);
            }
        });
    });
});

app.listen(8124);

console.log('Server running at http://127.0.0.1:8124/');