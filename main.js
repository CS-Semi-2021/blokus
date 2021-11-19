var canvas;
var ctx;
var canvas4;
var ctx4;
var startx = 0;
var starty = 0;
var Curflag = 0;//カーソルのスタート位置が盤面外なら1、中なら0
var Placeflag = 0;//置こうとしている位置にピースがある場合0、ないなら1
var Cornerflag = 0;//既に置いている自分のピースの頂点に、新しく置こうとしているピースの頂点が触れるなら1、触れないなら0
var Edgeflag = 0;//既に置いている自分のピースの辺に、新しく置こうとしているピースの辺がふれるなら0，ふれないなら1
var Regionflag = 0;//ピースが20×20の盤面の外にでる部分があれば0、なければ1
var Selectflag = 0; //Canvas4にピースが描画されており、それを選択したとき1になる。ピースをメインキャンバスに置くと０になる
var selectnum = 0; //今選んでいるピースの番号が格納される
var errmsg;
var w = 0;
var tmp = [0, 0, 0, 0, 0] //ピースを回転させるときにちょっと使う

var PlayerColor = ["green", "pink", "blue", "orange"];//プレイヤーのピースカラー
var playernum = 1;//プレイヤーナンバー

//盤面
//Boardは行列表現！XY座標とはちがうから混同しないように！
//Board[i][j]　iが↓成分　jが->成分
let Board = new Array(20);
for(let x = 0; x < 20; x++) {
  Board[x] = new Array(20);
  for(let y = 0; y < 20; y++) {
    Board[x][y] = 0;
  }
}
Board[0][3] = 1; Board[0][4]=1; Board[0][5]= 1; Board[1][4]=1;
Board[0][12] = 2;
Board[11][9] = 3;
Board[11][11] = 4;


//https://upload.wikimedia.org/wikipedia/commons/0/0a/BlokusTiles.svg

let piece0 = {
    childline:[0],
    childcolumn:[0],
    useflag:0//このピースをつかったら1に変更される。0ならまだ使っていないピース
}

let piece1 = {
    childline:[0, 0],
    childcolumn:[0, 1],
    useflag:0
}

let piece2 = {
    childline:[0, 0, 1],
    childcolumn:[0, -1, 0],
    useflag:0
}

let piece3 = {
    childline:[0, 0, 0],
    childcolumn:[0, -1, 1],
    useflag:0
}

let piece4 = {
    childline:[0, 0, 1, 1],
    childcolumn:[0, 1, 0, 1],
    useflag:0
}

let piece5 = {
    childline:[0, 0, 0, -1],
    childcolumn:[0, -1, 1, 0],
    useflag:0
}

let piece6 = {
    childline:[0, 0, 0, 0],
    childcolumn:[0, -1, 1, 2],
    useflag:0
}

let piece7 = {
    childline:[0, 0, 0, -1],
    childcolumn:[0, -1, -2, 0],
    useflag:0
}

let piece8 = {
    childline:[0, 0, 1, 1],
    childcolumn:[0, 1, 0, -1],
    useflag:0
}

let piece9 = {
    childline:[0, 0, 0, 0, -1],
    childcolumn:[0, -1, 1, 2, -1],
    useflag:0
}

let piece10 = {
    childline:[0, 0, 0, -1, -2],
    childcolumn:[0, -1, 1, 0, 0],
    useflag:0
}

let piece11 = {
    childline:[0, 0, 0, -1, -2],
    childcolumn:[0, 1, 2, 0, 0],
    useflag:0
}

let piece12 = {
    childline:[0, 0, 0, 1, 1],
    childcolumn:[0, 1, 2, 0, -1],
    useflag:0
}

let piece13 = {
    childline:[0, 0, 0, -1, 1],
    childcolumn:[0, 1, -1, 1, -1],
    useflag:0
}

let piece14 = {
    childline:[0, -1, -2, 1, 2],
    childcolumn:[0, 0, 0, 0, 0],
    useflag:0
}

let piece15 = {
    childline:[0, 0, -1, 1, 1],
    childcolumn:[0, 1, 0, 0, 1],
    useflag:0
}

let piece16 = {
    childline:[0, 0, -1, -1, 1],
    childcolumn:[0, -1, 0, 1, -1],
    useflag:0
}

let piece17 = {
    childline:[0, -1, -1, 1, 1],
    childcolumn:[0, 0, 1, 0, 1],
    useflag:0
}

