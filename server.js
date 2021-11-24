const crypto = require('crypto');
const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
let fs = require('fs');



const SECRET_TOKEN = "abcdefghijklmn12345";

//-----------------------------------------------
// グローバル変数
//-----------------------------------------------

const MEMBER = {};
  // ↑以下のような内容のデータが入る
  // {
  //   "socket.id": {token:"abcd", name:"foo", count:1},
  //   "socket.id": {token:"efgh", name:"bar", count:2}
  // }

// チャット延べ参加者数
let MEMBER_COUNT = 1;

const port = 3000;

let Board = new Array(20);
for (let x = 0; x < 20; x++) {
    Board[x] = new Array(20);
    for (let y = 0; y < 20; y++) {
        Board[x][y] = 0;
    }
}

// ルーティングの設定
app.get("/", (req, res) =>{
  res.sendFile(`${__dirname}/flamingo.html`);
  //console.log("/ へアクセスがありました");
});
app.get("/images/:file", (req, res) =>{
  const file = req.params.file;

  res.sendFile(`${__dirname}/images/${file}`);
  //console.log(`/images/${file} へアクセスがありました`);
});
app.get("/main.js", (req, res) =>{
  res.sendFile(`${__dirname}/main.js`);
  //console.log("/main.js へアクセスがありました");
});
app.get("/app.js", (req, res) =>{
  res.sendFile(`${__dirname}/app.js`);
  //console.log("/app.js へアクセスがありました");
});
app.get("/style.css", (req, res) =>{
  res.sendFile(`${__dirname}/style.css`);
  //console.log("/style.css へアクセスがありました");
});
app.get("/util.js", (req, res) =>{
  res.sendFile(`${__dirname}/util.js`);
  //console.log("/util.js へアクセスがありました");
});
// HTTPサーバを起動する
http.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
let count = 0;//ターン数

  //---------------------------------
  // ゲーム開始からボードの状態を共有
  //-------------------------------


let board2 = new Array(); //盤面の2次元目
let board = new Array(board2); //盤面の配列

let pass = 0; //pass回数
let score = new Array();

//connectionイベントを受信する
io.on("connection", (socket)=>{
  console.log("ユーザーが接続しました");

  //---------------------------------
  // ログイン
  //---------------------------------
  (()=>{
    // トークンを作成
    const token = makeToken(socket.id);
    // ユーザーリストに追加　名前は入力フォームをが出来次第

    MEMBER[socket.id] = {token: token, name:null, count:MEMBER_COUNT};
    MEMBER_COUNT++;
    // 本人にトークンを送付
    io.to(socket.id).emit('token', {token:token});
    console.log(MEMBER[socket.id].count);
    //console.log(MEMBER[socket.id]);
  })();


    let count = 0;//ターン数
    //ゲームの開始合図
    if(MEMBER_COUNT == 4){
      io.emit('game_start' ,{ order: MEMBER[socket.id].count, board_status : Board });
    }
    socket.on('finish_turn', (status)=>{
      Board = status.board_status;
      nowturn = status.count + 1;
      console.log(Board);
      io.emit('next_turn', {borad_status: Board, order: MEMBER[socket.id].count});
    });
    //passイベントの受信
    socket.on('pass', function(data){
        Board = data.barray;
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
/**
 * トークンを作成する
 *
 * @param  {string} id - socket.id
 * @return {string}
 */
function makeToken(id){
  const str = "aqwsedrftgyhujiko" + id;
  return( crypto.createHash("sha1").update(str).digest('hex') );
}
