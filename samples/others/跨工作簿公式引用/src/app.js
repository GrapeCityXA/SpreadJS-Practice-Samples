import * as GC from "@grapecity-software/spread-sheets";
import  "@grapecity-software/spread-sheets-io"



function readJSONFromFile(input, callback) {
    var file = input.files[0];
    if (file) {
        var fileName = file.name;
        var suffix = fileName.substr(fileName.lastIndexOf('.')).toLowerCase();
        if (suffix === '.xlsx') {
            sub_spread.import(file, function () {
                let json = sub_spread.toJSON();
                callback(json);
            }, function (e) {
                console.log(e);
            }, {fileType: GC.Spread.Sheets.FileType.excel});
        } else if (suffix === '.ssjson') {
            var reader = new FileReader();
            reader.onload = function () {
                let json = JSON.parse(this.result)
                sub_spread.fromJSON(json)
                callback(json);
            };
            reader.readAsText(file);
        }
    }
}

function addEvents(spread) {
    var openButton = document.getElementById('openButton');
    openButton.addEventListener('click', function () {
        var file = document.getElementById("importFile").files[0];

        spread.import(file, function(){
            showLinkList(spread);
        },function(err){
            console.log(err)
        },{fileType: GC.Spread.Sheets.FileType.excel})
    });

    document.getElementById("setExtFormula").addEventListener('click', function(){
        setExtFormula(spread, sub_spread);
    })
}

function setExtFormula(spread, sub_spread){
    if(!selectedItem){
        selectedItem = {
            name: "Ext1.xlsx"
        }
    }
    if(!selectedItem.filePath){
        selectedItem.filePath = "";
    }
    var targetSheet = spread.getActiveSheet();
    var extSheet = sub_spread.getActiveSheet();
    var selectedRanges = extSheet.getSelections();
    var formula = GC.Spread.Sheets.CalcEngine.rangesToFormula(selectedRanges, 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute)
    formula = `='${selectedItem.filePath}[${selectedItem.name}]${extSheet.name()}'!${formula}`;
    targetSheet.setFormula(targetSheet.getActiveRowIndex(), targetSheet.getActiveColumnIndex(), formula)

    spread.updateExternalReference(selectedItem.name, sub_spread.toJSON(), selectedItem.filePath);
    showLinkList(spread)
}

function showLinkList(spread) {
    let table = document.getElementById("states-table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    spread.getExternalReferences().forEach(item => {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(item.name));
        tr.appendChild(td);
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(item.filePath));
        tr.appendChild(td);
        var td = document.createElement("td");
        var input = document.createElement("input");
        input.type="file";
        input.onchange = function (e){
            updateExternalLink(e, spread)
        };
        input.setAttribute("info", JSON.stringify(item));
        td.appendChild(input);
        tr.appendChild(td);
        table.appendChild(tr);
   });
}

let selectedItem;
function updateExternalLink(e, spread) {
    let item = JSON.parse(e.target.getAttribute("info"));
    selectedItem = item;
    readJSONFromFile(e.target, function(json) {
        spread.updateExternalReference(item.name, json, item.filePath);
    });
}

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sub_spread = new GC.Spread.Sheets.Workbook(document.getElementById("sub_ss"));
addEvents(spread)