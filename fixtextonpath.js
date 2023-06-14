// (c) 2023 MapCreator BV, the Netherlands
// This script transforms all texts that were incorrectly imported from SVG into Illustrator
// This only works for SVG files coming out of mapcreator.io, because a tag 'fixtextpath' and the original geometry of that path is added to all text-items that are going to be imported incorrectly
//
// For each such a text-item, all textframe contents are gathered (in textFrameContents) as well as the geometry (in pathItem)
// from that, a new text-item is created as a text-on-path item

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
        if (subItem.typename == 'TextFrame') {
            textFrameContents = subItem.contents;
        } else {
            if (subItem.typename == 'GroupItem') {
                var total = '';
                for (var j = 0; j < subItem.textFrames.length; j++) {
                    total = subItem.textFrames[j].contents + total;
                }
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
            var nw = item.parent.textFrames.pathText(pathItem.duplicate(), 0, 0, TextOrientation.HORIZONTAL, templateFrames[i]);
        }
        item.remove();
    }
}