import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();



var _lines = ["Computers", "Washers", "Stoves"];
var _colors = ["Red", "Green", "Blue", "White"];
var _ratings = ["Terrible", "Bad", "Average", "Good", "Great", "Epic"];

initSpread(spread);

// 数据结构声明
function Product(id, line, color, name, price, cost, weight, discontinued, rating) {
    this.id = id;
    this.line = line;
    this.color = color;
    this.name = name;
    this.price = price;
    this.cost = cost;
    this.weight = weight;
    this.discontinued = discontinued;
    this.rating = rating;
}

// 创建数据源
function getProducts(count) {
    var dataList = [];
    for (var i = 1; i <= count; i++) {
        var line = _lines[parseInt(Math.random() * 3)];
        var product = new Product(i,
            line,
            _colors[parseInt(Math.random() * 4)],
            line + " " + line.charAt(0) + i,
            parseInt(Math.random() * 5001) / 10.0 + 500,
            parseInt(Math.random() * 6001) / 10.0,
            parseInt(Math.random() * 10001) / 100.0,
            !!(Math.random() > 0.5),
            _ratings[parseInt(Math.random() * 6)]);

        dataList[i - 1] = product;
        // 设置隐藏数据，把保存一些隐藏数据，以及原始数据
        dataList[i - 1].hideData = {
            row: i,
            rowName: "row_" + i,
            originData: JSON.parse(JSON.stringify(product))
        }
    }
    return dataList;
}

function initSpread(spread) {
    spread.suspendPaint();
    spread.options.tabStripRatio = 0.8;

    var products = getProducts(10);

    var sheet = spread.getActiveSheet();
    sheet.name("Custom binding");
    sheet.autoGenerateColumns = false;
    sheet.setDataSource(products);
    var colInfos = [
        { name: "id", displayName: "ID" },
        { name: "name", displayName: "Name", size: 100 },
        { name: "line", displayName: "Line", size: 80 },
        { name: "color", displayName: "Color" },
        { name: "price", displayName: "Price", formatter: "0.00", size: 80 },
        { name: "cost", displayName: "Cost", formatter: "0.00", size: 80 },
        { name: "weight", displayName: "Weight", formatter: "0.00", size: 80 },
        { name: "discontinued", displayName: "Discontinued", cellType: new GC.Spread.Sheets.CellTypes.CheckBox(), size: 100 },
        { name: "rating", displayName: "Rating" }
    ];
    sheet.bindColumns(colInfos);
    console.log("复制粘贴前的数据源：")
    console.log(JSON.parse(JSON.stringify(sheet.getDataSource())))

    //—————————————————— 开始实现标记diff单元格数据 ————————————————————
    // 建立快速查找列名和字段的映射对象
    var colInfoNameToKey = {
        "ID": "id",
        "Name": "name",
        "Line": "line",
        "Color": "color",
        "Price": "price",
        "Cost": "cost",
        "Weight": "weight",
        "Discontinued": "discontinued",
        "Rating": "rating"
    };

    /*
        这里声明了一个新的单元格类型
    */
    function ShowDiffCellType() {
    }
    /*
        新类型继承了SpreadJS原生的Text类型
    */
    ShowDiffCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
    /*
        重写Text的paint方法
    */
    ShowDiffCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
        // 这里可以用来标记与原始数据不一样的单元格
        const sheet = options.sheet;
        const col = options.col;
        const row = options.row;
        const colName = sheet.getDataColumnName(col);
        const colKey = colInfoNameToKey[colName];
        const dataItem = sheet.getDataItem(row);
        if (dataItem.hideData) {
            if (dataItem.hideData.originData[colKey] !== value) {
                // 更改渲染样式
                style.backColor = 'red';
            }
        }
        GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
    };
    // 设置sheet全局生效
    var defautStyle = sheet.getDefaultStyle();
    defautStyle.cellType = new ShowDiffCellType();
    sheet.setDefaultStyle(defautStyle);
    //—————————————————— 结束实现标记diff单元格数据 ————————————————————

    //—————————————————— 开始实现复制隐藏数据 ——————————————————————————

    // 2、重写copy命令
    let copyRange;
    spread.commandManager().register("myCopy",
        {
            canUndo: true,
            execute: function (context, options, isUndo) {
                options.cmd = "copy";
                // 获取复制区域
                const sheet = spread.getSheetFromName(options.sheetName);
                // 这里默认只拷贝第一个区域，如果需要多区域拷贝，自行处理
                copyRange = sheet.getSelections()[0];
                // 执行复制操作
                spread.commandManager().execute(options);
                options.cmd = "myCopy";
            }
        });
    // 设置快捷键Ctrl + C
    spread.commandManager().setShortcutKey(
        "copy", null, false, false, false, false
    );
    spread.commandManager().setShortcutKey(
        "myCopy", GC.Spread.Commands.Key.c, true, false, false, false
    );
    sheet.bind(GC.Spread.Sheets.Events.ClipboardPasted, (e, args) => {
        // 粘贴后把源数据带过来：
        const cellRange = args.cellRange;
        const sheet = args.sheet;
        const copyDatas = [];
        for (let i = copyRange.row; i < copyRange.row + copyRange.rowCount; i++) {
            copyDatas.push(sheet.getDataItem(i));
        }
        for (let i = cellRange.row; i < cellRange.row + cellRange.rowCount; i++) {
            let dataSource = sheet.getDataSource();
            dataSource[i].hideData = copyDatas[i - cellRange.row].hideData;
        }
        sheet.repaint();
        setTimeout(function() {
            console.log("=============")
            console.log("复制粘贴后的数据源：")
            console.log(sheet.getDataSource())
        }, 100)
    });

    //—————————————————— 结束实现复制隐藏数据 ——————————————————————————

    spread.resumePaint();
};
