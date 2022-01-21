//画面サイズにあわせるやつ

let canvas;
let ctx;
let canvas4;
let ctx4;
let canvasBack;
let ctxBack;
let squareSize;
let canvasSize;
let countTurn = 1;

let DrawFlag = 0; //カーソルの位置にピースを半透明で描くときに使う（mousemoveでのみ使う）。描いた場合は1、盤面の範囲外にでてしまうなどで描けなかったときは0
let PlaceFlag = 0; //置こうとしている位置にピースがある場合0、ないなら1
let CornerFlag = 0; //既に置いている自分のピースの頂点に、新しく置こうとしているピースの頂点が触れるなら1、触れないなら0
let EdgeFlag = 0; //既に置いている自分のピースの辺に、新しく置こうとしているピースの辺がふれるなら0，ふれないなら1
let RegionFlag = 0; //ピースが20×20の盤面の外にでる部分があれば0、なければ1
let SelectFlag = 0; //Canvas4にピースが描画されており、それを選択したとき1になる。ピースをメインキャンバスに置くと０になる
let FirstFlag = 0; //1ターン目のみつかう。自分から近い角にピースがおかれるなら1、おかれないなら0
let MyTurnFlag = 0; //自分のターンなら1

let selectNum = 21; //今選んでいるピースの番号が格納される。21は未選択状態
let errmsg; //メインキャンバスにピースをおくときに、ルール上置けない場合に表示するエラーメッセージ
let tmp = [0, 0, 0, 0, 0] //ピースを回転させるときにちょっと使う。
let x = 20; //mousemoveで使う。前のカーソルの位置を一時的保存
let y = 20;
let nearline; //自分から一番近い角のマス目,0か19
let nearcolumn;

let player_Sum = { //プレイヤーの手持ちピース計算用
    total: [0, 0, 0, 0], //各プレイヤーの総合計
    piece: [ //各プレイヤーの保持しているピースの種類
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ]
}


let PlayerColor = ["green", "pink", "blue", "orange"]; //プレイヤーのピースカラー
let playerNum = 1; //プレイヤーナンバー1~4

//ハンバーガーボタン
function hamburger() {
    document.getElementById('line1').classList.toggle('line_1');
    document.getElementById('line2').classList.toggle('line_2');
    document.getElementById('line3').classList.toggle('line_3');
    document.getElementById('nav').classList.toggle('in');
}
document.getElementById('hamburger').addEventListener('click', function() {
    hamburger();
});

// 画面表示切り替え
function Display(operation) {
    if (operation == "index") {
        document.getElementById("index").style.display = "block";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("blokus").style.display = "none";
        document.getElementById("footer").style.display = "flex";
    } else if (operation == "kiyaku") {
        $('#kiyaku').addClass('appear');

        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "block";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "policy") {
        $('#policy').addClass('appear');

        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "block";
        document.getElementById("rule").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "rule") {
        $('#rule').addClass('appear');

        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "block";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "create-room") {
        $('#create-room').addClass('appear');
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "blokus") {
        soket.emit('OpenGamePage', {
            token: IAM.token
        });
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("blokus").style.display = "block";
        document.getElementById("footer").style.display = "none";
        draw3();
    }
}

// ゲームから退出するときの警告
function leaveAlert() {
    var options = {
        text: '本当に退出しますか？：',
        buttons: {
            cancel: 'いいえ',
            ok: 'はい'
        }
    };
    swal(options).then(function(value) {
        if (value) {
            Display("index");
            socket.emit('leave');
        }
    });
}

function doPass() {
    if (MyTurnFlag == 0) {
        swal("あなたのターンじゃないよ");
        return;
    } else {
        var options = {
            text: '本当にパスしますか？：', //\nでテキストの改行が出来ます
            buttons: {
                cancel: 'いいえ',
                ok: 'はい'
            }
        };
        swal(options).then(function(value) {
            if (value) {
                //表示するを選んだ場合の処理
                //swal('アラートを表示！');
                PassTurn();
            }
        });
    }
}

//盤面
//Boardは行列表現！XY座標とはちがうから混同しないように！
//Board[i][j]　iが↓成分　jが->成分
let Board = new Array(20);
for (let x = 0; x < 20; x++) {
    Board[x] = new Array(20);
    for (let y = 0; y < 20; y++) {
        Board[x][y] = 0;
    }
}

