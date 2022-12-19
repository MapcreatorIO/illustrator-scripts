// (c) 2022 MapCreator BV, the Netherlands
{
    var items = app.activeDocument.groupItems;
    for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].name.indexOf('fixtextpath') == 0)
            FixPath(items[i]);
    }
}

function FixPath(item) {
    var pathItem = null;
    var totals = [];
    var textFrameContents = '';
    var templateFrames = [];
    for (var i = 0; i < item.pageItems.length; i++) {
        var subItem = item.pageItems[i];
//alert('sub '+subItem.typename+' '+i);
        if (subItem.typename == 'TextFrame') {
            textFrameContents = subItem.contents;
        } else {
            if (subItem.typename == 'GroupItem') {
                var total = '';
                for (var j = 0; j < subItem.textFrames.length; j++) {
    //alert('group '+i+' subitem '+j);
                        //alert('tf contents:'+templateFrame.contents);
                    total = subItem.textFrames[j].contents + total;
                }
                //alert(total);
                if (subItem.textFrames.length > 0) {
                  subItem.textFrames[0].contents = total + textFrameContents;
                  var p=subItem.textFrames[0].paragraphs[0].paragraphAttributes;
                  p.justification =  Justification.CENTER;
                  templateFrames.push(subItem.textFrames[0]);
                }
                if (subItem.pathItems.length > 0)
                    pathItem = subItem.pathItems[0];
            }
        }
    }
    if (pathItem != null && item.parent.typename == 'GroupItem' && templateFrames.length > 0) {
        for (var i = templateFrames.length-1; i>=0; i--) {
            //templateFrame.contents = total;
            //var nw = item.parent.textFrames.pathText(pathItem, 0, 0, TextOrientation.HORIZONTAL, templateFrames[i]);
            var nw = item.parent.textFrames.pathText(pathItem.duplicate(), 0, 0, TextOrientation.HORIZONTAL, templateFrames[i]);
        }
        item.remove();
    }
}