// (c) 2024 MapCreator BV, the Netherlands

var defaultColorMappings=
  [
    //list of colors to replace. 
    //  format of rgbin is "<R> <G> <B>" with R,G,B as whole numbers from 0..255
    //  format of cmykin is "<C> <M> <Y> <K>" with C,M,Y,K as fractional numbers rounded to 2 decimal places, incl trailing zeros from 0..100
    //  format of cmykout is "<C> <M> <Y> <K>" with C,M,Y,K as fractional numbers from 0..100
    //samples:
    //{rgbin:"214 250 217", cmykout:"100 0 0 0"},
    //{rgbin:"255 255 255", cmykout:"100 0 0 0"},
    //{cmykin:"14.12 0.00 12.94 1.96", cmykout:"0 0 100 0"}
  ]

{
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
  res.cyan = Number(cmyk[0]);
  res.magenta = Number(cmyk[1]);
  res.yellow = Number(cmyk[2]);
  res.black = Number(cmyk[3]);
  return res;
}