//Board[0][3] = 1; Board[0][4]=1; Board[0][5]= 1; Board[1][4]=1;
/*Board[0][12] = 2;
Board[11][11] = 3;
Board[11][9] = 4;*/


//https://upload.wikimedia.org/wikipedia/commons/0/0a/BlokusTiles.svg

let piece0 = {
    childline: [0],
    childcolumn: [0],
    useFlag: 0 //このピースをつかったら1に変更される。0ならまだ使っていないピース
}

let piece1 = {
    childline: [0, 0],
    childcolumn: [0, 1],
    useFlag: 0
}

let piece2 = {
    childline: [0, 0, 1],
    childcolumn: [0, -1, 0],
    useFlag: 0
}

let piece3 = {
    childline: [0, 0, 0],
    childcolumn: [0, -1, 1],
    useFlag: 0
}

let piece4 = {
    childline: [0, 0, 1, 1],
    childcolumn: [0, 1, 0, 1],
    useFlag: 0
}

let piece5 = {
    childline: [0, 0, 0, -1],
    childcolumn: [0, -1, 1, 0],
    useFlag: 0
}

let piece6 = {
    childline: [0, 0, 0, 0],
    childcolumn: [0, -1, 1, 2],
    useFlag: 0
}

let piece7 = {
    childline: [0, 0, 0, -1],
    childcolumn: [0, -1, -2, 0],
    useFlag: 0
}

let piece8 = {
    childline: [0, 0, 1, 1],
    childcolumn: [0, 1, 0, -1],
    useFlag: 0
}

let piece9 = {
    childline: [0, 0, 0, 0, -1],
    childcolumn: [0, -1, 1, 2, -1],
    useFlag: 0
}

let piece10 = {
    childline: [0, 0, 0, -1, -2],
    childcolumn: [0, -1, 1, 0, 0],
    useFlag: 0
}

let piece11 = {
    childline: [0, 0, 0, -1, -2],
    childcolumn: [0, 1, 2, 0, 0],
    useFlag: 0
}

let piece12 = {
    childline: [0, 0, 0, 1, 1],
    childcolumn: [0, 1, 2, 0, -1],
    useFlag: 0
}

let piece13 = {
    childline: [0, 0, 0, -1, 1],
    childcolumn: [0, 1, -1, 1, -1],
    useFlag: 0
}

let piece14 = {
    childline: [0, -1, -2, 1, 2],
    childcolumn: [0, 0, 0, 0, 0],
    useFlag: 0
}

let piece15 = {
    childline: [0, 0, -1, 1, 1],
    childcolumn: [0, 1, 0, 0, 1],
    useFlag: 0
}

let piece16 = {
    childline: [0, 0, -1, -1, 1],
    childcolumn: [0, -1, 0, 1, -1],
    useFlag: 0
}

let piece17 = {
    childline: [0, -1, -1, 1, 1],
    childcolumn: [0, 0, 1, 0, 1],
    useFlag: 0
}

let piece18 = {
    childline: [0, 0, -1, -1, 1],
    childcolumn: [0, -1, 0, 1, 0],
    useFlag: 0
}

let piece19 = {
    childline: [0, 0, 0, -1, 1],
    childcolumn: [0, -1, 1, 0, 0],
    useFlag: 0
}

let piece20 = {
    childline: [0, 0, 0, 0, -1],
    childcolumn: [0, -1, 1, 2, 0],
    useFlag: 0
}

let piece21 = {
    childline: [],
    childcolumn: [],
    useFlag: 1
}


let Pieces = [piece0, piece1, piece2, piece3, piece4, piece5, piece6, piece7, piece8, piece9, piece10,
    piece11, piece12, piece13, piece14, piece15, piece16, piece17, piece18, piece19, piece20, piece21
]

