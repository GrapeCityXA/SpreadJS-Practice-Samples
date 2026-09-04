import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');

/**
 * 年龄列会定时mock新的数据，模拟实际业务中，前端向后端请求数据然后显示到表格的效果
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
//定义列头信息
let colInfos = [
    { name: 'name', displayName: '姓名', size: 70 },
    { name: 'position', displayName: '职位', size: 50, visible: true },
    { name: 'birthday', displayName: '生日', formatter: 'YYYY-MM-DD', size: 120 },
    { name: 'age', displayName: '年龄', size: 40, resizable: true },
];
//定义初始数据
var datasource = [
       { name: 'Alice', age: 27, birthday: '1994/08/31', position: 'PM' },
       { name: 'memo', age: 28, birthday: '1993/05/08', position: 'teacher' },
       { name: 'Alice', age: 27, birthday: '1994/08/31', position: 'PM' },
       { name: 'memo', age: 28, birthday: '1993/05/08', position: 'teacher' },
       { name: 'Alice', age: 27, birthday: '1994/08/31', position: 'PM' },
       { name: 'memo', age: 28, birthday: '1993/05/08', position: 'teacher' },
       { name: 'Alice', age: 27, birthday: '1994/08/31', position: 'PM' },
       { name: 'memo', age: 28, birthday: '1993/05/08', position: 'teacher' },
       { name: 'Alice', age: 27, birthday: '1994/08/31', position: 'PM' },
       { name: 'memo', age: 28, birthday: '1993/05/08', position: 'teacher' },
    ];
//设置绑定关系及数据
sheet.autoGenerateColumns = false;
sheet.setDataSource(datasource);
sheet.bindColumns(colInfos);
function getRandom(){
    //该函数用来模拟数据，实际项目中，这里应该是发送请求给服务端，返回更新后的数据
    let randoms = []
    for(let i=0;i<6;i++){
        let item = Math.floor(Math.random()*(30-20+1)+20)
        randoms.push([item])
    }
    return randoms
}
setInterval(function(){
    //定时去更新年龄所在列
    sheet.setArray(0,3,getRandom())
},1000)
