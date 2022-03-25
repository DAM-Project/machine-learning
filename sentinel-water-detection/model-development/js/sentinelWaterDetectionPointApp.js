// Import model and image collection
var cart_classifier = ee.FeatureCollection("users/arunetckumar/cart_classifier"),
    Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");

// Load the model
var classifier_string = cart_classifier.first().get('classifier');

var classifier = ee.Classifier.decisionTree(classifier_string);

var BANDS = ['B2', 'B3', 'B4', 'B8'];


var ic = Sentinel2A
      .filterDate('2019-01-01', '2020-02-01')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15));

// Generate random points and overlay and extract pixel value behind them.
function generateData(ic, polygons, numPts, scale){
    var data = polygons.map(function(polygon){
      var points = ee.FeatureCollection.randomPoints(
        {region: polygon.geometry(), points: numPts, seed: 0, maxError: 1})
      
      ic.filterBounds(polygon.geometry())
    
      var input = ic.median().select(BANDS);
    
      var sampled = input.sampleRegions({
        collection: points,
        scale: scale,
        geometries: true // TO keep the point coordinates
      });
      
      return sampled;
      
    }).flatten();
  return data;
}


var data = generateData(ic, geometry, 20, 10)

var classified = data.classify(classifier);

print (classified);

var palette = [
  '0000FF', // Water
  '008000', // Veg
  'A52A2A' // Land
]

Map.addLayer(classified, {palette: palette, min: 0, max: 2}, 'classification CART')