function draw3() {
    if (document.documentElement.clientWidth / 2 > document.documentElement.clientHeight) {
        canvasSize = Math.floor(document.documentElement.clientHeight) * 0.9;
    } else {
        canvasSize = Math.floor(document.documentElement.clientWidth / 2) * 0.9;
    }

    //canvasSize = Math.floor(document.documentElement.clientWidth / 2);
    //canvasSize = Math.floor(document.documentElement.clientHeight * 0.8);
    squareSize = Math.floor(canvasSize / 20);
    canvasBack = document.getElementById("rectangleBack"); //メインキャンバスの裏にあるキャンバス。メインキャンバス上にマウスポインタがある際、ポインタの位置に半透明のピースを描くだけ
    canvas = document.getElementById("rectangle3"); //メインキャンバス、配列Boardの情報に基づく
    canvas4 = document.getElementById("rectangle4"); //サブキャンバス、選んでいるピースを描く。ピース選択状態（メインキャンバスにおける状態）になると赤線で囲まれる
    canvasTurn = document.getElementById("rectangleTurn"); //誰がターンか分かるようにとりあえず作ってみた
    if (!canvas || !canvas.getContext || !canvasBack || !canvasBack.getContext || !canvas4 || !canvas4.getContext) {
        return false;
    }
    ctxBack = canvasBack.getContext('2d');
    ctx = canvas.getContext('2d');
    ctx4 = canvas4.getContext('2d');
    ctxTurn = canvasTurn.getContext('2d');



    // bannmenのfitCanvasSize()の中身;
    canvas.width = squareSize * 20;
    canvas.height = squareSize * 20;
    canvas4.width = squareSize * 5;
    canvas4.height = squareSize * 5;
    canvasBack.width = squareSize * 20;
    canvasBack.height = squareSize * 20;
    canvasTurn.width = squareSize * 5;
    canvasTurn.height = squareSize * 2;
    //document.getElementById("rectangle4").classList.add("subcan");
    //こっから↓はcssみたいなやつ
    let target4 = document.getElementById("rectangle4");
    target4.style.position = "absolute";
    target4.style.top = squareSize * 10 + "px";
    target4.style.left = squareSize * 21 + "px";



    let targetTurn = document.getElementById("rectangleTurn");
    targetTurn.style.position = "absolute";
    targetTurn.style.top = squareSize * 1 + "px";
    targetTurn.style.left = squareSize * 21 + "px";
    for (let i = 0; i < 4; i++) {
        ctxTurn.beginPath();
        ctxTurn.fillStyle = PlayerColor[i];
        ctxTurn.arc((0.5 + 1.25 * i) * squareSize, 0.5 * squareSize, 0.5 * squareSize, 0, 2 * Math.PI, true);
        ctxTurn.fill();
    }
    /*
    ctxTurn.fillStyle = "red";
    ctxTurn.beginPath();
    ctxTurn.arc(0.5 * squareSize, 1.2 * squareSize, 0.1 * squareSize, 0, Math.PI * 2, true);
    ctxTurn.fill();
    */



    let targetRotate = document.getElementById("button1");
    targetRotate.style.position = "absolute";
    targetRotate.style.top = squareSize * 15.5 + "px";
    targetRotate.style.left = squareSize * 21 + "px";
    targetRotate.style.width = squareSize * 5 + "px";
    targetRotate.style.height = squareSize * 1 + "px";
    targetRotate.style.fontSize = squareSize / 2 + "px";
    targetRotate.style.textAlign = "center";
    targetRotate.style.lineHeight = squareSize + "px";
    targetRotate.style.fontWeight = squareSize + "px";
    targetRotate.style.color = "#42cea9";
    targetRotate.style.backgroundColor = "#ffffff";
    targetRotate.style.border = "2px solid #58d2b2";
    targetRotate.style.borderRadius = "2px";
    targetRotate.style.cursor = "pointer";

    let targetReverse = document.getElementById("button2");
    targetReverse.style.position = "absolute";
    targetReverse.style.top = squareSize * 17 + "px";
    targetReverse.style.left = squareSize * 21 + "px";
    targetReverse.style.width = squareSize * 5 + "px";
    targetReverse.style.height = squareSize * 1 + "px";
    targetReverse.style.fontSize = squareSize / 2 + "px";
    targetReverse.style.textAlign = "center";
    targetReverse.style.lineHeight = squareSize + "px";
    targetReverse.style.fontWeight = squareSize + "px";
    targetReverse.style.color = "#42cea9";
    targetReverse.style.backgroundColor = "#ffffff";
    targetReverse.style.border = "2px solid #58d2b2";
    targetReverse.style.borderRadius = "2px";
    targetReverse.style.cursor = "pointer";

    let targetCaluculate = document.getElementById("button3");
    targetCaluculate.style.position = "absolute";
    targetCaluculate.style.top = squareSize * 19 + "px";
    targetCaluculate.style.left = squareSize * 21 + "px";
    targetCaluculate.style.width = squareSize * 5 + "px";
    targetCaluculate.style.height = squareSize * 1 + "px";
    targetCaluculate.style.fontSize = squareSize / 2 + "px";
    targetCaluculate.style.textAlign = "center";
    targetCaluculate.style.lineHeight = squareSize + "px";
    targetCaluculate.style.fontWeight = squareSize + "px";
    targetCaluculate.style.color = "#42cea9";
    targetCaluculate.style.backgroundColor = "#ffffff";
    targetCaluculate.style.border = "2px solid #58d2b2";
    targetCaluculate.style.borderRadius = "2px";
    targetCaluculate.style.cursor = "pointer";

    let targetPass = document.getElementById("buttonpass");
    targetPass.style.position = "absolute";
    targetPass.style.top = squareSize * 19 + "px";
    targetPass.style.left = squareSize * 26.5 + "px";
    targetPass.style.width = squareSize * 5 + "px";
    targetPass.style.height = squareSize * 1 + "px";
    targetPass.style.fontSize = squareSize / 2 + "px";
    targetPass.style.textAlign = "center";
    targetPass.style.lineHeight = squareSize + "px";
    targetPass.style.fontWeight = squareSize + "px";
    targetPass.style.color = "#42cea9";
    targetPass.style.backgroundColor = "#ffffff";
    targetPass.style.border = "2px solid #58d2b2";
    targetPass.style.borderRadius = "2px";
    targetPass.style.cursor = "pointer";

    let targetOut = document.getElementById("buttonout");
    targetOut.style.position = "absolute";
    targetOut.style.top = squareSize * 18 + "px";
    targetOut.style.left = squareSize * 34 + "px";
    targetOut.style.width = squareSize * 5 + "px";
    targetOut.style.height = squareSize * 2 + "px";
    targetReverse.style.fontSize = squareSize / 2 + "px";
    targetOut.style.textAlign = "center";
    targetOut.style.lineHeight = squareSize + "px";
    targetOut.style.fontWeight = squareSize + "px";
    targetOut.style.color = "#42cea9";
    targetOut.style.backgroundColor = "#ffffff";
    targetOut.style.border = "2px solid #58d2b2";
    targetOut.style.borderRadius = "2px";
    targetOut.style.cursor = "pointer";

    let targetTimeLimit = document.getElementById("timelimit");
    targetTimeLimit.style.position = "absolute";
    targetTimeLimit.style.top = squareSize * 8 + "px";
    targetTimeLimit.style.left = squareSize * 21 + "px";
    targetTimeLimit.style.width = squareSize * 5 + "px";
    targetTimeLimit.style.height = squareSize * 1 + "px";
    targetTimeLimit.style.fontSize = squareSize / 2 + "px";
    targetTimeLimit.style.textAlign = "center";
    targetTimeLimit.style.lineHeight = squareSize + "px";
    targetTimeLimit.style.fontWeight = squareSize + "px";


    let targetPic;
    for (let i = 0; i < 21; i++) {
        targetPic = document.getElementById("changes" + i);
        targetPic.style.position = "absolute";
        targetPic.style.top = squareSize * Math.floor(i / 4) * 3 + "px";
        targetPic.style.left = squareSize * 27 + squareSize * (i % 4) * 3 + "px";
        targetPic.style.width = squareSize * 3 + "px";
    }

    // bannmenのdraw3の中身
    for (let i = 0; i < 20; i++) {
        ctx.lineWidth = 0.05 * squareSize;
        for (let j = 0; j < 20; j++) {
            ctx.strokeRect(j * squareSize, i * squareSize, squareSize, squareSize);
        }
    }

    //盤面の周りをプレイヤーカラーに
    ctx.beginPath();
    ctx.lineWidth = 0.2 * squareSize;
    ctx.strokeStyle = PlayerColor[0];
    ctx.moveTo(0, 10 * squareSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(10 * squareSize, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = PlayerColor[1];
    ctx.moveTo(10 * squareSize, 0);
    ctx.lineTo(20 * squareSize, 0);
    ctx.lineTo(20 * squareSize, 10 * squareSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = PlayerColor[2];
    ctx.moveTo(20 * squareSize, 10 * squareSize);
    ctx.lineTo(20 * squareSize, 20 * squareSize);
    ctx.lineTo(10 * squareSize, 20 * squareSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = PlayerColor[3];
    ctx.moveTo(10 * squareSize, 20 * squareSize);
    ctx.lineTo(0, 20 * squareSize);
    ctx.lineTo(0, 10 * squareSize);
    ctx.stroke();

    //枠線の中心線を書く
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.11 * squareSize;
    ctx.moveTo(10 * squareSize, 0);
    ctx.lineTo(10 * squareSize, 20 * squareSize);
    ctx.moveTo(0, 10 * squareSize);
    ctx.lineTo(20 * squareSize, 10 * squareSize);
    ctx.stroke();
    ctx.lineWidth = 1;

    Coloring();
    Coloring2();

    canvas4.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mousedown', mouseUp);
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mouseleave', mouseLeave);


};


function mouseMove(event) {
    //メインキャンバス上でマウスが動かされると実行される
    if (MyTurnFlag == 0) {
        //自分のターンじゃないならなにもしない
        return;
    }
    if (SelectFlag == 0) {
        //ピースが選択状態にないときなにもしない
        return;
    }
    if (Math.floor(event.offsetX / squareSize) == x && Math.floor(event.offsetY / squareSize) == y) {
        //マウスポインタがあるマスが前回と変わっていないなら処理なし
        return;
    }
    //前回の半透明でcanvasBackに塗ったマスを透明に塗る
    if (DrawFlag == 1) {
        //DrawFlagが0の時は前回のマスで色塗りをしてないので白塗りの必要なし。
        for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
            ctxBack.clearRect(x * squareSize + Pieces[selectNum].childcolumn[i] * squareSize, y * squareSize + Pieces[selectNum].childline[i] * squareSize, squareSize, squareSize);
        }
    }
    x = Math.floor(event.offsetX / squareSize);
    y = Math.floor(event.offsetY / squareSize);


    for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
        if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] < 0 || Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] < 0 || Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] > 19 || Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] > 19) {
            //盤面の外にピースがでないかの判定。でるなら色塗りをしないのでDrawFlagを0にして処理終了
            DrawFlag = 0;
            return;
        }
    }
    //↓選択中のピースを裏キャンバスに半透明で描く
    DrawFlag = 1;
    ctxBack.globalAlpha = 0.3;
    ctxBack.fillStyle = PlayerColor[playerNum - 1];
    for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
        ctxBack.fillRect(x * squareSize + Pieces[selectNum].childcolumn[i] * squareSize, y * squareSize + Pieces[selectNum].childline[i] * squareSize, squareSize, squareSize);
    }
};


