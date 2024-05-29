// (c) 2024 MapCreator BV, the Netherlands

{
    var items = app.activeDocument.groupItems;
    for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].name.indexOf('fixtextpath') == 0)
            FixPath(items[i]);
    }
    alert('Ready');
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}
function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}
function mult(a, k) {
    return [a[0] * k, a[1] * k];
}
function unit(p) {
    var mag = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
    return [p[0] / mag, p[1] / mag];
}
function sup(a, b) {
    var r = unit(sub(a, b));
    return [-r[1], r[0]];
}

function offsetLine(line, offset) {
    var zero = [0, 0];
    var newLine = [];
    for (var i = 0; i < line.length; i++) {
        var b = line[i].anchor;
        var aToB = i === 0 ? zero : sup(b, line[i - 1].anchor);
        var bToC = i === line.length - 1 ? zero : sup(line[i + 1].anchor, b);
        var extrude = add(aToB, bToC);
        extrude = unit(extrude);
        var cosHalfAngle = extrude[0] * bToC[0] + extrude[1] * bToC[1];
        if (cosHalfAngle !== 0) {
            extrude = mult(extrude, 1 / cosHalfAngle);
        }
        var newP = add(mult(extrude, offset), b);
        newLine.push(newP);
    }
    return newLine;
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
        var newGeo = offsetLine(pathItem.pathPoints, -templateFrames[0].textRange.characterAttributes.size * 0.4 / 2);
        pathItem.setEntirePath(newGeo);
        for (var i = templateFrames.length-1; i>=0; i--) {
            var nw = item.parent.textFrames.pathText(pathItem.duplicate(), 0, 0, TextOrientation.HORIZONTAL, templateFrames[i]);
        }
        item.remove();
    }
}