let piece18 = {
    childline:[0, 0, -1, -1, 1],
    childcolumn:[0, -1, 0, 1, 0],
    useflag:0
}

let piece19 = {
    childline:[0, 0, 0, -1, 1],
    childcolumn:[0, -1, 1, 0, 0],
    useflag:0
}

let piece20 = {
    childline:[0, 0, 0, 0, -1],
    childcolumn:[0, -1, 1, 2, 0],
    useflag:0
}

let piece21 = {
    childline:[],
    childcolumn:[],
    useflag:1
}


let Pieces = [piece0, piece1, piece2, piece3, piece4, piece5, piece6, piece7, piece8, piece9, piece10,
     piece11, piece12, piece13, piece14, piece15, piece16, piece17, piece18, piece19, piece20, piece21]

onload = function(){
    draw3();

    
function draw3(){
    canvas = document.getElementById("rectangle3");
    canvas4 = document.getElementById("rectangle4");
    if ( ! canvas || ! canvas.getContext ) {
        return false;
    }
    ctx = canvas.getContext('2d');
    ctx4 = canvas4.getContext('2d');

    for (var i = 0; i < 20; i++){
        for (var j = 0; j < 20; j++){
            ctx.strokeRect(j*50, i*50, 50, 50);
        }
    }
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(500, 0);
    ctx.lineTo(500, 1000);
    ctx.moveTo(0, 500);
    ctx.lineTo(1000, 500);
    ctx.stroke();
    ctx.lineWidth = 1;
    
    Coloring();

    //canvas.addEventListener('mousedown', mouseDown);
    canvas4.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mousedown', mouseUp);

}

function mouseDown(event){
    //Canvas2の上でクリックされると実行される関数
    if (selectnum == 21){
        Selectflag = 0;
    }
    else{
        Selectflag = 1;
        ctx4.lineWidth = 1;
        ctx4.beginPath();
        ctx4.strokeStyle = "red";
        ctx4.strokeRect(0, 0, 250, 250);
        ctx4.stroke();
    }
    console.log(selectnum);
}

function mouseUp(event){
    //ctx.fillStyle = "black";
    if (event.offsetX < 1000 && event.offsetY < 1000 && Selectflag){
        console.log("X= ", event.offsetX);
        console.log("Y= ", event.offsetY);
        Placeflag = 1; //新しく置く毎にフラグを設定する
        Cornerflag = 0;
        Edgeflag = 1;
        Regionflag = 0;
        errmsg = "";
        for (var i = 0; i < Pieces[selectnum].childline.length; i++){
            if (Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] < 0 || Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] < 0){
                //盤面の外にピースがでないかの判定
                Regionflag = 1;
                break;
            }
            if (Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i]] != 0){
                //置く位置にピースが置いてないかの判定
                Placeflag = 0;
            }
            
            
            //既に置いているピースの頂点にふれるかの判定
            //Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]が0の時は上は調べなくてOK。19のときは下は調べなくてOK。エラー出ちゃうからifでわけてみた
            //Boardの配列てきにBoard[~][-~]は平気だけど、Board[-~][~]はエラー出ちゃう
            if (Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] == 0){
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] + 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] - 1] == playernum){Cornerflag = 1}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] + 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] + 1] == playernum){Cornerflag = 1}
            }
            else if (Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] == 19){
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] - 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] - 1] == playernum){Cornerflag = 1}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] - 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] + 1] == playernum){Cornerflag = 1}
            }
            else{
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] - 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] - 1] == playernum){Cornerflag = 1}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] - 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] + 1] == playernum){Cornerflag = 1}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] + 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] - 1] == playernum){Cornerflag = 1}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] + 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] + 1] == playernum){Cornerflag = 1}
            }
            

            //既に配置してあるピースの辺に接するかの判定
            //↑と同様にMath.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]で場合分け
            if (Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] == 0){
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] - 1] == playernum){Edgeflag = 0}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] + 1] == playernum){Edgeflag = 0}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] + 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i]] == playernum){Edgeflag = 0}
            }
            else if(Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] == 19){
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] - 1] == playernum){Edgeflag = 0}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] + 1] == playernum){Edgeflag = 0}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] - 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i]] == playernum){Edgeflag = 0}
            }
            else{
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] - 1] == playernum){Edgeflag = 0}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i] + 1] == playernum){Edgeflag = 0}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] - 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i]] == playernum){Edgeflag = 0}
                if(Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i] + 1][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i]] == playernum){Edgeflag = 0}
            }

        }
        //console.log(Placeflag, Cornerflag, Edgeflag);

        if (Regionflag){
            alert("盤面の外にピースがでちゃうように置かないで")
        }
        else if (Placeflag && Cornerflag && Edgeflag){
            for (var i = 0; i < Pieces[selectnum].childline.length; i++){
                Board[Math.floor(event.offsetY / 50) + Pieces[selectnum].childline[i]][Math.floor(event.offsetX / 50) + Pieces[selectnum].childcolumn[i]] = playernum;
                
            }
            Coloring();
            Pieces[selectnum].useflag = 1;//使用済みピースに変更
            Selectflag = 0; //選択ピース番号を範囲外に変更
            selectnum = 21;
            
            ctx4.fillStyle = "white";
            ctx4.fillRect(0, 0, 250, 250);
            //console.log(Board);
            

        }
        else{
            if(!Cornerflag){
                errmsg += "既に配置してあるピースの頂点に触れるようにせい\n";
            }
            if(!Placeflag){
                errmsg += "既にピースが置いてあります\n";
            }
            if(!Edgeflag){
                errmsg += "既に配置してあるピースの辺に接しちゃダメ\n";
            }
            alert(errmsg);
        }

    }
    
}