function mouseLeave(event) {
    //マウスポインタがメインcanvasの外にでたらmousemoveで塗られた半透明のマスがなくなるようにする
    if (DrawFlag == 1) {
        for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
            ctxBack.clearRect(x * squareSize + Pieces[selectNum].childcolumn[i] * squareSize, y * squareSize + +Pieces[selectNum].childline[i] * squareSize, squareSize, squareSize);
        }
    }
    DrawFlag = 0;
    x = 20;
    y = 20;
};


function mouseDown(event) {
    //サブCanvasの上でクリックされると実行される関数
    if (selectNum == 21) {
        //ピースが選ばれていないなら何もしない
        SelectFlag = 0;
    } else {
        SelectFlag = 1;
        //サブキャンバスを赤枠で囲む
        ctx4.lineWidth = 1;
        ctx4.beginPath();
        ctx4.strokeStyle = "red";
        ctx4.strokeRect(0, 0, squareSize * 5, squareSize * 5);
        ctx4.stroke();
    }
}


function mouseUp(event) {
    //メインキャンバス上でクリックされると実行される関数。
    console.log(nowturn);
    if (MyTurnFlag == 0) {
        if (nowplayer == undefined) {
            swal("プレイヤーがまだ集まっていません。");
        } else {
            swal("プレイヤー" + nowplayer + "のターンです。")
        }
        //自分のターンじゃないならなにもしない
        return;
    }
    if (SelectFlag == 0) {
        //ピースが選択状態じゃないならなにもしない
        return;
    }

    if (countTurn == 1) {
        //1ターン目（最初のターン）の処理
        //↓各プレイヤーは盤面の角におかなきゃいけないからplayerNumで場合分け。ここでnearlineとか書かないで最初に定義するべきだろうけどとりあえずいいわ
        RegionFlag = 0;
        FirstFlag = 0;

        if (playerNum == 1) {
            nearline = 0; //左上
            nearcolumn = 0;
        } else if (playerNum == 2) {
            nearline = 0; //右上
            nearcolumn = 19;
        } else if (playerNum == 3) {
            nearline = 19; //右下
            nearcolumn = 19;
        } else if (playerNum == 4) {
            nearline = 19; //左下
            nearcolumn = 0;
        }
        for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
            if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] < 0 || Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] < 0 || Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] > 19 || Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] > 19) {
                //盤面の外にピースがでないかの判定
                RegionFlag = 1;
                break;
            }

            if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] == nearline && Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] == nearcolumn) {
                //角のマス目が埋まるかの判定
                FirstFlag = 1;
            }
        }
        if (RegionFlag) {
            swal("盤面の外にピースが出ないように置いてください。")
        } else if (FirstFlag) {
            for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
                Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] = playerNum;
            }
            Coloring();
            Pieces[selectNum].useFlag = 1; //使用済みピースに変更
            DeletePic();
            SelectFlag = 0; //ピースを選択していない状態にする
            selectNum = 21; //選択ピース番号を範囲外に変更

            Coloring2();
            console.log(Board);
            countTurn += 1;
            MyTurnFlag = 0;
            finish_turn();
        } else {
            swal("盤面の角が埋まるように置いてください。")
        }

    } else {
        //2ターン目以降
        PlaceFlag = 1; //新しく置く毎にフラグをデフォに設定する
        CornerFlag = 0;
        EdgeFlag = 1;
        RegionFlag = 0;
        errmsg = "";

        for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
            if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] < 0 || Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] < 0 || Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] > 19 || Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] > 19) {
                //盤面の外にピースがでないかの判定
                RegionFlag = 1;
                break;
            }

            if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] != 0) {
                //置く位置にピースが置いてないかの判定
                PlaceFlag = 0;
            }

            //既に置いているピースの頂点にふれるかの判定
            //Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]が0の時は上は調べなくてOK。19のときは下は調べなくてOK。エラー出ちゃうからifでわけてみた
            //Boardの配列てきにBoard[~][-~]は平気だけど、Board[-~][~]はエラー出ちゃう
            if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] == 0) {
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] + 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] - 1] == playerNum) { CornerFlag = 1 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] + 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] + 1] == playerNum) { CornerFlag = 1 }
            } else if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] == 19) {
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] - 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] - 1] == playerNum) { CornerFlag = 1 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] - 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] + 1] == playerNum) { CornerFlag = 1 }
            } else {
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] - 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] - 1] == playerNum) { CornerFlag = 1 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] - 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] + 1] == playerNum) { CornerFlag = 1 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] + 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] - 1] == playerNum) { CornerFlag = 1 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] + 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] + 1] == playerNum) { CornerFlag = 1 }
            }

            //既に配置してあるピースの辺に接するかの判定
            //↑と同様にMath.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]で場合分け
            if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] == 0) {
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] - 1] == playerNum) { EdgeFlag = 0 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] + 1] == playerNum) { EdgeFlag = 0 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] + 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] == playerNum) { EdgeFlag = 0 }
            } else if (Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] == 19) {
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] - 1] == playerNum) { EdgeFlag = 0 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] + 1] == playerNum) { EdgeFlag = 0 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] - 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] == playerNum) { EdgeFlag = 0 }
            } else {
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] - 1] == playerNum) { EdgeFlag = 0 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i] + 1] == playerNum) { EdgeFlag = 0 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] - 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] == playerNum) { EdgeFlag = 0 }
                if (Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i] + 1][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] == playerNum) { EdgeFlag = 0 }
            }
        }
        //console.log(PlaceFlag, CornerFlag, EdgeFlag);

        if (RegionFlag) {
            swal("盤面の外にピースが出ないように置いてください。")
        } else if (PlaceFlag && CornerFlag && EdgeFlag) {
            for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
                Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] = playerNum;
            }
            Coloring();
            Pieces[selectNum].useFlag = 1; //使用済みピースに変更
            DeletePic();
            SelectFlag = 0; //ピースを選択していない状態にする
            selectNum = 21; //選択ピース番号を範囲外に変更
            countTurn += 1;

            Coloring2();
            console.log(Board);
            MyTurnFlag = 0;
            finish_turn();
        } else {
            if (!CornerFlag) {
                errmsg += "既に配置してあるピースの頂点に触れるように置いてください。";
            }
            if (!PlaceFlag) {
                errmsg += "既にピースが置いてあります。";
            }
            if (!EdgeFlag) {
                errmsg += "既に配置してあるピースの辺に接してはいけません。";
            }
            swal(errmsg);
        }
    }
};


