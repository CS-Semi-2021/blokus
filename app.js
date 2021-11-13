let socket = io.connect(); //ソケットへの接続
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
if(first == 0){
    socket.emit("fist_connection",{user : username});
}

let player = new Array(); //手番順のプレイヤーの配列
let nowturn; //現在のターン

//game_startイベントの受信
socket.on('game_start', function(data){
    player = data.name;
    nowturn = data.turn;
    for(let i = 0; i < 4; i++){
        if(player[i] == username){
            mynumber = i;
        }
    }
    if(nowturn % 4 == mynumber){
        //自分のターンのときの処理を関数で呼び出す
    }else{
        //自分のターン出ないときの処理を関数で呼び出す
    }
});

//ターンが終わったときの処理
$('.finish_turn').on('click', function(){
    if(pass == false){
        //finish_turnイベントを送信
        socket.emit('finish_turn', {barray : board});
    }else{
        //passイベントの送信
        socket.emit('pass', {barray : board});
    }
});

//go_nextイベントの受信
socket.on('go_next', function(data){
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