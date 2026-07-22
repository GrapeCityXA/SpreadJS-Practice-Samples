(function (global) {
  System.config({
    transpiler: "plugin-typescript",
    typescriptOptions: {
      target: "es5",
      module: "system",
      jsx: "react",
    },
    baseURL: "./",
    meta: {
      typescript: {
        exports: "ts",
      },
    },
    map: {
      typescript: "node_modules/typescript/lib/typescript.js",
      "plugin-typescript": "node_modules/plugin-typescript/lib/plugin.js",
      "@grapecity-software/spread-sheets":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets/dist/gc.spread.sheets.all.min.js",
      "@grapecity-software/spread-excelio":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-excelio/dist/gc.spread.excelio.min.js",
      "@grapecity-software/spread-sheets-charts":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-charts/dist/gc.spread.sheets.charts.min.js",
      "@grapecity-software/spread-sheets-print":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-print/dist/gc.spread.sheets.print.min.js",
      "@grapecity-software/spread-sheets-resources-zh":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-resources-zh/dist/gc.spread.sheets.resources.zh.min.js",
      "@grapecity-software/spread-sheets-resources-ja":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-resources-ja/dist/gc.spread.sheets.resources.ja.min.js",
      "@grapecity-software/spread-sheets-resources-ko":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-resources-ko/dist/gc.spread.sheets.resources.ko.min.js",
      "@grapecity-software/spread-sheets-pdf":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-pdf/dist/gc.spread.sheets.pdf.min.js",
      "@grapecity-software/spread-sheets-barcode":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-barcode/dist/gc.spread.sheets.barcode.min.js",
      "@grapecity-software/spread-sheets-languagepackages":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-languagepackages/dist/gc.spread.calcengine.languagepackages.min.js",
      "@grapecity-software/spread-sheets-shapes":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-shapes/dist/gc.spread.sheets.shapes.min.js",
      "@grapecity-software/spread-sheets-designer":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-designer/dist/gc.spread.sheets.designer.all.min.js",
      "@grapecity-software/spread-sheets-designer-resources-cn":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-designer-resources-cn/dist/gc.spread.sheets.designer.resource.cn.min.js",
      "@grapecity-software/spread-sheets-designer-resources-en":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-designer-resources-en/dist/gc.spread.sheets.designer.resource.en.min.js",
      "@grapecity-software/spread-sheets-designer-resources-ja":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-designer-resources-ja/dist/gc.spread.sheets.designer.resource.ja.min.js",
      "@grapecity-software/spread-sheets-designer-resources-ko":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-designer-resources-ko/dist/gc.spread.sheets.designer.resource.ko.min.js",
      "@grapecity-software/spread-sheets-designer-vue":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-designer-vue/dist/gc.spread.sheets.designer.vue.min.js",
      "@grapecity-software/spread-sheets-vue":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-vue/dist/gc.spread.sheets.vue.min.js",
      // pivot V14.0 新增
      "@grapecity-software/spread-sheets-pivot-addon":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-pivot-addon/dist/gc.spread.pivot.pivottables.min.js",
      // tablesheet V14.1 新增
      "@grapecity-software/spread-sheets-tablesheet":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-tablesheet/dist/gc.spread.sheets.tablesheet.min.js",
      // slicers V15.2 新增
      "@grapecity-software/spread-sheets-slicers":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-slicers/dist/gc.spread.sheets.slicers.min.js",
      // io V16.0 新增
      "@grapecity-software/spread-sheets-io":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-io/dist/gc.spread.sheets.io.min.js",
      // formula-panel V16.0 新增
      "@grapecity-software/spread-sheets-formula-panel":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-formula-panel/dist/gc.spread.sheets.formulapanel.min.js",
      // ganttsheet V16.2 新增
      "@grapecity-software/spread-sheets-ganttsheet":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-ganttsheet/dist/gc.spread.sheets.ganttsheet.min.js",
      // reportsheet V17.0 新增
      "@grapecity-software/spread-sheets-reportsheet-addon":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-reportsheet-addon/dist/gc.spread.report.reportsheet.min.js",
      // datacharts V18.0 新增
      "@grapecity-software/spread-sheets-datacharts-addon":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-datacharts-addon/dist/gc.spread.sheets.datacharts.min.js",
      //  ai V18.1 新增
      "@grapecity-software/spread-sheets-ai-addon":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-ai-addon/dist/gc.spread.sheets.ai.min.js",
      //  calc-worker V19.0 新增
      "@grapecity-software/spread-sheets-calc-worker":
        "https://cdn.grapecity.com.cn/SpreadJS/package-contents/19.0.3/spread-sheets-calc-worker/dist/gc.spread.sheets.calcworker.min.js",
    },
    packages: {
      "./src": {
        defaultExtension: "js",
      },
    },
  });
})(this);
