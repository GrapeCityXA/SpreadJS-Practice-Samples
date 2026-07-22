const myTemplate = {
  version: "13.0.2",
  customList: [],
  sheetCount: 2,
  sheets: {
    Sheet1: {
      name: "Sheet1",
      rowCount: 201,
      activeRow: 7,
      activeCol: 3,
      theme: "Office",
      data: {
        dataTable: {
          1: {
            1: { style: { hAlign: 1 }, bindingPath: "textField_02" },
            2: {
              style: { hAlign: 1 },
              bindingPath: "textField_01.subField_01",
            },
          },
          2: {
            2: {
              style: { hAlign: 1 },
              bindingPath: "textField_01.subField_02",
            },
          },
          3: {
            1: { value: "我的表格列_1" },
            2: { value: "我的表格列_2" },
            3: { value: "合计列" },
          },
          4: {
            3: {
              value: 0,
              style: { hAlign: 3, vAlign: 0, themeFont: "Body", imeMode: 1 },
              formula:
                "gcTable0[[#This Row], [我的表格列_1]]+gcTable0[[#This Row], [我的表格列_2]]",
            },
          },
          5: {
            1: {
              style: { hAlign: 3, vAlign: 0, themeFont: "Body", imeMode: 1 },
            },
            2: {
              style: { hAlign: 3, vAlign: 0, themeFont: "Body", imeMode: 1 },
            },
            3: {
              value: 0,
              style: { hAlign: 3, vAlign: 0, themeFont: "Body", imeMode: 1 },
              formula:
                "gcTable0[[#This Row], [我的表格列_1]]+gcTable0[[#This Row], [我的表格列_2]]",
            },
          },
          6: {
            1: {
              value: "汇总",
              style: { hAlign: 3, vAlign: 0, themeFont: "Body", imeMode: 1 },
            },
            2: {
              style: { hAlign: 3, vAlign: 0, themeFont: "Body", imeMode: 1 },
            },
            3: {
              value: 0,
              style: { hAlign: 3, vAlign: 0, themeFont: "Body", imeMode: 1 },
              formula: "SUBTOTAL(109,gcTable0[合计列])",
            },
          },
        },
        defaultDataNode: { style: { themeFont: "Body" } },
      },
      rowHeaderData: { defaultDataNode: { style: { themeFont: "Body" } } },
      colHeaderData: { defaultDataNode: { style: { themeFont: "Body" } } },
      columns: [null, { size: 107 }, { size: 116 }, { size: 136 }],
      leftCellIndex: 0,
      topCellIndex: 0,
      spans: [
        { row: 1, rowCount: 1, col: 2, colCount: 2 },
        { row: 2, rowCount: 1, col: 2, colCount: 2 },
        { row: 1, rowCount: 2, col: 1, colCount: 1 },
      ],
      selections: {
        0: { row: 7, rowCount: 1, col: 3, colCount: 1 },
        length: 1,
      },
      cellStates: {},
      outlineColumnOptions: {},
      autoMergeRangeInfos: [],
      printInfo: { paperSize: { width: 850, height: 1100, kind: 1 } },
      tables: [
        {
          name: "gcTable0",
          row: 3,
          col: 1,
          rowCount: 4,
          colCount: 3,
          showFooter: true,
          useFooterDropDownList: true,
          style: { buildInName: "Medium2" },
          autoGenerateColumns: false,
          bindingPath: "table_01",
          rowFilter: {
            range: { row: 4, rowCount: 2, col: 1, colCount: 3 },
            typeName: "HideRowFilter",
            dialogVisibleInfo: {},
            filterButtonVisibleInfo: { 0: true, 1: true, 2: true },
            showFilterButton: true,
          },
          columns: [
            {
              id: -1,
              name: "我的表格列_1",
              dataField: "tField_01",
              footerValue: "汇总",
            },
            { id: 1, name: "我的表格列_2", dataField: "tField_02" },
            {
              id: 2,
              name: "合计列",
              footerFormula: "SUBTOTAL(109,gcTable0[合计列])",
              dataAreaFormula:
                "gcTable0[[#This Row], [我的表格列_1]]+gcTable0[[#This Row], [我的表格列_2]]",
            },
          ],
        },
      ],
      index: 0,
    },
    Sheet2: {
      name: "Sheet2",
      theme: "Office",
      data: { dataTable: {} },
      rowHeaderData: {},
      colHeaderData: {},
      leftCellIndex: 0,
      topCellIndex: 0,
      selections: {
        0: { row: 0, rowCount: 1, col: 0, colCount: 1 },
        length: 1,
      },
      cellStates: {},
      outlineColumnOptions: {},
      autoMergeRangeInfos: [],
      index: 1,
    },
  },
  designerBindingPathSchema: {
    $schema: "http://json-schema.org/draft-04/schema#",
    properties: {
      table_01: {
        dataFieldType: "table",
        type: "array",
        items: {
          type: "object",
          properties: {
            tField_01: { type: "string" },
            tField_02: { type: "string" },
          },
        },
      },
      textField_01: {
        dataFieldType: "text",
        type: "string",
        properties: {
          subField_01: { dataFieldType: "text", type: "string" },
          subField_02: { dataFieldType: "text", type: "string" },
        },
      },
      textField_02: { dataFieldType: "text", type: "string" },
    },
    type: "object",
  },
};

export { myTemplate };
