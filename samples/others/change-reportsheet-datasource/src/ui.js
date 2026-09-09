// 本文件集中处理与 HTML 页面相关的代码：DOM 引用、状态展示与事件绑定。

const changeButton = document.getElementById("changeButton");
const statusNode = document.getElementById("status");

/**
 * 更新状态栏文本。
 * @param {string} message - 状态消息
 * @param {string} [tone] - 状态类型（success / error / 空）
 */
export function setStatus(message, tone = "") {
  statusNode.textContent = message;
  statusNode.dataset.tone = tone;
}

/**
 * 绑定“更换数据源”按钮点击事件。
 * 点击后按钮进入禁用状态，等待 handler 完成后恢复。
 * @param {() => Promise<void>} handler - 数据源更换处理函数
 */
export function bindChangeSource(handler) {
  changeButton.addEventListener("click", async () => {
    changeButton.disabled = true;
    try {
      await handler();
    } finally {
      changeButton.disabled = false;
    }
  });
}
