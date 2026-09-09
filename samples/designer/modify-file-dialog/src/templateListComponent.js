    import * as GC from "@grapecity-software/spread-sheets";
    
    function TemplateListComponent() {
        GC.Spread.Sheets.Designer.AtomicComponentBase.call(this, ...arguments)
    };
    TemplateListComponent.prototype = new GC.Spread.Sheets.Designer.AtomicComponentBase();
   
    // 此函数用于定义组件的innerHTML
    TemplateListComponent.prototype.getTemplate = function (template) {
        console.log(template)
        var innerHTML = "<div class=\"gc-file-menu-list-new gc-flexcontainer fileMenu-list\"><div class=\"new-sheet-temmplate-container OFL\">\n                <div class=\"template-thumb-icon " + "gc-template-thumb-blank" + "\"></div>\n                <label class=\"tempalte-thumb-text\">" + "日程表" + "</label>\n         </div>\n "
        
        + "      </div>\n        ";
        return innerHTML;
    }

        // 现在主机元素已经附加到DOM中，您可以向其中添加事件侦听器
    TemplateListComponent.prototype.onMounted = function (host) {
        host.onclick = (e) => {
            this._value = (e.target || e.srcElement).toString()
            this.raiseValueChanged()
        }
    }
    // TemplateListComponent.prototype.onValueChanged = function (prevValue, nextValue, host) {
    //     console.log(nextValue);
    // }

    TemplateListComponent.prototype.createTemplateItem = function (template) {
        var div = document.createElement("div");
        div.innerHTML = "\n            <div class=\"new-sheet-temmplate-container OFL\">\n                <div class=\"template-thumb-icon " + template.thumbClass + "\"></div>\n                <label class=\"tempalte-thumb-text\">" + resentry_1.res.blank + "</label>\n            </div>\n        ";
        return div;
    };
    export {TemplateListComponent}