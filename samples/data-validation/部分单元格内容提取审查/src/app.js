import * as GC from "@grapecity-software/spread-sheets";
import dataSource from "./dataSource";
import templatejson from "./template"
var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread);
function initSpread(spread) {
    debugger;
    spread.fromJSON(templatejson);
    spread.setActiveSheet("Sheet1");
    // spread.fromJSON(JSON.parse(tableJson));
    let selects = [];
    debugger;
    let data = { dataSource: dataSource };
    let sheet = spread.getSheet(0);
    let table = spread.getSheet(0).tables.all()[0];
    table.autoGenerateColumns(false);
    sheet.defaults.rowHeight = 50;
    // table.set
    var tableColumn1 = new spreadNS.Tables.TableColumn();
    tableColumn1.dataField("name");
    tableColumn1.name("名称");
    var tableColumn2 = new spreadNS.Tables.TableColumn();
    tableColumn2.dataField("Specifications");
    tableColumn2.name("配置");
    var tableColumn3 = new spreadNS.Tables.TableColumn();
    tableColumn3.dataField("quantity");
    tableColumn3.name("数量");
    var tableColumn4 = new spreadNS.Tables.TableColumn();
    tableColumn4.dataField("unitPrice");
    tableColumn4.name("单价");
    var tableColumn5 = new spreadNS.Tables.TableColumn();
    tableColumn5.dataField("unit");
    tableColumn5.name("单位");
    var tableColumn6 = new spreadNS.Tables.TableColumn();
    tableColumn6.dataField("materialDescription");
    tableColumn6.name("规格描述");
    table.bindColumns([tableColumn1, tableColumn2, tableColumn3, tableColumn4, tableColumn5, tableColumn6]);
    table.bindingPath('dataSource');

    let dataSource1 = new spreadNS.Bindings.CellBindingSource(data);
    spread.getSheet(0).setDataSource(dataSource1);
    let rows = sheet.getRowCount();
    for (let i = 0; i + 2 < rows; i++) {
        sheet.setTag(i + 2, -1, `${i}`);
    }
    console.log(table);
    document.getElementById("changeDataSource").addEventListener('click', function () {
        selects = [];
        let sheet = spread.getSheet(0);
        var selections = sheet.getSelections();
        if (!selections || selections.length === 0) {
            return;
        }
        for (let i = 0; i < selections.length; i++) {
            debugger;
            let row = selections[i].row;
            let col = selections[i].col;
            if (col === -1 && row !== -1) {
                selects.push(parseInt(sheet.getTag(row, col)));
            }
        }
        let templateConfigData = [];
        for (let i = 0; i < selects.length; i++) {
            templateConfigData.push(dataSource[selects[i]])
        }
        let data1 = { dataSource1: templateConfigData };
        let sheet1 = spread.getSheetFromName("Sheet2");
        let table1 = sheet1.tables.all()[0];
        table1.autoGenerateColumns(false);
        table1.setColumnFormula(0, `SUBTOTAL(109,[数量])`)
        sheet1.defaults.rowHeight = 50;
        // table.set
        var tableColumnNew1 = new spreadNS.Tables.TableColumn();
        tableColumnNew1.dataField("quantity");
        tableColumnNew1.name("数量");
        var tableColumnNew2 = new spreadNS.Tables.TableColumn();
        tableColumnNew2.dataField("unitPrice");
        tableColumnNew2.name("单价");
        table1.bindColumns([tableColumnNew1, tableColumnNew2]);
        table1.bindingPath('dataSource1');

        let dataSource2 = new spreadNS.Bindings.CellBindingSource(data1);
        spread.getSheet(1).setDataSource(dataSource2);
        spread.setActiveSheet("Sheet2")
        console.log(templateConfigData)

    })


}