function Coloring() {
    //Boardの状態から色を塗る
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            //console.log(Board);
            if (Board[i][j] != 0) {
                ctx.fillStyle = PlayerColor[Board[i][j] - 1];
                ctx.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);
            }
        }
    }
};


function Coloring2() {
    //メインじゃない方のボード(ctx4)に選択したピースを映し出す
    //引数はピースの番号0~20 　21の時は白(ピースが選ばれていない状態)にする
    ctx4.clearRect(0, 0, 5 * squareSize, 5 * squareSize);
    ctx4.globalAlpha = 0.2;
    ctx4.fillStyle = PlayerColor[playerNum - 1]; //白にして、前にあったやつを消す
    ctx4.fillRect(0, 0, 5 * squareSize, 5 * squareSize);
    ctx4.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
        //枠線を書く
        ctx4.beginPath();
        ctx4.lineWidth = 0.2;
        ctx4.strokeStyle = "black";
        ctx4.moveTo(0, squareSize * i);
        ctx4.lineTo(5 * squareSize, squareSize * i);
        ctx4.moveTo(squareSize * i, 0);
        ctx4.lineTo(squareSize * i, 5 * squareSize);
        ctx4.stroke();
    }
    ctx4.fillStyle = "black";
    for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
        ctx4.fillRect(2 * squareSize + Pieces[selectNum].childcolumn[i] * squareSize, 2 * squareSize + Pieces[selectNum].childline[i] * squareSize, squareSize, squareSize)
    }
    //中心のマスに赤点を打つ
    ctx4.fillStyle = "red";
    ctx4.beginPath();
    ctx4.arc(2.5 * squareSize, 2.5 * squareSize, 3, 0, Math.PI * 2, true);
    ctx4.fill();
};