function Coloring(){
    //Boardの状態から色を塗る
    for (var i = 0; i < 20; i++){
        for (var j = 0; j < 20; j++){
            if (Board[i][j] != 0){
                ctx.fillStyle = PlayerColor[Board[i][j] - 1];
                ctx.fillRect(j * 50, i * 50, 50, 50);
            }
        }
    }
    //console.log(Board);
}

function Coloring2(num){
    //メインじゃない方のボード(ctx4)に選択したピースを映し出す
    //引数はピースの番号0~20 　21の時は白(ピースが選ばれていない状態)にする
    ctx4.fillStyle = "white";//白にして前にあったやつを消す
    ctx4.fillRect(0, 0, 250, 250);
    for (var i = 0; i < 6; i ++){
        ctx4.beginPath();
        ctx4.lineWidth = 0.2;
        ctx4.strokeStyle = "black";
        ctx4.moveTo(0, 50 * i);
        ctx4.lineTo(250, 50 * i);
        ctx4.moveTo(50 * i, 0);
        ctx4.lineTo(50 * i , 250);
        ctx4.stroke();
    }
    ctx4.fillStyle = "black";
    for (var i = 0; i < Pieces[num].childline.length; i++){
        ctx4.fillRect(100 + 50 * Pieces[num].childcolumn[i], 100 + 50 * Pieces[num].childline[i], 50, 50)
    }
    //中心のマスに赤点を打つ
    ctx4.fillStyle = "red";
    ctx4.beginPath();
    ctx4.arc(125, 125, 3, 0, Math.PI * 2, true);
    ctx4.fill();
}

function loads(k){
    //画像をタップされると実行される関数
    if (Pieces[k].useflag == 0){
        //選ばれたピースが使用済みかどうかで場合分け
        Coloring2(k);
        selectnum = k;
    }
    else{
        Selectflag = 0;
        selectnum = 21;
        Coloring2(selectnum);
        alert("すでに使用済みのピースです");
    }
}

function Rotate(){
    //x=x*cost-y*sint  y=x*sint-y*costみたいなやつをchildlineとchildcolumnで考えれば簡単に回転できる
    //反時計回り
    if (Pieces[selectnum].useflag == 1){
        return;
    }
    for (var i = 0; i < Pieces[selectnum].childline.length; i++){
        tmp[i] = Pieces[selectnum].childline[i];
        Pieces[selectnum].childline[i] = -Pieces[selectnum].childcolumn[i];
        Pieces[selectnum].childcolumn[i] = tmp[i];
    }
    Coloring2(selectnum);
    Selectflag = 0;
}

function Reverse(){
    if (Pieces[selectnum].useflag == 1){
        return;
    }
    for (var i = 0; i < Pieces[selectnum].childline.length; i++){

        Pieces[selectnum].childline[i] = -1 * Pieces[selectnum].childline[i];

    }
    Coloring2(selectnum);
    Selectflag = 0;
}

