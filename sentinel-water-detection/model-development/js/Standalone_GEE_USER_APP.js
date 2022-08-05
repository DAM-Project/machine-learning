
// USE LINK EASIER
// https://code.earthengine.google.com/b5469171f6170b1bfcb93c723d1aa4ab
// Type the number of bands
var BANDS = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'];
// Type START and END Date 
var Start_date = '2019-07-01';
var End_date = '2020-12-01';

// IMPORT OR DRAW GEOMETRY POLYGONS USING TOOLS TOP LEFT SIDE OF MAP

// CLICK RUN TO GET LAYER OVER MAP
// CLICK TASK TAB ON RIGHT SIDEBAR FOR GEOTIFF IMAGE EXPORT 
//
//
//
//
//
//
//












var Random_classifier = ee.FeatureCollection("users/billh7000/RandomForest_FINAL2"), 

    Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR"); 

// Load using this 

var classifier_string = Random_classifier.first().get('tree'); 

  

var classifier = ee.Classifier.decisionTree(classifier_string); 


  

var ic = Sentinel2A 

      .filterDate(Start_date,End_date) 

      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15)) 

      .select(BANDS) 

      .median(); 

  

//var input = ic.median().select(BANDS); 

  

var classified = ic.classify(classifier); 

  

print (classified); 

  

var palette = [
  'A52A2A', // Land
  '0000FF', // Water
]

  

Map.addLayer(classified.clip(geometry), {palette: palette, min: 0, max: 1}, 'classification Random') 

  

// // Export a GeoTIFF. 

Export.image.toDrive({



image: classified.visualize({min: 0, max: 1, palette: ['green','blue']}),



description: 'classifiedImage',



scale: 10,



region: geometry,

crs: 'EPSG:3857'




});

  

var legend = ui.Panel({style: {position: 'middle-right', padding: '8px 15px'}}); 

  

var makeRow = function(color, name) { 

  var colorBox = ui.Label({ 

    style: {color: '#ffffff', 

      backgroundColor: color, 

      padding: '10px', 

      margin: '0 0 4px 0', 

    } 

  }); 

  var description = ui.Label({ 

    value: name, 

    style: { 

      margin: '0px 0 4px 6px', 

    } 

  });  

  return ui.Panel({ 

    widgets: [colorBox, description], 

    layout: ui.Panel.Layout.Flow('horizontal')} 

)}; 

  

var title = ui.Label({ 

  value: 'Legend', 

  style: {fontWeight: 'bold', 

    fontSize: '16px', 

    margin: '0px 0 4px 0px'}}); 

     

legend.add(title); 

legend.add(makeRow('brown','land')) 

legend.add(makeRow('blue','Water')) 

//legend.add(makeRow('green','Vegetation')) 

  

Map.add(legend);
