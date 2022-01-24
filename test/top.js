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
    }
}