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


//盤面
//Boardは行列表現！XY座標とはちがうから混同しないように！
//Board[i][j]　iが↓成分　jが->成分
let board = new Array(20);
for (let x = 0; x < 20; x++) {
    board[x] = new Array(20);
    for (let y = 0; y < 20; y++) {
        board[x][y] = 0;
    }
}
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

    MEMBER[socket.id] = {
      token: token, 
      name:null, 
      count:MEMBER_COUNT,
      score:score
    };
    if(MEMBER_COUNT < 4){
      MEMBER_COUNT++;
    }
    // 本人にトークンを送付
    io.to(socket.id).emit('token', {
      token:token,
      order: MEMBER[socket.id].count
    });
    console.log(MEMBER[socket.id].count);
    //console.log(MEMBER[socket.id]);
  })();

  socket.on('board', (data)=>{
    board = data.board_status;
  });


    let count = 0;//ターン数
    //ゲームの開始合図
    if(MEMBER_COUNT == 4){
      io.emit('game_start' ,{  
        board_status : board, 
        count: count 
      });
    }
    socket.on('finish_turn', (status)=>{
      board = status.board_status;
      nowturn = status.count + 1;
      console.log(board);
      io.emit('next_turn', {
        board_status: board, 
        count: nowturn
      });
    });
    //passイベントの受信
    socket.on('PassTurn', function(data){
        board = data.board_status;
        nowturn = data.count + 1;
        console.log("iiiiii");
        count++;
        pass++;
        MEMBER[socket.id].score = scoreCal();
        if(pass < 4){
            //go_nextイベントの送信
            io.emit('next_turn', {
              board_status : board, 
              count : nowturn
            });
        }else{
            //game_setイベントの送信
            socket.emit('game_set', {
              board_status : board
            });
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

function scoreCal(){
  return 0;
}
