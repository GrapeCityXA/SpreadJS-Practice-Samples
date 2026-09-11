# add-context-menu-designer

### 问题：在线表格编辑器部分行选时显示特定右键菜单项

***

#### 背景：

用户在填写文件时，大部分行列都已经确定，只需要按照提示填写即可。但部分行列，允许添加同级别下的行，做数据扩展。这就要求用户在点击部分行头时，可以正常添加行。
本文会讲解该需求的实现方式。

#### 思路：

自定义设计器右键菜单，注册自定义添加行命令，当用户点击行头，且行头索引为1（选中第二行）时，不显示自定义添加行菜单项。
而选中其它区域时，右键菜单则会正常显示自定义菜单项。同时，根据自己的需求，可选择是否需要去掉原有的删除行功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
