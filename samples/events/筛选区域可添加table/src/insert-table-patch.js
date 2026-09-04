import * as GC from "@grapecity-software/spread-sheets";

/**
 * 修改设计器的 insertTable 命令，让筛选区域也可以插入表格：
 *
 * 1. 移除 enableContext 中对 filterSelected 的检查（保留 AllowInsertTable），
 *    使“插入表格”按钮在存在筛选的区域上可用；
 * 2. 重写 execute：在打开“插入表格”对话框时，用 MutationObserver 监听
 *    对话框出现，并在用户点击“确定”时移除区域上的筛选器，避免插入
 *    表格后与筛选器冲突。
 *
 * @returns {Object|null} 修改后的 insertTable 命令；找不到命令时返回 null
 */
export function patchInsertTableCommand() {
  const insertTableCommand = GC.Spread.Sheets.Designer.getCommand(
    "insertTable",
  );
  if (!insertTableCommand) {
    return null;
  }

  // 保存原始的 execute 方法
  const originalExecute = insertTableCommand.execute;

  // 重写 execute 方法，监听对话框的确定按钮
  insertTableCommand.execute = async function (
    context,
    propertyName,
    args,
  ) {
    const sheet = context.Spread.getActiveSheet();
    const hasFilter = !!sheet.rowFilter();

    // 如果有 filter，设置监听器在用户点击确定时移除
    if (hasFilter) {
      // 使用 MutationObserver 监听对话框出现
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // 查找对话框确定按钮
              const dialog = node.classList?.contains("gc-designer-dialog")
                ? node
                : node.querySelector?.(".gc-designer-dialog");
              if (dialog) {
                const okButton = dialog.querySelector(
                  ".gc-designer-dialog-button.gc-designer-dialog-button-primary",
                );
                if (okButton && !okButton.dataset.filterHandled) {
                  okButton.dataset.filterHandled = "true";
                  okButton.addEventListener(
                    "click",
                    function () {
                      // 用户点击确定按钮时，移除 filter
                      if (sheet.rowFilter()) {
                        sheet.rowFilter(null);
                      }
                    },
                    { once: true },
                  );
                  observer.disconnect();
                }
              }
            }
          });
        });
      });

      // 开始观察 DOM 变化
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // 设置超时自动断开（防止内存泄漏）
      setTimeout(function () {
        observer.disconnect();
      }, 10000);
    }

    // 执行原始的创建 table 逻辑（打开对话框）
    return originalExecute.call(this, context, propertyName, args);
  };

  // 修改 enableContext，移除对 filterSelected 的检查（保留 AllowInsertTable）
  insertTableCommand.enableContext =
    "AllowInsertTable && !IsActualProtected && !ChartSelected && !ShapeSelected && !FloatingObjectSelected && !pictureSelected && !SlicerSelected && !SelectedOrEditComments";

  return insertTableCommand;
}
