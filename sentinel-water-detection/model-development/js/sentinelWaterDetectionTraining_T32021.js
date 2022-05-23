var trainData = ee.FeatureCollection("users/arunetckumar/sentinelTrainData2"),
    Region = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[148.9405054323802, -32.697231431596926],
          [145.6006616823802, -33.36040933369022],
          [143.9307398073802, -34.671670280678136],
          [143.1397241823802, -39.23443034959701],
          [144.8975366823802, -39.506209455992895],
          [147.9737085573802, -39.506209455992895],
          [149.5557398073802, -38.96159444142003],
          [152.1924585573802, -35.891327255966466],
          [152.8076929323802, -34.382032369403966]]]),
    Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");
/*
Constants -------------------------------------------
*/

var WATER_CLASS = 0;
var VEG_CLASS = 1;
var LAND_CLASS = 2;
var BANDS = ['B2', 'B3', 'B4', 'B8'];

var ic = Sentinel2A
      .filterDate('2016-07-01', '2020-12-01')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15));
      
Map.setCenter(143.96306, -37.74696, 12);


// CART
var classifier = ee.Classifier.smileCart().train(trainData, 'class', BANDS);


// // print (classifier.explain());

var input = ic.median().select(BANDS);
var classified = input.classify(classifier);

print (classifier.confusionMatrix().accuracy());

var classifier_serialized = ee.Serializer.toJSON(classifier)


// Here, we're using Region polygon as just a dummy feature
var dummy = ee.Feature(Region).set({'classifier': ee.String(classifier.explain().get('tree'))});


Export.table.toAsset(ee.FeatureCollection(dummy), 'serialize-cart-classifier', 'cart_classifier_3')


var palette = [
  '0000FF', // Water
  '008000', // Veg
  'A52A2A' // Land
]

Map.addLayer(classified.clip(Region), {palette: palette, min: 0, max: 2}, 'classification CART')


