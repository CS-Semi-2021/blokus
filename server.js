const crypto = require('crypto');
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
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
const ROOM = {};

// チャット延べ参加者数
let MEMBER_COUNT = 1;
let game_page_countlist = new Array(); //game_page_countlist[i]：ルームiのプレイやーでゲームページにいる人数

const port = 51234;
const hostname = "tokyo.vldb2020.org";

// ルーティングの設定
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
    //console.log("/ へアクセスがありました");
});
app.get("/images/:file", (req, res) => {
    const file = req.params.file;

    res.sendFile(`${__dirname}/images/${file}`);
    //console.log(`/images/${file} へアクセスがありました`);
});
app.get("/main.js", (req, res) => {
    res.sendFile(`${__dirname}/main.js`);
    //console.log("/main.js へアクセスがありました");
});
app.get("/app.js", (req, res) => {
    res.sendFile(`${__dirname}/app.js`);
    //console.log("/app.js へアクセスがありました");
});
app.get("/style.css", (req, res) => {
    res.sendFile(`${__dirname}/style.css`);
    //console.log("/style.css へアクセスがありました");
});
app.get("/util.js", (req, res) => {
    res.sendFile(`${__dirname}/util.js`);
    //console.log("/util.js へアクセスがありました");
});
// HTTPサーバを起動する
http.listen(port, hostname, () => {
    console.log(`listening at ws://${hostname}:${port}/`);
});
let count = 1; //ターン数

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
score = [0, 0, 0, 0]; //Playerの点数
let name = new Array();
let access_point = 0; //スコアの送られた回数
let room_num = 0;
let leave_num = new Array(); //出て行ったプレイヤー
let nowplayer = 1; //現在のプレイヤー

