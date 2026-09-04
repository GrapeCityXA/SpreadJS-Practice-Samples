import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-datacharts-addon";
import "@grapecity-software/spread-sheets-slicers";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-ganttsheet";
import "@grapecity-software/spread-sheets-reportsheet-addon";
import "@grapecity-software/spread-sheets-formula-panel";
import "@grapecity-software/spread-sheets-io";
import "@grapecity-software/spread-sheets-resources-zh";

import { updateReport } from "./update-report.js";
import { datasetA, datasetB, reportColumns } from "./report-data.js";
import { setStatus, bindChangeSource } from "./ui.js";

const TABLE_NAME = "表1";
const REPORT_NAME = "销售报表";

// 工作簿与数据管理器
const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const dataManager = spread.dataManager();

// 初始配置为“远程”数据源（用函数模拟，保证静态页可离线运行），
// 用于演示 updateReport 中“删除 remote、写入 data”的切换过程。
const table = dataManager.addTable(TABLE_NAME, {
    remote: {
        read: () => Promise.resolve(datasetA),
    },
});

/**
 * 创建报表工作表并构建模板。
 */
function createReportSheet() {
    const reportSheet = spread.addSheetTab(
        0,
        REPORT_NAME,
        GC.Spread.Sheets.SheetType.reportSheet,
    );
    reportSheet.renderMode("Design");
    const templateSheet = reportSheet.getTemplate();

    // 构建模板：第 0 行表头，第 1 行列表绑定
    reportColumns.forEach((column, i) => {
        templateSheet.setColumnWidth(i, column.width);
        templateSheet.setValue(0, i, column.header);
        templateSheet.setTemplateCell(1, i, {
            type: "List",
            binding: `${TABLE_NAME}[${column.field}]`,
        });
    });

    // 模板样式：表头底色，数据行边框
    const headerStyle = new GC.Spread.Sheets.Style();
    headerStyle.backColor = "#80CBC4";
    headerStyle.foreColor = "#424242";
    headerStyle.font = "bold 12px 微软雅黑";
    const dataStyle = new GC.Spread.Sheets.Style();
    dataStyle.foreColor = "#424242";
    dataStyle.font = "12px 微软雅黑";
    templateSheet.getRange(0, 0, 1, reportColumns.length).setStyle(headerStyle);
    templateSheet.getRange(1, 0, 1, reportColumns.length).setStyle(dataStyle);

    // 刷新报表并切换至预览模式
    reportSheet.refresh();
    reportSheet.renderMode("Preview");
    return reportSheet;
}

/**
 * 初始化：加载初始数据 → 创建报表 → 激活报表工作表。
 */
async function init() {
    setStatus("正在加载初始数据…");
    await table.fetch();

    createReportSheet();
    spread.setActiveSheetTab(REPORT_NAME);

    setStatus("报表已加载（远程数据源）。点击“更换数据源”切换到本地数据。");
}

init();

let cur_data = "A"
// 更换数据源：把数据管理器中的“表1”替换为本地数据并重新生成报表
bindChangeSource(async () => {
    setStatus("正在更换数据源…");
    if (cur_data == "A") {
        await updateReport(spread, dataManager, datasetB);
        cur_data = "B"
    } else {
        await updateReport(spread, dataManager, datasetA);
        cur_data = "A"
    }
    setStatus("数据源已更换为本地数据，报表已重新生成。", "success");
});
