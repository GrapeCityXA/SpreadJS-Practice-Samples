import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()
let spreadNS = GC.Spread.Sheets
let table = sheet.tables.add("tableRecordds", 2, 1, 4, 3, spreadNS.Tables.TableThemes.light6);
table.autoGenerateColumns(false);
let tableColumn1 = new spreadNS.Tables.TableColumn();
tableColumn1.name("DESCRIPTION");
tableColumn1.dataField("description");
let tableColumn2 = new spreadNS.Tables.TableColumn();
tableColumn2.name("QUANTITY");
tableColumn2.dataField("quantity");
let tableColumn3 = new spreadNS.Tables.TableColumn();
tableColumn3.name("AMOUNT");
tableColumn3.dataField("amount");
table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
table.bindingPath("records");

//修改表格绑定第一列字段为test
document.getElementById('changeField').onclick = function(){
   // 修改列的绑定字段，不能直接更新列所在的dataField,必须要重新new column
    let tableColumn1 = new spreadNS.Tables.TableColumn();
    tableColumn1.name("测试");
    tableColumn1.dataField("test");
    table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
    sheet.repaint()
}

//修改完成之后绑定数据
document.getElementById('bindData').onclick = function(){
    let data = {
    records:[
            {
                test: 1,
                quantity:'good',
                amount: 100
            }
        ]
    }
    let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
    sheet.setDataSource(source)
}


