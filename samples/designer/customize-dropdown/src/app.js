import * as GC from "@grapecity-software/spread-sheets";
import * as ExcelIO from "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

console.log(ExcelIO)
// ExcelIO.LicenseKey =  "GrapeCity-Internal-Use-Only,jscodemine.grapecity.com,315866278947656#B0dd3dmUx34Ulp4b9YDbU3SQnpWTSdUOHlVRyknd8YjUzUnca3yYRpnaolVWth7M7VHNyInVEBzLpJXcLZjNWRVOYFHNwgmemZWWzQlVw54KONWMDFVRYBzd6ADTN5ESY54cLd6KwJkc9IkWwYzL5J4NTBla93CO8dUOPd5SHFUR6l5MmJWaChHdoNlVEN5a9smTRZDN42ydk9GNuRnTQl7YzNHNE3kYJpEUW9WNoRTRsZ5VqRHNvZ6ZQR5LiVTePhXRvVnV5kDTUpGMJ34VZBDcjNzbJNEMod5Qyh7Tv54NDFWQHJWZPpWavMFeWRVe8ADc6ZlZzkDdOtmTpxkI0IyUiwiI4YUMDFTOEVjI0ICSiwiMxAzN5UzNwcTM0IicfJye35XX3JCTBF5UiojIDJCLiUTMuYHITpEIkFWZyB7UiojIOJyebpjIkJHUiwiI6IjN4EDMggjMxAjMyAjMiojI4J7QiwiIt36YukHdpNWZwFmcn9SZulWblR6bjNnaiojIz5GRiwiIsFmbyVGdulEI9RXaDVGchJ7RiojIh94QiwiI6UjN7QTO8cjM6YDO5EzMiojIklkIs4XXiUGbiFGV43mdpBlIbpjInxmZiwSZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34zdJFneLRGVud6RSVGMUZWZ6QXTk3mcvIGW4BTUvgGM5N4ZQJmcwE5aZF7VlljV58WQ6RnWpJWQuRWW8NHTBVTOuFnQQZ6NTZma6YzdwkTevhDRiJnWvcXdvU";
var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
    Welcome: {
        title: "Welcome",
        text: "Welcome",
        iconClass: "ribbon-button-welcome",
        bigButton: "true",
        commandName: "Welcome",
        execute: function (context, propertyName, fontItalicChecked) {
            alert('Welcome to new designer.');
        }
    },
    childrenDropdown: {
        commandName: "childrenDropdown",
        text: "Children",
        title: "Children",
        iconClass: "ribbon-button-welcome",
        bigButton: "true",
        direction: "vertical",
        execute: function (context, propertyName, fontItalicChecked) {
            alert('childrenDropdown');
        }
    },
    childrenDropdown1: {
        title: "children 1",
        text: "children 1",
        iconClass: "ribbon-button-welcome",
        commandName: "childrenDropdown1",
        execute: function (context, propertyName, fontItalicChecked) {
            alert('childrenDropdown1.');
        }
    },
    childrenDropdown2: {
        title: "children 2",
        text: "children 2",
        iconClass: "ribbon-button-welcome",
        commandName: "childrenDropdown2",
        execute: function (context, propertyName, fontItalicChecked) {
            alert('childrenDropdown2.');
        }
    },
    listDropdown: {
        title: "List",
        text: "List",
        iconClass: "ribbon-button-welcome",
        commandName: "listDropdown",
        execute: function (context, propertyName, fontItalicChecked) {
            alert(propertyName);
        },
        type: "dropdown",
        dropdownList:[
            {text: "list1", value: "list1"},
            {text: "list2", value: "list2"},
            {text: "list3", value: "list3"},
            {groupName: "list4", groupItems: [{text: "list4-1", value: "list4-1"},{text: "list4-2", value: "list4-2"}]}
        ]
    },
}

// 设计器dropdown可以通过children和dropdownList两种方式设置下拉项目
// 区别就是字面意思，children是添加子命令，dropdownList是给当前命令添加可选择项
config.ribbon[0].buttonGroups.unshift({
    "label": "NewDesigner",
    "thumbnailClass": "welcome",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": [
                    "Welcome"
                ]
            },
            {
                command: "childrenDropdown", //父命令可以有自己的execute，点击执行；也可以没有，点击弹出children
                type: "dropdown",
                children: ["childrenDropdown1", "childrenDropdown2"]
            },
            "listDropdown"
        ]
    }
});

config.ribbon.push({
    "text": "自定义",
    "id": "customTab",
    "buttonGroups": []
})


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')