function loads(k) {
    //ピース画像をタップされると実行される関数
    SelectFlag = 0;
    if (Pieces[k].useFlag == 0) {
        //選ばれたピースが使用済みかどうかで場合分け
        selectNum = k;
        Coloring2();
    } else {
        selectNum = 21;
        Coloring2();
        swal("すでに使用済みのピースです。");
    }
};


function Rotate() {
    //x=x*cost-y*sint  y=x*sint-y*costみたいなやつをchildlineとchildcolumnで考えれば簡単に回転できる
    //反時計回り
    if (Pieces[selectNum].useFlag == 1) {
        return;
    }
    for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
        tmp[i] = Pieces[selectNum].childline[i];
        Pieces[selectNum].childline[i] = -1 * Pieces[selectNum].childcolumn[i];
        Pieces[selectNum].childcolumn[i] = tmp[i];
    }
    Coloring2();
    SelectFlag = 0;
};

function Reverse() {
    //選択ピースを反転する
    if (Pieces[selectNum].useFlag == 1) {
        return;
    }
    for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
        Pieces[selectNum].childline[i] = -1 * Pieces[selectNum].childline[i];
    }
    Coloring2();
    SelectFlag = 0;
};

function DeletePic() {
    //使用したピースの画像をcssを使って非表示or半透明表示にする。
    document.getElementById("changes" + selectNum).classList.add("addColor");
};


