import * as GC from "@grapecity/spread-sheets";

let currentPic;
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()

fetch("src/love.png")
let picture = sheet.pictures.add('pc1', "https://jscodemine.grapecity.com/serve/share/uFyonzEaAk2rh3r2mqCVDQ/src/love.png", 50, 50, 100, 100)
picture.backColor("black")
picture.startRow(1)
picture.startColumn(1)


let pc2 = sheet.pictures.add('pc2', "https://jscodemine.grapecity.com/serve/share/uFyonzEaAk2rh3r2mqCVDQ/src/colorful_love.png", 100, 100, 100, 100)
pc2.startRow(10)
pc2.startColumn(1)


pc2.backColor("green")
sheet.bind(GC.Spread.Sheets.Events.PictureSelectionChanged, function (e, info) {
    //监听图片的选中状态变化事件
    document.getElementById('updatePic').style.display = 'none'
    if (info.picture.isSelected()) {
        //如果是选中状态
        document.getElementById('updatePic').style.display = 'block'
        currentPic = info.picture
    }
});

document.getElementById('update').onclick = () => {
    //更新图片
    currentPic.src(document.getElementById('picSrc').value)
    currentPic.isSelected(false)
    document.getElementById('picSrc').value = ''
    document.getElementById('updatePic').style.display = 'none'
}
