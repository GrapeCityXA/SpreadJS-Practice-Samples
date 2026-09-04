import * as GC from "@grapecity-software/spread-sheets";



/**
 * 单击表单中某一列数据，查询与之相关的数据信息，支持更新操作。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

//关联数据
let info = [{
    name: 'lilac',
    date: '2021-08-09',
    count: 50,
}, {
    name: 'memo',
    date: '2021-09-07',
    count: 10000,
}]

//初始化数据信息
sheet.setArray(0, 0, [
    ['lilac', '女'],
    ['memo', '男']
])
//绑定单元格点击事件 点击第1列，根据name去匹配要显示的数据
sheet.bind(GC.Spread.Sheets.Events.CellClick, (s, args) => {
    if (args.col == 0) {
        let value = sheet.getText(args.row, args.col)
        for (let i = 0; i < info.length; i++) {
            if (info[i].name == value) {
                document.getElementById('info').style.display = 'block'
                document.getElementById('date').value = info[i].date
                document.getElementById('count').value = info[i].count
                return
            }
        }
        alert('没有关联信息')
    }
})
//点击关闭按钮 设置CSS样式让其不可见
document.getElementById('close').onclick = () => {
    document.getElementById('info').style.display = 'none'
}

//点击更新按钮，修改info中对应的数据
document.getElementById('update').onclick = () => {
    if (sheet.getActiveColumnIndex() == 0) {
        let name = sheet.getValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex())
        let date = document.getElementById('date').value
        let count = document.getElementById('count').value
        if (!(date && count)) {
            alert("输入项不能为空")
            return
        }
        for (let i = 0; i < info.length; i++) {
            if (info[i].name == name) {
                info[i].date = date
                info[i].count = count
            }
        }
        alert('修改成功')
    } else {
        alert('必须在第一列点击')
    }
    //初始化不显示info对应的div块
    document.getElementById('info').style.display = 'none'
}