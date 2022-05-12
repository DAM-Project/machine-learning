var trainData = ee.FeatureCollection("projects/ee-epgalanis/assets/Final_data_9k"),
    Region =
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
      [[[140.96126303942492,-33.99133319528273],
      [140.96126303942492,-38.110919172137265],
      [146.30061850817492,-39.02144634571554],
      [150.07991538317492,-37.52075013904677],
      [140.96126303942492,-33.99133319528273]]]),
    Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");
/*
Constants -------------------------------------------
*/

var LAND_CLASS = 0;
var WATER_CLASS = 1;
var BANDS = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'];

var ic = Sentinel2A
      .filterDate('2019-01-01', '2019-12-01')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15));

Map.setCenter(143.96306, -37.74696, 12);


// CART
var classifier = ee.Classifier.smileCart().train(trainData, 'class', BANDS);


// // print (classifier.explain());

var input = ic.median().select(BANDS);
var classified = input.classify(classifier);

// print (classifier.confusionMatrix().accuracy());

var trainAccuracy = classifier.confusionMatrix();


print('      Confusion Matrix        ');
print('------------------------------');
print('                 True         ');
print('                 Water   Land ');
print('Predicted  Water ' + trainAccuracy.getInfo()[0][0] + '      ' + trainAccuracy.getInfo()[0][1]);
print('           Land  ' + trainAccuracy.getInfo()[1][0] + '      ' + trainAccuracy.getInfo()[1][1]);
print('------------------------------');


var classifier_serialized = ee.Serializer.toJSON(classifier)


// Here, we're using Region polygon as just a dummy feature
var dummy = ee.Feature(Region).set({'classifier': ee.String(classifier.explain().get('tree'))});


Export.table.toAsset(ee.FeatureCollection(dummy), 'serialize-cart-classifier', 'cart_classifier_3')


var palette = [
  'A52A2A', // Land
  '0000FF', // Water
]

Map.addLayer(classified.clip(Region), {palette: palette, min: 0, max: 2}, 'classification CART')
