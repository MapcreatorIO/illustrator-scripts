// (c) 2019 MapCreator BV, the Netherlands
{
    var items = app.activeDocument.groupItems;
    for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].name.indexOf('fixtextpath') == 0)
            FixPath(items[i]);
    }
}

function FixPath(item) {
    var pathItem = null;
    var total = '';
    var templateFrame = null;
    for (var i = 0; i < item.pageItems.length; i++) {
        var subItem = item.pageItems[i];
        if (subItem.typename == 'TextFrame') {
            total = subItem.contents + total;
            templateFrame = subItem;
        } else {
            if (subItem.typename == 'GroupItem') {
                for (var j = 0; j < subItem.textFrames.length; j++) {
                    if (templateFrame == null)
                        templateFrame = subItem.textFrames[j];
                    total = subItem.textFrames[j].contents + total;
                }
                if (subItem.pathItems.length > 0)
                    pathItem = subItem.pathItems[0];
            }
        }
    }

    if (pathItem != null && total != '' && templateFrame != null) {
        if (item.parent.typename == 'GroupItem') {
            templateFrame.contents = total;
            var nw = item.parent.textFrames.pathText(pathItem, 0, 0, TextOrientation.HORIZONTAL, templateFrame);
            item.remove();
        }
    }
}