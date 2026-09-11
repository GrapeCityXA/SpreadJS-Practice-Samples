# preset-toolbarmode-context-menu-priority

### 需求：如何在小屏幕中优先显示必要的工具栏按钮

***

#### 背景：

ToolbarMode是为了兼容一些小屏设备推出的新的设计器公式栏。在小屏的设备上即使用了设计器，上方的工具栏也不会占用太多的地方。那么当屏幕相对较窄时，工具栏上的按钮如何按照预设的优先级去显示和隐藏？

#### 解决方案：

在SpreadJS14.2中,在命令里新增了visiblePriority这个属性，用于设置在ToolBarMode下命令显示的优先级。我们把GC.Spread.Sheets.Designer.ToolBarModeConfig打出来看下，找到ribbon下的命令，可以看到，命令中都有这个属性。一般情况下visiblePriority的范围在1-10之间，数值越小，优先级越低，反之则越高。
设置这个属性即可对各个按钮预设你需要的显示优先级：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.d0e196.png?width=400)
除此之外，工具栏上面的三个点就是overflow属性控制。当ButtonGroup下的按钮放不下时，也就是priority不够高时，会被挤到这个overflow的下拉框里面。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.ec06e2.png)
可以看下下面的demo，当我们改变窗口的大小时，ribbon上面的command会根据priority的大小调整进行调整，决定是否移动到后面的overflow的下拉菜单里面。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.465804.png)
像这些属于buttonGroupName，当完全展示时这些就不会显示。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.712ec3.png)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
