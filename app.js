let isEnter = false;
let username = ''; //ユーザーネーム
let first = 0; //最初の接続フラグ
let nowplayer; //現在手番のプレイヤー
let mynumber; //自分の手番の順番
let pass = false; //passした時のフラグ
let piece; //手持ちのコマ数

let board2 = new Array(); //盤面の2次元目
let board = new Array(board2); //盤面の配列



//first_connectionイベント
//自分自身の情報を入れる
const IAM = {
    token: null,  // トークン
    name: null    // 名前
  };
  
  //-------------------------------------
  // STEP1. Socket.ioサーバへ接続
  //-------------------------------------
  const socket = io();
  let nowturn = 1;
  // 正常に接続したら
  socket.on("connect", ()=>{
    // 表示を切り替える
  });
  
  // トークンを発行されたら
  socket.on("token", (data)=>{
    IAM.token = data.token;
    console.log(add(10,5));
  });
  
//game_startイベントの受信
socket.on('game_start', (data) => {
    board = data.board_status;
    if(data.order == 1){
      //main.jsのdraw3()内にある
      //anvas.addEventListener('mouseleave', mouseLeave);の制御をして
　    //盤面に関与できる人とできない人を条件分けしたい
      // Socket.ioサーバへ送信
      socket.emit("finish_turn", {
        board_status : board,
        token: IAM.token
      });
    }else{
        //自分のターン出ないときの処理を関数で呼び出す
        //drawOnly();
        
    }
});

//ターンが終わったときの処理
/*$('.finish_turn').on('click', function(){
    if(pass == false){
        //finish_turnイベントを送信
        socket.emit('finish_turn', {barray : board});
    }else{
        //passイベントの送信
        socket.emit('pass', {barray : board});
    }
});*/

//go_nextイベントの受信
socket.on('next_turn', function(data){
    board = data.baraay;
    nowturn = data.count;
    if(nowturn % 4 == mynumber){
        //自分のターンのときの処理を関数で呼び出す
    }else{
        //自分のターン出ないときの処理を関数で呼び出す
    }
});

//game\setイベントの受信
socket.on('game_set', function(data){
    board = data.barray;
    socket.emit('holding_point', {user : username, point : piece});
});

let resultn = new Array();
let results = new Array();

//winnerイベントの受信
socket.on('winner', function(data){
    resultn = data.user;
    results = data.point;
    //試合結果の表示を処理する関数を呼び出す
});