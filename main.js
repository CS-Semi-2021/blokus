//・1ターン目の処理(角に置くやつ)　・使用ピースの画像を半透明化　・選んでいるピースをカーソルの位置に表示　を追加
let canvas;
let ctx;
let canvas4;
let ctx4;
let canvasBack;
let ctxBack;
let squareSize = 50;
let countTurn = 1;

let DrawFlag = 0; //カーソルの位置にピースを半透明で描くときに使う（mousemoveでのみ使う）。描いた場合は1、盤面の範囲外にでてしまうなどで描けなかったときは0
let PlaceFlag = 0; //置こうとしている位置にピースがある場合0、ないなら1
let CornerFlag = 0; //既に置いている自分のピースの頂点に、新しく置こうとしているピースの頂点が触れるなら1、触れないなら0
let EdgeFlag = 0; //既に置いている自分のピースの辺に、新しく置こうとしているピースの辺がふれるなら0，ふれないなら1
let RegionFlag = 0; //ピースが20×20の盤面の外にでる部分があれば0、なければ1
let SelectFlag = 0; //Canvas4にピースが描画されており、それを選択したとき1になる。ピースをメインキャンバスに置くと０になる
let FirstFlag = 0; //1ターン目のみつかう。自分から近い角にピースがおかれるなら1、おかれないなら0

let selectNum = 21; //今選んでいるピースの番号が格納される。21は未選択状態
let errmsg; //メインキャンバスにピースをおくときに、ルール上置けない場合に表示するエラーメッセージ
let tmp = [0, 0, 0, 0, 0] //ピースを回転させるときにちょっと使う。
let x = 20; //mousemoveで使う。前のカーソルの位置を一時的保存
let y = 20;
let nearline; //自分から一番近い角のマス目,0か19
let nearcolumn;

let PlayerColor = ["green", "pink", "blue", "orange"]; //プレイヤーのピースカラー
let playerNum = 1; //プレイヤーナンバー1~4

// 画面表示切り替え
function Display(operation) {
    if (operation == "index") {
        document.getElementById("index").style.display = "block";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("main_menu").style.display = "none";
        document.getElementById("create-room").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "kiyaku") {
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "block";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("main_menu").style.display = "none";
        document.getElementById("create-room").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "policy") {
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "block";
        document.getElementById("rule").style.display = "none";
        document.getElementById("main_menu").style.display = "none";
        document.getElementById("create-room").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "rule") {
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "block";
        document.getElementById("main_menu").style.display = "none";
        document.getElementById("create-room").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "main_menu") {
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("main_menu").style.display = "block";
        document.getElementById("create-room").style.display = "none";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "create-room") {
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("main_menu").style.display = "none";
        document.getElementById("create-room").style.display = "block";
        document.getElementById("blokus").style.display = "none";
    } else if (operation == "blokus") {
        document.getElementById("index").style.display = "none";
        document.getElementById("kiyaku").style.display = "none";
        document.getElementById("policy").style.display = "none";
        document.getElementById("rule").style.display = "none";
        document.getElementById("main_menu").style.display = "none";
        document.getElementById("create-room").style.display = "none";
        document.getElementById("blokus").style.display = "block";
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
Board[0][12] = 2;
Board[11][11] = 3;
Board[11][9] = 4;


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

onload = function() {
    draw3();


    function draw3() {
        canvasBack = document.getElementById("rectangleBack"); //メインキャンバスの裏にあるキャンバス。メインキャンバス上にマウスポインタがある際、ポインタの位置に半透明のピースを描くだけ
        canvas = document.getElementById("rectangle3"); //メインキャンバス、配列Boardの情報に基づく
        canvas4 = document.getElementById("rectangle4"); //サブキャンバス、選んでいるピースを描く。ピース選択状態（メインキャンバスにおける状態）になると赤線で囲まれる
        if (!canvas || !canvas.getContext || !canvasBack || !canvasBack.getContext || !canvas4 || !canvas4.getContext) {
            return false;
        }
        ctxBack = canvasBack.getContext('2d');
        ctx = canvas.getContext('2d');
        ctx4 = canvas4.getContext('2d');

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                ctx.strokeRect(j * squareSize, i * squareSize, squareSize, squareSize);
            }
        }
        //枠線を書く
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(10 * squareSize, 0);
        ctx.lineTo(10 * squareSize, 20 * squareSize);
        ctx.moveTo(0, 10 * squareSize);
        ctx.lineTo(20 * squareSize, 10 * squareSize);
        ctx.stroke();
        ctx.lineWidth = 1;

        Coloring();

        canvas4.addEventListener('mousedown', mouseDown);
        canvas.addEventListener('mousedown', mouseUp);
        canvas.addEventListener('mousemove', mouseMove);
        canvas.addEventListener('mouseleave', mouseLeave);
    }


    function mouseMove(event) {
        //メインキャンバス上でマウスが動かされると実行される
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
    }


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
    }


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
                alert("盤面の外にピースがでちゃうように置かないで")
            } else if (FirstFlag) {
                for (let i = 0; i < Pieces[selectNum].childline.length; i++) {
                    Board[Math.floor(event.offsetY / squareSize) + Pieces[selectNum].childline[i]][Math.floor(event.offsetX / squareSize) + Pieces[selectNum].childcolumn[i]] = playerNum;
                }
                Coloring();
                Pieces[selectNum].useFlag = 1; //使用済みピースに変更
                DeletePic();
                SelectFlag = 0; //ピースを選択していない状態にする
                selectNum = 21; //選択ピース番号を範囲外に変更

                ctx4.fillStyle = "white"; //サブキャンバスを白塗り
                ctx4.fillRect(0, 0, squareSize * 5, squareSize * 5);
                console.log(Board);
                countTurn += 1;
            } else {
                alert("盤面の角が埋まるように")
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
                alert("盤面の外にピースがでちゃうように置かないで")
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

                ctx4.fillStyle = "white"; //サブキャンバスを白塗り
                ctx4.fillRect(0, 0, squareSize * 5, squareSize * 5);
                console.log(Board);
            } else {
                if (!CornerFlag) {
                    errmsg += "既に配置してあるピースの頂点に触れるようにせい\n";
                }
                if (!PlaceFlag) {
                    errmsg += "既にピースが置いてあります\n";
                }
                if (!EdgeFlag) {
                    errmsg += "既に配置してあるピースの辺に接しちゃダメ\n";
                }
                alert(errmsg);
            }
        }
    }


    function Coloring() {
        //Boardの状態から色を塗る
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (Board[i][j] != 0) {
                    ctx.fillStyle = PlayerColor[Board[i][j] - 1];
                    ctx.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);
                }
            }
        }
    }


    function Coloring2() {
        //メインじゃない方のボード(ctx4)に選択したピースを映し出す
        //引数はピースの番号0~20 　21の時は白(ピースが選ばれていない状態)にする
        ctx4.fillStyle = "white"; //白にして、前にあったやつを消す
        ctx4.fillRect(0, 0, 5 * squareSize, 5 * squareSize);
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
    }


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
            alert("すでに使用済みのピースです");
        }
    }


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
    }

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
    }

    function DeletePic() {
        //使用したピースの画像をcssを使って非表示or半透明表示にする。
        document.getElementById("changes" + selectNum).classList.add("addColor");
    }

}