/*
function halfway_caluculation() { //終了判定もらって最終結果を表示する関数も作りたい
    for (let i = 0; i < 4; i++) {
        if (piece0.useFlag == 0) {
            player_Sum.total[i] += 1;
            player_Sum.piece[i][0] += 1;
*/


function halfway_caluculation() { //終了判定もらって最終結果を表示する関数も作りたい
    for (let i = 0; i < 4; i++) {
        if (piece0.useFlag == 0) {
            player_Sum.total[i] += 1;
            player_Sum.piece[i][0] += 1;
        }

        if (piece1.useFlag == 0) {
            player_Sum.total[i] += 2; //ここから2マスのピース
            player_Sum.piece[i][1] += 1;
        }

        if (piece2.useFlag == 0) {
            player_Sum.total[i] += 3; //ここから3マスのピース
            player_Sum.piece[i][2] += 1;
        }
        if (piece3.useFlag == 0) {
            player_Sum.total[i] += 3;
            player_Sum.piece[i][2] += 1;
        }

        if (piece4.useFlag == 0) {
            player_Sum.total[i] += 4; //ここから4マスのピース
            player_Sum.piece[i][3] += 1;
        }
        if (piece5.useFlag == 0) {
            player_Sum.total[i] += 4;
            player_Sum.piece[i][3] += 1;
        }
        if (piece6.useFlag == 0) {
            player_Sum.total[i] += 4;
            player_Sum.piece[i][3] += 1;
        }
        if (piece7.useFlag == 0) {
            player_Sum.total[i] += 4;
            player_Sum.piece[i][3] += 1;
        }
        if (piece8.useFlag == 0) {
            player_Sum.total[i] += 4;
            player_Sum.piece[i][3] += 1;
        }

        if (piece9.useFlag == 0) {
            player_Sum.total[i] += 5; //ここから5マスのピース
            player_Sum.piece[i][4] += 1;
        }
        if (piece10.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece11.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece12.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece13.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece14.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece15.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece16.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece17.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece18.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece19.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
        if (piece20.useFlag == 0) {
            player_Sum.total[i] += 5;
            player_Sum.piece[i][4] += 1;
        }
    }
    swal('残ってるピースの総合計は' + player_Sum.total[0] + '\n' +
        '1マスのピースの数は' + player_Sum.piece[0][0] + '個、' +
        '\n' + '2マスのピースの数は' + player_Sum.piece[0][1] + '個、' +
        '\n' + '3マスのピースの数は' + player_Sum.piece[0][2] + '個、' +
        '\n' + '4マスのピースの数は' + player_Sum.piece[0][3] + '個、' +
        '\n' + '5マスのピースの数は' + player_Sum.piece[0][4] + '個です。'
    );
    player_Sum.total[0] = 0;
    player_Sum.piece = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ]
};


