#target illustrator-19  

function GroupsToLayers(){
    var doc = app.activeDocument;
    var originalLayer = doc.layers[0];
    var newLayer, thisGroup, thisContent;
    for(var i=originalLayer.groupItems.length - 1; i > -1; i--){
        thisGroup = originalLayer.groupItems[i];
        newLayer = doc.layers.add();
        newLayer.name = (i+1) + ' ' + thisGroup.name;
        for(var j=thisGroup.pageItems.length - 1; j > -1; j--){
            thisContent = thisGroup.pageItems[j];
            thisContent.move(newLayer, ElementPlacement.PLACEATBEGINNING);
        };
    };
    app.redraw();
    if(originalLayer.pageItems.length == 0){
        originalLayer.remove();
    }
}

GroupsToLayers();