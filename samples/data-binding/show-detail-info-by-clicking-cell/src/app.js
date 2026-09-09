import * as GC from "@grapecity-software/spread-sheets";
/**
 * 在工作薄1设置数据源标题，工作薄2展示数据源汇中信息，工作簿3展示详细数据
 */

//定义数据源常量
let dataSource1 = [{
    name: "GDP:现价：第二产业：当季值",
    id: "A12345",
    formula: "",
    frequency: "季",
    danwei: "亿元",
    startTime: "1992-12",
    endTime: "2020-6",
    updateTime: "2020-10"
}, {
    name: "GDP:现价：工业：当季值",
    id: "B12345",
    formula: "",
    frequency: "季",
    danwei: "亿元",
    startTime: "1992-12",
    endTime: "2020-6",
    updateTime: "2020-10"
},];
var dataSource2 = [{
    name: "GDP:现价：农林牧渔业：当季值",
    id: "A12345",
    formula: "",
    frequency: "季",
    danwei: "亿元",
    startTime: "1992-12",
    endTime: "2020-6",
    updateTime: "2020-10"
}, {
    name: "GDP:现价：工业：当季值",
    id: "B12345",
    formula: "",
    frequency: "季",
    danwei: "亿元",
    startTime: "1992-12",
    endTime: "2020-6",
    updateTime: "2020-10"
}, {
    name: "GDP:现价：第二产业：当季值",
    id: "C12345",
    formula: "",
    frequency: "季",
    danwei: "亿元",
    startTime: "1992-12",
    endTime: "2020-6",
    updateTime: "2020-10"
}];
var dataSource3 = [{
    id: "1",
    updateTime: "2020-10",
    name1: "500",
    name2: "555",
    name3: "511",
    name4: "523"
}, {
    id: "2",
    updateTime: "2020-10",
    name1: "600",
    name2: "666",
    name3: "611",
    name4: "623"
}, {
    id: "3",
    updateTime: "2020-10",
    name1: "700",
    name2: "777",
    name3: "711",
    name4: "623"
}, {
    id: "4",
    updateTime: "2020-10",
    name1: "700",
    name2: "777",
    name3: "711",
    name4: "623"
}, {
    id: "5",
    updateTime: "2020-10",
    name1: "500",
    name2: "555",
    name3: "511",
    name4: "523"
}];

//初始化工作薄
intSpread1();
intSpread2();
intSpread3();

//spread1
function intSpread1() {
    var spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"), {
        sheetCount: 1
    });
    var sheet1 = spread1.getActiveSheet();
    //设置表单标签不可见
    spread1.options.tabStripVisible = false;
    //挂起绘画
    sheet1.suspendPaint();
    //设置行头不可见
    sheet1.options.rowHeaderVisible = false;

    loadData(sheet1);
    sheet1.getCell(5, 0).backColor("#c3d08b");
    sheet1.getCell(6, 0).backColor("#f9cc9d");

    sheet1.outlineColumn.options({
        columnIndex: 0,
        showCheckBox: true,
        expandIndicator: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3093987223,43057195&fm=26&gp=0.jpg',
        collapseIndicator: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1387005891,2751632088&fm=26&gp=0.jpg'
    });
    sheet1.showRowOutline(false);
    sheet1.outlineColumn.refresh();
    sheet1.resumePaint();

    //绑定单元格单击事件
    sheet1.bind(GC.Spread.Sheets.Events.CellClick, function (sender, args) {
        //遍历行，判断选择状态
        var dataSourceAll = [];
        var rc = sheet1.getRowCount();
        for (var i = 0; i < rc; i++) {
            var checkStatus = sheet1.outlineColumn.getCheckStatus(i);
            if (checkStatus) {
                if (i == 5) {
                    //拼接数据源
                    dataSourceAll = dataSourceAll.concat(dataSource1);
                } else if (i == 6) {
                    dataSourceAll = dataSourceAll.concat(dataSource2);
                }
            }
        }
        changeDataSource(dataSourceAll);
    });
}

function loadData(sheet1) {
    //分组列数据源
    var data = [{
        name: "国内生产总值",
        level: 0
    }, {
        name: "GDP:现价：当季值",
        level: 1
    }, {
        name: "GDP:现价：第一产业：当季值",
        level: 1
    }, {
        name: "GDP:现价：第二产业：当季值",
        level: 1
    }, {
        name: "GDP:现价：第三产业：当季值",
        level: 1
    }, {
        name: "GDP:现价：农林牧渔业：当季值",
        level: 2
    }, {
        name: "GDP:现价：工业：当季值",
        level: 2
    }, {
        name: "GDP:现价：建筑业：当季值",
        level: 2
    }, {
        name: "GDP:现价：批发和零售业：当季值",
        level: 2
    }

    ];
    sheet1.setDataSource(data);
    sheet1.bindColumn(0, 'name');
    sheet1.setColumnCount(1);
    sheet1.setColumnWidth(0, 430);
    //根据level的值缩进，实现分组效果
    for (var r = 0; r < data.length; r++) {
        var level = data[r].level;
        sheet1.getCell(r, 0).textIndent(level);
    }
}

//spread2
function intSpread2() {
    new GC.Spread.Sheets.Workbook(document.getElementById("ss2"), {
        sheetCount: 1
    });
}

//给工作薄2绑定数据源
function changeDataSource(dataSource) {
    let spread2 = GC.Spread.Sheets.findControl(document.getElementById('ss2'));
    let sheet2 = spread2.getActiveSheet();
    sheet2.autoGenerateColumns = false;
    sheet2.setDataSource(dataSource);
    var colInfos = [{
        name: "name",
        displayName: "指标名称",
        size: 250
    }, {
        name: "id",
        displayName: "指标ID",
        size: 100
    }, {
        name: "formula",
        displayName: "公式",
        size: 100
    }, {
        name: "frequency",
        displayName: "频率",
        size: 100
    }, {
        name: "danwei",
        displayName: "单位",
        size: 100
    }, {
        name: "startTime",
        displayName: "起始时间",
        size: 100
    }, {
        name: "endTime",
        displayName: "结束时间",
        size: 100
    }, {
        name: "updateTime",
        displayName: "更新时间",
        size: 100
    }];
    sheet2.bindColumns(colInfos);
}

//初始化工作薄三
function intSpread3() {
    new GC.Spread.Sheets.Workbook(document.getElementById("ss3"), {
        sheetCount: 1
    });
}

//给工作薄三绑定数据源
function changeDataSource2(dataSource) {
    let spread3 = GC.Spread.Sheets.findControl(document.getElementById('ss3'));
    let sheet3 = spread3.getActiveSheet();
    sheet3.autoGenerateColumns = false;

    let names = [];
    let updateTimes = [];
    if (dataSource) {
        for (var i = 0; i < dataSource.length; i++) {
            names.push(dataSource[i].name);
            updateTimes.push(dataSource[i].updateTime);
        }
        sheet3.setDataSource(dataSource3);
        let colInfos = [{
            name: "id",
            displayName: "序号",
            size: 50
        }, {
            name: "updateTime",
            displayName: "更新时间",
            size: 100
        }];
        for (var i = 0; i < names.length; i++) {
            colInfos.push({
                name: "name" + (i + 1),
                displayName: names[i],
                size: 220
            })
        }
        sheet3.bindColumns(colInfos);

    }
}
document.getElementById('dataInfo').addEventListener("click", function () {
    let spread2 = GC.Spread.Sheets.findControl(document.getElementById('ss2'));
    let sheet2 = spread2.getActiveSheet();
    let dataSource = sheet2.getDataSource();
    changeDataSource2(dataSource);
})
