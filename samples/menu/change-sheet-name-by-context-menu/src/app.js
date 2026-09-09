import * as GC from "@grapecity-software/spread-sheets";
/**
 * sheet部分右键菜单中，添加修改菜单名称选项
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
//定义修改表单名称的子项
let openDialog = {
    text: '修改sheet名称',
    name: 'changeSheetName',
    command: changeSheetName,
    workArea: 'sheetTab'
};
//将其加入菜单列表项
spread.contextMenu.menuData.push(openDialog);

//让修改的操作的dialog可见
function changeSheetName() {
    document.getElementById('dialog').style.display = 'block'
}

//获取输入框的值，设置为当前sheet的名字
document.getElementById('save').onclick = function () {
    let name = document.getElementById('sheet_name').value
    let sheet = spread.getActiveSheet()
    if (name) {
        sheet.name(name)
        spread.refresh()
        document.getElementById('dialog').style.display = 'none'
    } else {
        alert('表单名称不能为空')
    }
}
//响应取消操作
document.getElementById('cancel').onclick = function () {
    document.getElementById('dialog').style.display = 'none'
}