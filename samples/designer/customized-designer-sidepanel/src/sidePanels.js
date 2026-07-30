import * as GC from "@grapecity-software/spread-sheets";

var auditTemplate = {
  templateName: "auditOptionTemplate",
  content: [
    {
      type: "TextBlock",
      style: "margin:10px;font-size: 20px;font-weight: lighter;color: #08892c",
      text: "审计追踪",
    },
    {
      type: "Container",
      children: [
        {
          type: "Container",
          margin: "10px 5px",
          children: [
            {
              type: "ColumnSet",
              margin: "5px 0px",
              children: [
                {
                  type: "Column",
                  width: "100px",
                  children: [
                    {
                      type: "TextBlock",
                      style: "color: #08892c",
                      text: "1",
                    },
                  ],
                },
                {
                  type: "Column",
                  width: "110px",
                  children: [
                    {
                      type: "TextBlock",
                      bindingPath: "text1",
                    },
                  ],
                },
              ],
            },
            {
              type: "ColumnSet",
              margin: "5px 0px",
              children: [
                {
                  type: "Column",
                  width: "100px",
                  children: [
                    {
                      type: "TextBlock",
                      text: "|",
                    },
                  ],
                },
              ],
            },
            {
              type: "ColumnSet",
              margin: "5px 0px",
              children: [
                {
                  type: "Column",
                  width: "100px",
                  children: [
                    {
                      type: "TextBlock",
                      style: "color:red",
                      text: "2",
                    },
                  ],
                },
                {
                  type: "Column",
                  width: "110px",
                  children: [
                    {
                      type: "TextBlock",
                      bindingPath: "text2",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
GC.Spread.Sheets.Designer.registerTemplate(
  "auditOptionTemplate",
  auditTemplate,
);

export var sidePanelsAuditCommands = {
  auditOptionPanel: {
    commandName: "auditOptionPanel",
    enableContext: "AllowEditObject",
    visibleContext: "CData ",
    execute: function (context, propertyName) {
      var sheet = context.Spread.getActiveSheet();
    },
    getState: function (context) {
      let sheet = context.Spread.getActiveSheet();
      var column = sheet.getActiveColumnIndex();
      var row = sheet.getActiveRowIndex();
      var text1 = row === 0 && column === 0 ? "system1" : "";
      var text2 = row === 0 && column === 1 ? "system2" : "";

      const pictureStatus = {
        text1: text1,
        text2: text2,
      };
      console.debug(row);
      console.debug(column);
      console.debug(auditTemplate);
      return pictureStatus;
    },
  },
};

export var sidePanelsAuditConfig = {
  position: "right",
  width: "315px",
  command: "auditOptionPanel",
  uiTemplate: "auditOptionTemplate",
  showCloseButton: true,
};
