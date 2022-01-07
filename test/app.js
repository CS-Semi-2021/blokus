let isEnter = false;
let username = ''; //ユーザーネーム
let first = 0; //最初の接続フラグ
let nowplayer; //現在手番のプレイヤー
let mynumber; //自分の手番の順番
let PassFlag = false; //passした時のフラグ
let piece; //手持ちのコマ数





//first_connectionイベント
//自分自身の情報を入れる
const IAM = {
    token: null, // トークン
    name: null // 名前
};

//-------------------------------------
// STEP1. Socket.ioサーバへ接続
//-------------------------------------
const socket = io();
let nowturn = 1;
// 正常に接続したら
socket.on("connect", () => {
    // 表示を切り替える
    //$("#nowconnecting").style.display = "none";   // 「接続中」を非表示
});

// トークンを発行されたら
socket.on("token", (data) => {
    IAM.token = data.token;
    playerNum = data.order;
    board = data.board_status;
    console.log(playerNum);
    /*socket.emit("board",{
        board_status: Board
    });*/
});

//game_startイベントの受信
socket.on('game_start', (data) => {
    Board = data.board_status;
    nowturn = data.count;
    nowplayer = nowturn % 4;
    if (playerNum == 1) {
        MyTurnFlag = 1;
    }
    now = new Date();
    gTimeStart = now.getTime();
    gTid = setInterval('TimeDisplay()', 1000);
    /*if(data.order == 1){
      //main.jsのdraw3()内にある
      //canvas.addEventListener('mouseleave', mouseLeave);の制御をして
　    //盤面に関与できる人とできない人を条件分けしたい
      draw3();
    }else{
        //自分のターン出ないときの処理を関数で呼び出す
        //drawOnly();
        draw3();
    }*/
});

//go_nextイベントの受信
socket.on('next_turn', function(data) {
    Board = data.board_status;
    console.log(data.board_status);
    nowturn = data.count;
    console.log('next_turn');
    Coloring();
    nowplayer = nowturn % 4;
    if (nowplayer == 0) {
        nowplayer = 4;
    }
    //↓誰のターンかわかるように赤丸を書く（とりあえず）
    ctxTurn.clearRect(0, squareSize, squareSize * 5, squareSize);
    ctxTurn.fillStyle = "red";
    ctxTurn.beginPath();
    ctxTurn.arc((1.25 * nowplayer - 0.75) * squareSize, 1.2 * squareSize, 0.1 * squareSize, 0, Math.PI * 2, true);
    ctxTurn.fill();

    if (nowplayer == playerNum) {
        //自分のターンのときの処理を関数で呼び出す
        //draw3();
        MyTurnFlag = 1;
    } else {
        //自分のターン出ないときの処理を関数で呼び出す
        //draw3();
        MyTurnFlag = 0;
    }
    now = new Date();
    gTimeStart = now.getTime();
    gTid = setInterval('TimeDisplay()', 1000);

});

//game\setイベントの受信
socket.on('game_set', function(data) {
    console.log("game_set");
    Board = data.board_status;
    socket.emit('holding_point', {
        user: IAM.token,
        point: piece
    });
});

let resultn = new Array();
let results = new Array();

//winnerイベントの受信
socket.on('winner', function(data) {
    console.log("winner");
    resultn = data.user;
    results = data.point;
    console.log(resultn);
    console.log(results);
    //試合結果の表示を処理する関数を呼び出す
    window.confirm("結果発表\n  １位：Player" + resultn[0] + " " + results[0] + "ポイント");
});


//-------------------------------
//  呼び出し用関数
//-------------------------------


function finish_turn() {
    console.log('finish_turn');
    // Socket.ioサーバへ送信
    socket.emit("finish_turn", {
        board_status: Board,
        token: IAM.token,
        count: nowturn
    });
}

function PassTurn() {
    //パスボタン押下∧自分のターン　のとき実行される
    console.log('pass');
    PassFlag = true;
    socket.emit("PassTurn", {
        board_status: Board,
        token: IAM.token,
        count: nowturn
    })
}