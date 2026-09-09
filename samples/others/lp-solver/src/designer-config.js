import * as GC from "@grapecity-software/spread-sheets";
import { operateRibbon, operateCommands } from "./operate.js";
import { richSheetTagTemplate } from "./solver-dialog.js";

/**
 * 导出 designerConfig（原 config.js）：
 * 在默认配置基础上，新增“操作”选项卡（规划求解按钮），并注册规划求解对话框模板。
 */
const designerConfig = JSON.parse(
  JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig),
);

// 将命令注册到 config 的 commandMap 属性上
designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, operateCommands);

// 将新增选项卡添加到 designerConfig 中
designerConfig.ribbon.push(operateRibbon);

// 注册模板（必须在创建 Designer 实例之前）
GC.Spread.Sheets.Designer.registerTemplate("newTab", richSheetTagTemplate);

export { designerConfig };
