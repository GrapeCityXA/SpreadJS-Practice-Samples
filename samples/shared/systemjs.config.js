(function (global) {
  var demoBaseURL = global.location.href
    .replace(/[?#].*$/, "")
    .replace(/\/[^/]*$/, "/");

  System.config({
    transpiler: "plugin-typescript",
    typescriptOptions: {
      target: "es5",
      module: "system",
      jsx: "react",
    },
    baseURL: demoBaseURL,
    meta: {
      typescript: {
        exports: "ts",
      },
    },
    map: {
      typescript: "node_modules/typescript/lib/typescript.js",
      "plugin-typescript": "node_modules/plugin-typescript/lib/plugin.js",
      "@grapecity-software/spread-sheets":
        "node_modules/@grapecity-software/spread-sheets/dist/gc.spread.sheets.all.min.js",
      "@grapecity-software/spread-excelio":
        "node_modules/@grapecity-software/spread-excelio/dist/gc.spread.excelio.min.js",
      "@grapecity-software/spread-sheets-charts":
        "node_modules/@grapecity-software/spread-sheets-charts/dist/gc.spread.sheets.charts.min.js",
      "@grapecity-software/spread-sheets-print":
        "node_modules/@grapecity-software/spread-sheets-print/dist/gc.spread.sheets.print.min.js",
      "@grapecity-software/spread-sheets-resources-zh":
        "node_modules/@grapecity-software/spread-sheets-resources-zh/dist/gc.spread.sheets.resources.zh.min.js",
      "@grapecity-software/spread-sheets-resources-ja":
        "node_modules/@grapecity-software/spread-sheets-resources-ja/dist/gc.spread.sheets.resources.ja.min.js",
      "@grapecity-software/spread-sheets-resources-ko":
        "node_modules/@grapecity-software/spread-sheets-resources-ko/dist/gc.spread.sheets.resources.ko.min.js",
      "@grapecity-software/spread-sheets-pdf":
        "node_modules/@grapecity-software/spread-sheets-pdf/dist/gc.spread.sheets.pdf.min.js",
      "@grapecity-software/spread-sheets-barcode":
        "node_modules/@grapecity-software/spread-sheets-barcode/dist/gc.spread.sheets.barcode.min.js",
      "@grapecity-software/spread-sheets-languagepackages":
        "node_modules/@grapecity-software/spread-sheets-languagepackages/dist/gc.spread.calcengine.languagepackages.min.js",
      "@grapecity-software/spread-sheets-shapes":
        "node_modules/@grapecity-software/spread-sheets-shapes/dist/gc.spread.sheets.shapes.min.js",
      "@grapecity-software/spread-sheets-designer":
        "node_modules/@grapecity-software/spread-sheets-designer/dist/gc.spread.sheets.designer.all.min.js",
      "@grapecity-software/spread-sheets-designer-resources-cn":
        "node_modules/@grapecity-software/spread-sheets-designer-resources-cn/dist/gc.spread.sheets.designer.resource.cn.min.js",
      "@grapecity-software/spread-sheets-designer-resources-en":
        "node_modules/@grapecity-software/spread-sheets-designer-resources-en/dist/gc.spread.sheets.designer.resource.en.min.js",
      "@grapecity-software/spread-sheets-designer-resources-ja":
        "node_modules/@grapecity-software/spread-sheets-designer-resources-ja/dist/gc.spread.sheets.designer.resource.ja.min.js",
      "@grapecity-software/spread-sheets-designer-resources-ko":
        "node_modules/@grapecity-software/spread-sheets-designer-resources-ko/dist/gc.spread.sheets.designer.resource.ko.min.js",
      "@grapecity-software/spread-sheets-designer-vue":
        "node_modules/@grapecity-software/spread-sheets-designer-vue/dist/gc.spread.sheets.designer.vue.min.js",
      "@grapecity-software/spread-sheets-vue":
        "node_modules/@grapecity-software/spread-sheets-vue/dist/gc.spread.sheets.vue.min.js",
      "@grapecity-software/spread-sheets-pivot-addon":
        "node_modules/@grapecity-software/spread-sheets-pivot-addon/dist/gc.spread.pivot.pivottables.min.js",
      "@grapecity-software/spread-sheets-tablesheet":
        "node_modules/@grapecity-software/spread-sheets-tablesheet/dist/gc.spread.sheets.tablesheet.min.js",
      "@grapecity-software/spread-sheets-slicers":
        "node_modules/@grapecity-software/spread-sheets-slicers/dist/gc.spread.sheets.slicers.min.js",
      "@grapecity-software/spread-sheets-io":
        "node_modules/@grapecity-software/spread-sheets-io/dist/gc.spread.sheets.io.min.js",
      "@grapecity-software/spread-sheets-formula-panel":
        "node_modules/@grapecity-software/spread-sheets-formula-panel/dist/gc.spread.sheets.formulapanel.min.js",
      "@grapecity-software/spread-sheets-ganttsheet":
        "node_modules/@grapecity-software/spread-sheets-ganttsheet/dist/gc.spread.sheets.ganttsheet.min.js",
      "@grapecity-software/spread-sheets-reportsheet-addon":
        "node_modules/@grapecity-software/spread-sheets-reportsheet-addon/dist/gc.spread.report.reportsheet.min.js",
      "@grapecity-software/spread-sheets-datacharts-addon":
        "node_modules/@grapecity-software/spread-sheets-datacharts-addon/dist/gc.spread.sheets.datacharts.min.js",
      "@grapecity-software/spread-sheets-ai-addon":
        "node_modules/@grapecity-software/spread-sheets-ai-addon/dist/gc.spread.sheets.ai.min.js",
      "@grapecity-software/spread-sheets-calc-worker":
        "node_modules/@grapecity-software/spread-sheets-calc-worker/dist/gc.spread.sheets.calcworker.min.js",
    },
    packages: {
      "./src": {
        defaultExtension: "js",
      },
    },
  });
})(this);
