/**
 * 更换报表的数据源：
 * 获取数据管理器中的“表1”，把数据源从远程替换为本地数据（new_data），
 * 重新加载数据后重新生成报表。
 *
 * 数据源切换的机制：
 * 1. 读取表的 options，删除 remote（远程）配置；
 * 2. 写入 data（本地）配置并重新赋值给表；
 * 3. 调用 table.fetch(true) 强制按新配置重新加载数据；
 * 4. 加载完成后重新生成报表，并切回预览模式刷新显示。
 *
 * @param {GC.Spread.Sheets.Workbook} spread - 工作簿对象
 * @param {GC.Data.DataManager} dataManager - 数据管理器对象
 * @param {Object[]} new_data - 新的本地数据
 * @returns {Promise<void>} 数据源更换完成后的 Promise
 */
export function updateReport(spread, dataManager, new_data) {
  let table = dataManager.tables["表1"];
  let options = table.options;
  delete options.remote;
  options.data = new_data;
  table.options = options;
  return table.fetch(true).then(function () {
    let sheet = spread.getActiveSheetTab();
    sheet.regenerateReport();
    sheet.renderMode("Preview");
    sheet.refresh();
  });
}