//connectionイベントを受信する
io.on("connection", (socket) => {
    console.log("ユーザーが接続しました");
    let room = '';


    //---------------------------------
    // ログイン
    //---------------------------------
    (() => {
        // トークンを作成
        const token = makeToken(socket.id);
        // ユーザーリストに追加　名前は入力フォームをが出来次第
        room = ~~(room_num / 4) + 1;
        room_num++;

        MEMBER[socket.id] = {
            token: token,
            name: null,
            count: MEMBER_COUNT,
            score: score
        };
        if (MEMBER_COUNT < 4) {
            MEMBER_COUNT++;
        } else {
            MEMBER_COUNT = 1;
        }
        if (MEMBER_COUNT == 1) {
            game_page_countlist[room] = 0;
        }
        // 本人にトークンを送付
        io.to(socket.id).emit('token', {
            token: token,
            order: MEMBER[socket.id].count,
        });
        console.log(MEMBER[socket.id].count);
        socket.join(room);
        console.log(room);
        //console.log(MEMBER[socket.id]);
    })();

    ROOM[room] = {
        board: board, //盤面
        count: count, //ターン数
        pass: pass, //pass回数
        score: score,
        name: name,
        access_point: access_point, //スコアの送られた回数
        leave_num: leave_num, //出て行ったプレイヤー
        nowplayer: nowplayer
    };


    /*socket.on('board', (data)=>{
      ROOM[room].board = data.board_status;
    });*/

    socket.on('OpenGamePage', function(data) {
        game_page_countlist[room]++;
        if (game_page_countlist[room] == 4) {
        io.to(room).emit('game_start', {
            board_status: ROOM[room].board,
            count: ROOM[room].count
        });
       }
     });
    //ゲームの開始合図
    /*if (MEMBER_COUNT == 4) {
        io.to(room).emit('game_start', {
            board_status: ROOM[room].board,
            count: ROOM[room].count
        });
    }*/
    socket.on('finish_turn', (status) => {
        ROOM[room].access_point = 0;
        ROOM[room].pass = 0;
        console.log(ROOM[room].access_point);
        console.log(ROOM[room].pass);
        ROOM[room].board = status.board_status;
        ROOM[room].count = status.count + 1;
        ROOM[room].nowplayer++;
        if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
        if(ROOM[room].leave_num[ROOM[room].nowplayer] == 1) ROOM[room].nowplayer++;
        if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
        console.log(board);
        io.to(room).emit('next_turn', {
            board_status: ROOM[room].board,
            count: ROOM[room].count,
            nowplayer: ROOM[room].nowplayer
        });
    });

    //passイベントの受信
    socket.on('PassTurn', function(data) {
        ROOM[room].board = data.board_status;
        ROOM[room].count = data.count + 1;
        console.log("iiiiii");
        ROOM[room].pass++;
        ROOM[room].nowplayer++;
        if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
        if(ROOM[room].leave_num[ROOM[room].nowplayer] == 1) ROOM[room].nowplayer++;
        if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
        //MEMBER[socket.id].score = scoreCal();
        if (ROOM[room].pass < game_page_countlist[room]) {
            //go_nextイベントの送信
            io.to(room).emit('next_turn', {
                board_status: ROOM[room].board,
                count: ROOM[room].count,
                nowplayer: ROOM[room].nowplayer
            });
        } else {
            //game_setイベントの送信
            io.to(room).emit('game_set', {
                board_status: ROOM[room].board
            });
        }
    });


    //holding_pointイベントの受信
    socket.on('holding_point', function(data) {
        console.log("holding_point");
        ROOM[room].access_point++;
        console.log(ROOM[room].access_point);
        let username = data.user;
        if (username == MEMBER[socket.id].token) {
            MEMBER[socket.id].score = data.point;
            ROOM[room].name[MEMBER[socket.id].count - 1] = MEMBER[socket.id].count;
            //score[MEMBER[socket.id].count-1] = data.point;
        }
        if (ROOM[room].access_point == game_page_countlist[room]) { //全員がスコアを送り終えた後の処理
            ROOM[room].score = scoreCal(ROOM[room].score, ROOM[room].board);
            rank();
            console.log("winner");
            //winnerイベントの送信
            console.log(ROOM[room].name);
            console.log(ROOM[room].score);
            io.to(room).emit('winner', {
                user: ROOM[room].name,
                point: ROOM[room].score
            });
        }
    });

    //切断時の処理
    socket.on('disconnect', () => {
        console.log('disconnect');
        game_page_countlist[room]--;
        ROOM[room].leave_num[MEMBER[socket.id].count] = 1;
        MEMBER[socket.id].score = 10000;
        io.to(room).emit('leave_player', {
            leave_num: MEMBER[socket.id].count
        });
        if(MEMBER[socket.id].count == ROOM[room].nowplayer){
            ROOM[room].nowplayer++;
            if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
            if(ROOM[room].leave_num[ROOM[room].nowplayer] == 1) ROOM[room].nowplayer++;
            if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
            console.log(board);
            io.to(room).emit('next_turn', {
                board_status: ROOM[room].board,
                count: ROOM[room].count,
                nowplayer: ROOM[room].nowplayer
            });
        }
    });

    //退出時の処理
    socket.on('leave', () => {
        console.log('leave');
        game_page_countlist[room]--;
        ROOM[room].leave_num[MEMBER[socket.id].count] = 1;
        MEMBER[socket.id].score = 10000;
        io.to(room).emit('leave_player', {
            leave_num: MEMBER[socket.id].count
        });
        if(MEMBER[socket.id].count == ROOM[room].nowplayer){
            ROOM[room].nowplayer++;
            if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
            if(ROOM[room].leave_num[ROOM[room].nowplayer] == 1) ROOM[room].nowplayer++;
            if(ROOM[room].nowplayer > 4) ROOM[room].nowplayer = 1;
            console.log(board);
            io.to(room).emit('next_turn', {
                board_status: ROOM[room].board,
                count: ROOM[room].count,
                nowplayer: ROOM[room].nowplayer
            });
        }
    });

    function rank() { //スコアの低い順にソート
        let namef;
        let scoref;
        for (let i = 0; i < ROOM[room].score.length - 1; i++) {
            for (let j = ROOM[room].score.length - 1; j > i; j--) {
                if (ROOM[room].score[j - 1] < ROOM[room].score[j]) {
                    scoref = ROOM[room].score[j];
                    ROOM[room].score[j] = ROOM[room].score[j - 1];
                    ROOM[room].score[j - 1] = scoref;

                    namef = ROOM[room].name[j];
                    ROOM[room].name[j] = ROOM[room].name[j - 1];
                    ROOM[room].name[j - 1] = namef;
                }
            }
        }
    }
});


/**
 * トークンを作成する
 *
 * @param  {string} id - socket.id
 * @return {string}
 */
function makeToken(id) {
    const str = "aqwsedrftgyhujiko" + id;
    return (crypto.createHash("sha1").update(str).digest('hex'));
}

function scoreCal(score, board) { //Playerのスコアの計算
    for (var i = 0; i < 4; i++) {
        score[i] = 0;
    }
    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            if (board[i][j] == 1) {
                score[0] += 1;
            } else if (board[i][j] == 2) {
                score[1] += 1;
            } else if (board[i][j] == 3) {
                score[2] += 1;
            } else if (board[i][j] == 4) {
                score[3] += 1;
            }
        }
    }
    return score;
}
