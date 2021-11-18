//モジュールの読み込み
let http = require('http');
let socketio = require('socket.io')(http);
let fs = require('fs');
const { isObject } = require('util');

//HTTPサーバの作成

let server = http.createServer(function (req, res) {
  //サーバー起動

  let url = '.'+(req.url.endsWith("/") ? req.url + "flamingo.html" : req.url);
  //URLの最後が/ならflamingo.htmlを表示し、それ以外はそのURLのファイル名を変数へ。

  console.log(url);
  //htmlでリクエストされるコンテンツをコンソールに出力

  if (fs.existsSync(url)) {
    //ファイルがあれば
    fs.readFile(url, (err, data) => {
      if (!err) {
        //res.writeHead(200, {"Content-Type": "text/html"});  
        res.writeHead(200, {"Content-Type": getType(url)});  //関数を用いてtext以外の拡張子にも対応
        res.end(data);
      }
    });
  }
}).listen(3000);

let name = new Array(); //ユーザーネーム
let number = 0; //アクセス順

let board2 = new Array(); //盤面の2次元目
let board = new Array(board2); //盤面の配列

let pass = 0; //pass回数
let score = new Array();
let io = socketio.listen(server);
//connectionイベントを受信する
io.sockets.on('connection', function(soket){
    //first_connectionイベントの受信
    socket.on('first_connection', function(data){
        name[number] = data.username;
        number++;
    });

    let count = 0;//ターン数
    //ゲームの開始合図
    if(number == 4){
        //game_startイベントの送信
        io.emit('game_start',{value : name, turn : count});
    }

    //finish_turnイベントの受信
    socket.on('finish_turn', function(data){
        board = data.barray;
        count++;
        //go_nextイベントの送信
        socket.emit('go_next', {barray : board, turn : count});
    });

    //passイベントの受信
    socket.on('pass', function(data){
        board = data.barray;
        count++;
        pass++;
        if(pass < 4){
            //go_nextイベントの送信
            soket.emit('go_next', {barray : board, turn : count});
        }else{
            //game_setイベントの送信
            socket.emit('game_set', {barray : board});
        }
    });

    let access_point = 0; //スコアの送られた回数
    //holding_pointイベントの受信
    socket.on('holding_point', function(data){
        access_point++;
        let username = data.user;
        for(let i = 0; i < 4; i++){
            if(username == name[i]){
                score[i] = data.point;
            }
        }
        if(access_point == 4){ //全員がスコアを送り終えた後の処理
            rank();
            //winnerイベントの送信
            socket.emit('winner', {user : name, point : score});
        }
    });
});

function getType(_url) {
  //拡張子をみて一致したらタイプを返す関数
  var types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "svg+xml"
  }
  for (var key in types) {
    if (_url.endsWith(key)) {
      return types[key];
    }
  }
  return "text/plain";
}

function rank(){ //スコアの低い順にソート
    let namef;
    let scoref;
    for(let i = 0; i < score.length - 1; i++){
        for(let j = score.length - 1; j > i; j--){
            if(score[j-1] > score[j]){
                scoref = score[i];
                score[i] = score[j];
                score[j] = scoref;

                namef = name[i];
                name[i] = name[j];
                name[j] = namef;
            }
        }
    }
}