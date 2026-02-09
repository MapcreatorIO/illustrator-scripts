// (c) 2026 MapCreator BV, the Netherlands

var defaultColorMappings=
  [
    //list of colors to replace. 
    //  format of rgbin is "<R> <G> <B>" with R,G,B as whole numbers from 0..255
    //  format of cmykin is "<C> <M> <Y> <K>" with C,M,Y,K as fractional numbers rounded to 2 decimal places, incl trailing zeros from 0..100
    //  format of cmykout is "<C> <M> <Y> <K>" with C,M,Y,K as fractional numbers from 0..1
    //samples:
    //{rgbin:"214 250 217", cmykout:"1 0 0 0"},
    //{rgbin:"255 255 255", cmykout:"1 0 0 0"},
    //{cmykin:"14.12 0.00 12.94 1.96", cmykout:"0 0 1 0"}
  ]

var defaultFontMappings=
  [
    //list of fonts to replace. 
    //sample:
    //{fontIn:{family:'Helvetica Neue LT Std',style:'55 Roman'},fontOut:{family:'Symbol',style:'Regular'}}
  ]

// Configuration:
// set convertColors to true for enabling colorconversion
// set fixTextOnPath to true for enabling textOnPath fixups
// add fonts to defaultFontMappings to enable fontreplacement

var convertColors = false;
var fixTextOnPath = false;

{
    if (convertColors) {
      //Convert colors to cmyk

      var items = app.activeDocument.pageItems;
      for (var i = 0; i < items.length; i++) {
          AddNote(items[i]);
      }

      app.executeMenuCommand('doc-color-cmyk');

      var items = app.activeDocument.pageItems;
      for (var i = 0; i < items.length; i++) {
         ParseNote(items[i],defaultColorMappings);
      }
    }
    if (fixTextOnPath) {
      //Fix text on path

      var items = app.activeDocument.groupItems;
      for (var i = items.length - 1; i >= 0; i--) {
          if (items[i].name.indexOf('fixtextpath') == 0)
              FixPath(items[i]);
      }
    }

    if (defaultFontMappings.length > 0 ) {
      //Replace fonts
      var items = app.activeDocument.textFrames;
      for (var i = items.length - 1; i >= 0; i--) {
            ReplaceFont(items[i]);
      }
    }

    alert('Ready');
}

function AddNote(item) {
  try {
    item.note=onecol(item.textRange.characterAttributes.fillColor)+'|'+onecol(item.textRange.characterAttributes.strokeColor);
  }catch(e){};
  try {
    var f=onecol(item.fillColor);
    if (!item.filled)
      f="none";
    var s=onecol(item.strokeColor);
    if (!item.stroked)
      s="none";
    item.note=f+'|'+s;
  }catch(e){};
}

function ParseNote(item,defaultColorMappings) {
  if (item.note!="")
  {
    var colors=ParseOne(item.note,defaultColorMappings);
    if (item.textRange!=null)
    {
      try {
        item.textRange.characterAttributes.fillColor=colors.fill;
        item.textRange.characterAttributes.strokeColor=colors.stroke;
        item.note="";
      }catch(e){};
    }
    else
    {
      try {
        if (item.filled)
          item.fillColor=colors.fill;
        if (item.stroked)
          item.strokeColor=colors.stroke;
        item.note="";
      }catch(e){}
    }
  }
}

function onecol(col) {
  if (col.toString()=="[NoColor]")
    return "none";
  else
    if (col.toString()=="[GrayColor]")
      return ''+col.gray*2.55+' '+col.gray*2.55+' '+col.gray*2.55;
    else
      return ''+col.red+' '+col.green+' '+col.blue;
}

function ParseOne(note,defaultColorMappings) {
   var parts=note.split("|");
   return { fill:parse(parts[0],defaultColorMappings), stroke:parse(parts[1],defaultColorMappings) };
}

function parse(col,defaultColorMappings) {
  if (col=="none")
    return new NoColor();
  for (var i = 0; i < defaultColorMappings.length; i++) {
    if (defaultColorMappings[i].rgbin==col)
      return colFromString(defaultColorMappings[i].cmykout);
  }
  var rgb=col.split(" ");
  var c=(255-Number(rgb[0]))/255;
  var m=(255-Number(rgb[1]))/255;
  var y=(255-Number(rgb[2]))/255;
  var k=Math.min(c,Math.min(m,y));
  var res= new CMYKColor();
  res.black = k*100;
  res.cyan = (c-k)*100;
  res.magenta = (m-k)*100;
  res.yellow = (y-k)*100;

  var searchColor = ''+res.cyan.toFixed(2)+' '+res.magenta.toFixed(2)+' '+res.yellow.toFixed(2)+' '+res.black.toFixed(2);
  for (var i = 0; i < defaultColorMappings.length; i++) {
    if (defaultColorMappings[i].cmykin==searchColor)
      return colFromString(defaultColorMappings[i].cmykout);
  }

  return res;
}

function colFromString(s) {
  var res= new CMYKColor();
  var cmyk=s.split(" ");
  res.cyan = Number(cmyk[0])*100;
  res.magenta = Number(cmyk[1])*100;
  res.yellow = Number(cmyk[2])*100;
  res.black = Number(cmyk[3])*100;
  return res;
}

function getFont(family,style) {
  var fonts = app.textFonts;
  for (var i=0; i<fonts.length; i++) {
    if (fonts[i].family === family && fonts[i].style === style) {
      return fonts[i];
    }
  }
  throw new Error('Font '+family+' '+style+' not found');
}

function ReplaceFont(item) {
  for (var i = 0; i < item.textRanges.length; i++) {
    var tr = item.textRanges[i];
    var tf = tr.characterAttributes.textFont;
    for (var j = 0; j < defaultFontMappings.length; j++) {
      if (defaultFontMappings[j].fontIn.family === tf.family && defaultFontMappings[j].fontIn.style === tf.style) {
        if (defaultFontMappings[j].font === undefined) {
          defaultFontMappings[j].font = getFont(defaultFontMappings[j].fontOut.family, defaultFontMappings[j].fontOut.style);
        }
        tr.characterAttributes.textFont = defaultFontMappings[j].font;
      }
    }
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