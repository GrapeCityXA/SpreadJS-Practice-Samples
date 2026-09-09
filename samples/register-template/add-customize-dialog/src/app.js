import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"





let CreateId = {
  type: "FlexContainer",
  margin: "10px",
  children: [
    {
      type: "FlexContainer",
      children: [
        {
          type: "Radio",
          items: [
            {
              text: "横向打印",
              value: "horizontal",
            },
            {
              text: "纵向打印",
              value: "vertical",
            },
          ],
          bindingPath: "direction",
        },
        {
          type: "FlexContainer",
          enableWhen: "direction=horizontal",
          margin: "10px 0",
          children: [
            {
              type: "ColumnSet",
              children: [
                {
                  type: "Column",
                  children: [
                    {
                      type: "CheckBox",
                      text: "显示边框",
                      bindingPath: "showBorder",
                    },
                  ],
                  width: "120px",
                },
                {
                  type: "Column",
                  children: [
                    {
                      type: "CheckBox",
                      text: "显示网格线",
                      bindingPath: "col",
                    },
                  ],
                  width: "120px",
                },
              ],
            },
          ],
        },
        {
          type: "FlexContainer",
          enableWhen: "direction=vertical",
          margin: "10px 0",
          children: [
            {
              type: "ColumnSet",
              children: [
                {
                  type: "Column",
                  children: [
                    {
                      type: "CheckBox",
                      text: "显示行头",
                      bindingPath: "showRowHeader",
                    },
                  ],
                  width: "120px",
                },
                {
                  type: "Column",
                  children: [
                    {
                      type: "CheckBox",
                      text: "显示列头",
                      bindingPath: "showColumnHeader",
                    },
                  ],
                  width: "120px",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

let richSheetTagTemplate = {
  title: "自定义打印",
  content: [
    {
      type: "TabControl",
      width: 400,
      height: 300,
      bindingPath: "dialogOption",
      children: [
        {
          key: "printTab",
          text: "打印",
          children: [CreateId],
        },
      ],
    },
  ],
};
GC.Spread.Sheets.Designer.registerTemplate("newTab", richSheetTagTemplate);



let ribbonTabCommands  = {
    text: "页面设置",
    iconClass: "ribbon-button-sheetgeneral",
    bigButton: true,
    commandName: "ribbonTabCommands ",
    execute: async (context) => {
      let spread = context.getWorkbook();
      let sheet = spread.getActiveSheet();
      let sheetIndex = spread.getSheetIndex(sheet.name());

      let option = {
        tag: sheet.tag(),
        direction: "vertical",
        showBorder: true,
        dialogOption: {
          activeTab: "printTab",
          showTabList: ["printTab"],
        },
      };
    //   打开对话框
      GC.Spread.Sheets.Designer.showDialog("newTab", option, (result) => {
        // 当对话框被关闭时的回调函数
        let printInfo = sheet.printInfo();
        console.log(result);
        if (result.direction === "horizontal") {
          printInfo.orientation(
            GC.Spread.Sheets.Print.PrintPageOrientation.landscape
          );

          if (result.showBorder) {
            printInfo.showBorder(true);
            printInfo.showGridLine(false);
          }

          if (result.showGridLine) {
            if (result.showBorder === false) {
              printInfo.showBorder(false);
            }
            printInfo.showGridLine(true);
          }
          spread.print();
        }

        if (result.showRowHeader === false) {
          printInfo.showRowHeader(
            GC.Spread.Sheets.Print.PrintVisibilityType.hide
          );

          if (result.showColumnHeader === false) {
            printInfo.showColumnHeader(
              GC.Spread.Sheets.Print.PrintVisibilityType.hide
            );
          }

          if (result.showColumnHeader === true) {
            printInfo.showColumnHeader(
              GC.Spread.Sheets.Print.PrintVisibilityType.show
            );
          }

          spread.print();
        }

        if (result.cellId === true) {
          printInfo.showRowHeader(
            GC.Spread.Sheets.Print.PrintVisibilityType.show
          );

          if (result.colClassName === true) {
            printInfo.showColumnHeader(
              GC.Spread.Sheets.Print.PrintVisibilityType.show
            );
          }
          if (result.colClassName === false) {
            printInfo.showColumnHeader(
              GC.Spread.Sheets.Print.PrintVisibilityType.hide
            );
          }
          spread.print();
        }
      });
    },
}

let ribbonPivotConfig1 = {
  label: "打印",
  thumbnailClass: "ribbon-thumbnail-spreadsettings",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["ribbonTabCommands "],
      },
    ],
  },
};

let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
if(!config.commandMap) {
    config.commandMap = {}
}
config.commandMap["ribbonTabCommands "] = ribbonTabCommands;
config.ribbon[2].buttonGroups.push(ribbonPivotConfig1)
console.log(config)

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(1,1,"请点击上方工具栏的\"页面布局\" - \"页面设置\" 后测试")
