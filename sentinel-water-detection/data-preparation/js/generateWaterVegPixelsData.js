/*
Constants -------------------------------------------
*/

var WATER_CLASS = 0;
var VEG_CLASS = 1;
var BANDS = ['B2', 'B3', 'B4', 'B8'];

/*
Functions -------------------------------------------
*/

// Load the function to add a buffer to each point
// This is not needed when dealing with POLYGONS instead of POINTS
function bufferPoints(radius, bounds) {
  return function(pt) {
    pt = ee.Feature(pt);
    return bounds ? pt.buffer(radius).bounds() : pt.buffer(radius);
  }
};

function innerPolygon(poly, innerMargin){
  var updatedPolygon = poly.map(bufferPoints(-innerMargin, false));
  return updatedPolygon;
}


function ringPolygon(poly, outerMargin){
  var polyDiff = function(poly) {
    var polyLarge = poly.buffer(outerMargin); // Create the large polygon
    return polyLarge.difference(poly);
  };
  
  var polyVeg = poly.map(polyDiff);
  return polyVeg;
}

// Generate 5 random points and overlay and extract pixel value behind them.
function generateData(ic, polygons, classDict, numPts, scale){
    var data = polygons.map(function(polygon){
      var points = ee.FeatureCollection.randomPoints(
        {region: polygon.geometry(), points: numPts, seed: 0, maxError: 1})
      
      points = points.map(function(point){
        return point.set(classDict);
      });
    
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


var Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");
// var Region = 
//     /* color: #d63000 */
//     /* shown: false */
//     ee.Geometry.Polygon(
//         [[[148.9405054323802, -32.697231431596926],
//           [145.6006616823802, -33.36040933369022],
//           [143.9307398073802, -34.671670280678136],
//           [143.1397241823802, -39.23443034959701],
//           [144.8975366823802, -39.506209455992895],
//           [147.9737085573802, -39.506209455992895],
//           [149.5557398073802, -38.96159444142003],
//           [152.1924585573802, -35.891327255966466],
//           [152.8076929323802, -34.382032369403966]]]);
          
var FarmDams = ee.FeatureCollection("users/martinomalerba/OGFarmDams");

print (FarmDams);

var waterPolygons = innerPolygon(FarmDams, 5);
var vegPolygons = ringPolygon(FarmDams, 50)

print (waterPolygons);
print (vegPolygons);


var ic = Sentinel2A
      .filterDate('2019-01-01', '2019-02-01');
      
var waterClassDict = {'class': 0};
var vegClassDict = {'class': 1};

// ic, polygons, classDict, numPts, scale
var waterData = generateData(ic, waterPolygons, waterClassDict, 20, 10)
print (waterData);
var vegData = generateData(ic, vegPolygons, vegClassDict, 20, 10)
print (vegData);

Map.setCenter(143.96306, -37.74696, 12);
//Map.addLayer(modisCol, {min: 3000, max: 3500});
Map.addLayer(waterPolygons,{} , 'Water');
Map.addLayer(vegPolygons,{} , 'Veg');

// print('Random points from within the defined region', randomPoints);
// Map.setCenter(143.96306, -37.74696, 12);
// // Map.addLayer(region, {color: 'yellow'}, 'Region');
Map.addLayer(waterData, {color: 'blue'}, 'Water Points');
Map.addLayer(vegData, {color: 'green'}, 'Veg Points');

var merged = waterData.merge(vegData);

print ("Merged data : ", merged);



// Save the extracted points
Export.table.toDrive({
  collection: merged,
  folder: 'GEE',
  description: 'generated_water_veg_pixels_data',
  fileFormat: 'CSV'
});

