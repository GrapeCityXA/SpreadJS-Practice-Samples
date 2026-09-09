/**
 * 规划求解对话框的 UI 模板（原 operate.js 中的 CreateId / richSheetTagTemplate）。
 * 这是设计器对话框的声明式界面配置，与业务逻辑（operate.js）分离，便于阅读。
 */

// 对话框内容：目标单元格、可变因素、约束条件等控件布局
const CreateId = {
  type: "FlexContainer",
  margin: "10px",
  children: [
    {
      type: "FlexContainer",
      children: [
        {
          type: "TextBlock",
          text: "设置目标：",
          margin: "5px",
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "target1",
              style: "width: 300px",
              margin: "5px 15px",
            },
          ],
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "target2",
              style: "width: 300px",
              margin: "5px 15px",
            },
          ],
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "TextBlock",
              text: "到",
              margin: "5px",
            },
            {
              type: "ColumnSet",
              children: [
                {
                  type: "Radio",
                  bindingPath: "radioValue",
                  columnCount: 2,
                  margin: "5px",
                  items: [
                    {
                      text: "最大值",
                      value: "max",
                    },
                    {
                      text: "最小值",
                      value: "min",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "TextBlock",
          text: "可变因素:",
          margin: "5px",
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "optimalQuantity1",
              style: "width: 120px",
              margin: "5px 15px",
            },
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "person1",
              style: "width: 120px",
              margin: "5px",
            },
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "cost1",
              style: "width: 120px",
              margin: "5px",
            },
          ],
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "optimalQuantity2",
              style: "width: 120px",
              margin: "5px 15px",
            },
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "person2",
              style: "width: 120px",
              margin: "5px",
            },
            {
              type: "RangeSelect",
              needSheetName: false,
              absoluteReference: true,
              bindingPath: "cost2",
              style: "width: 120px",
              margin: "5px",
            },
          ],
        },
        {
          type: "TextBlock",
          text: "约束条件：",
          margin: "5px",
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "TextBlock",
              text: "总数量",
              style: "width: 50px",
              margin: "5px 15px",
            },
            {
              type: "ListComboEditor",
              bindingPath: "compare1",
              style: "width: 120px",
              margin: "5px",
              items: [
                { text: "<=", value: "max" },
                { text: ">=", value: "min" },
                { text: "=", value: "equal" },
              ],
            },
            {
              type: "TextEditor",
              bindingPath: "quantityNumber",
              style: "width: 120px",
              margin: "5px",
            },
          ],
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "TextBlock",
              text: "总人数",
              style: "width: 50px",
              margin: "5px 15px",
            },
            {
              type: "ListComboEditor",
              bindingPath: "compare2",
              style: "width: 120px",
              margin: "5px",
              items: [
                { text: "<=", value: "max" },
                { text: ">=", value: "min" },
                { text: "=", value: "equal" },
              ],
            },
            {
              type: "TextEditor",
              bindingPath: "personNumber",
              style: "width: 120px",
              margin: "5px",
            },
          ],
        },
        {
          type: "ColumnSet",
          children: [
            {
              type: "TextBlock",
              text: "总费用",
              style: "width: 50px",
              margin: "5px 15px",
            },
            {
              type: "ListComboEditor",
              bindingPath: "compare3",
              style: "width: 120px",
              margin: "5px",
              items: [
                { text: "<=", value: "max" },
                { text: ">=", value: "min" },
                { text: "=", value: "equal" },
              ],
            },
            {
              type: "TextEditor",
              bindingPath: "costNumber",
              style: "width: 120px",
              margin: "5px",
            },
          ],
        },
      ],
    },
  ],
};

// 规划求解对话框模板
const richSheetTagTemplate = {
  title: "规划求解",
  content: [
    {
      type: "TabControl",
      width: 500,
      height: 500,
      bindingPath: "dialogOption",
      children: [
        {
          key: "solverTab",
          text: "规划求解",
          children: [CreateId],
        },
      ],
    },
  ],
};

export { richSheetTagTemplate };
