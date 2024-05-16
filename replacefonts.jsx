// (c) 2024 MapCreator BV, the Netherlands

var defaultFontMappings=
  [
    //list of fonts to replace. 
    //sample:
    //{fontIn:{family:'Helvetica Neue LT Std',style:'55 Roman'},fontOut:{family:'Symbol',style:'Regular'}}
  ]

{
    var items = app.activeDocument.textFrames;
    for (var i = items.length - 1; i >= 0; i--) {
          ReplaceFont(items[i]);
    }
    alert('Ready');
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
