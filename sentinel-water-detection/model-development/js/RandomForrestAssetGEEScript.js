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

// // print (classifier.explain());

var input = ic.median().select(BANDS);

var split = 0.7;  // Roughly 70% training, 30% testing.
var samples = trainData.randomColumn('random');
var training = samples.filter(ee.Filter.lt('random', split));
var validation = samples.filter(ee.Filter.gte('random', split));


// CART
// var classifier = ee.Classifier.smileCart().train(training, 'class', BANDS);
//RandomForest
var classifier = ee.Classifier.smileRandomForest(400).train(training, 'class', BANDS);


print('Training size:', training.size());
print('Test size:', validation.size());


var classified = input.classify(classifier);
var trainAccuracy = classifier.confusionMatrix();


print(' Training Confusion Matrix   ');
print('                 True         ');
print('                 Water   Land ');
print('Predicted  Water ' + trainAccuracy.getInfo()[0][0] + '      ' + trainAccuracy.getInfo()[0][1]);
print('           Land  ' + trainAccuracy.getInfo()[1][0] + '      ' + trainAccuracy.getInfo()[1][1]);

print('------------------------------');


// Classify the validation data.
var validated = validation.classify(classifier);
// var testAccuracy = validated.confusionMatrix();
var testAccuracy = validated.errorMatrix('class', 'classification');


print('      Test Confusion Matrix   ');

print('                 True         ');
print('                 Water   Land ');
print('Predicted  Water ' + testAccuracy.getInfo()[0][0] + '      ' + testAccuracy.getInfo()[0][1]);
print('           Land  ' + testAccuracy.getInfo()[1][0] + '      ' + testAccuracy.getInfo()[1][1]);
print('------------------------------');

// Get a confusion matrix representing expected accuracy.
print('Validation overall accuracy: ', testAccuracy.accuracy());

// Here, we're using Region polygon as just a dummy feature
//var dummy = ee.Feature(Region).set({'classifier': ee.String(classifier.explain().get('tree'))});
//Export.table.toAsset(ee.FeatureCollection(dummy), 'serialize-cart-classifier', 'cart_classifier_3');

//var dummy = ee.Serializer.toJSON(classifier)

//Export.table.toAsset(ee.FeatureCollection(ee.Feature(Region).set({'classifier':dummy})),
//                    'serialize-randomforest-classifier',
//                    'randomforest_classifier_0');
var trees = ee.List(ee.Dictionary(classifier.explain()).get('trees'))
var dummy = ee.Feature(Region)
var col = ee.FeatureCollection(trees.map(function(x){return dummy.set('tree',x)}))
Export.table.toAsset(col,'save_classifier','RandomForest01')

var palette = [
  'A52A2A', // Land
  '0000FF', // Water
]

Map.addLayer(classified.clip(Region), {palette: palette, min: 0, max: 2}, 'classification CART');