//時間制限
let gTimeLimit; // 制限時間用
let gTimeStart; // 開始時間用
let gTid; // タイマー用
gTimeLimit = 1 * 60 * 1000; //1分をミリ秒に変換
dd = new Date();
gTimeStart = dd.getTime();

function TimeDisplay() {
    now = new Date();

    dt = now.getTime() - gTimeStart; //経過時間計算

    now.setTime(dt + now.getTimezoneOffset() * 60 * 1000); // ※1 経過時間設定
    dt1 = "0" + now.getHours(); // ※2
    dt1 = dt1.substring(dt1.length - 2, dt1.length);
    dt2 = "0" + now.getMinutes();
    dt2 = dt2.substring(dt2.length - 2, dt2.length);
    dt3 = "0" + now.getSeconds();
    dt3 = dt3.substring(dt3.length - 2, dt3.length);
    TL.TLIMIT.value = dt1 + ":" + dt2 + ":" + dt3;
    if (MyTurnFlag == 1) {
        if (dt > gTimeLimit) { //経過時間dtと制限時間の設定
            clearTimeout(gTid); // タイマー解除
            PassTurn();
            swal("時間制限を過ぎました。\n次のプレイヤーのターンになります");
        }
    } else {
        if (dt > gTimeLimit) { //経過時間dtと制限時間の設定
            clearTimeout(gTid); // タイマー解除
        }
    }
}