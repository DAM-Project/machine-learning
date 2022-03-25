
var geometry = /* color: #d63000 */ee.FeatureCollection(
    [ee.Feature(
        ee.Geometry.Polygon(
            [[[148.4709390897751, -37.74127765123027],
              [148.49016516399385, -37.7329966297297],
              [148.47514479351045, -37.73109593673029]]]),
        {
          "system:index": "0"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[148.4821707996597, -37.71662892940593],
              [148.53813240854643, -37.734144032673356],
              [148.53693077890776, -37.71350564646235],
              [148.51169655649565, -37.70834515140933],
              [148.48938057749174, -37.709024184448346]]]),
        {
          "system:index": "1"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[148.38117751397584, -37.674373300643126],
              [148.40898665704225, -37.679672020374475],
              [148.42289122857545, -37.674237431058714],
              [148.41327819146608, -37.6587466676841],
              [148.40727004327272, -37.66173636500315],
              [148.39473876275514, -37.65466961367435],
              [148.3897605828235, -37.66350294773464],
              [148.38014754571412, -37.66418239143689]]]),
        {
          "system:index": "2"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[148.36916123547437, -37.69552678303048],
              [148.35723076977612, -37.70320082131987],
              [148.36199437298657, -37.7067998753359],
              [148.38688527264478, -37.706901732812156]]]),
        {
          "system:index": "3"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[147.37675625375672, -37.853057947164864],
              [147.3479171424286, -37.93650428767956],
              [147.41177517465516, -37.97440316485507],
              [147.42138821176454, -37.92783894181095]]]),
        {
          "system:index": "4"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[147.58328895602352, -37.91711091758289],
              [147.56783943209774, -37.93552624338537],
              [147.55393486056454, -37.953801600701844],
              [147.58019905123837, -37.955967267698036],
              [147.6097248080743, -37.9436491855506]]]),
        {
          "system:index": "5"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[147.5933395476331, -37.863058522791],
              [147.58578644704716, -37.904246064761615],
              [147.6317916960706, -37.918872934869356],
              [147.6324783415784, -37.876609598736025]]]),
        {
          "system:index": "6"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[147.13593231016986, -37.98265023097391],
              [147.13479505354755, -37.98674303280404],
              [147.14612470442646, -37.98672612086952],
              [147.1362970905959, -37.98190606065963]]]),
        {
          "system:index": "7"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[147.19131585785655, -37.97162608048708],
              [147.18758222290782, -37.9729962164343],
              [147.19153043457774, -37.97461159078152],
              [147.19605800339488, -37.973774306944925],
              [147.19560739228038, -37.971981303373404]]]),
        {
          "system:index": "8"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[146.9048011570646, -37.87563245583936],
              [146.9035566120817, -37.878816639251816],
              [146.89741971785563, -37.881086132770214],
              [146.9033420353605, -37.88501523978033],
              [146.91042306715983, -37.88210230123135],
              [146.91244008833903, -37.876648699542756]]]),
        {
          "system:index": "9"
        }),
    ee.Feature(
        ee.Geometry.Polygon(
            [[[148.48956428344977, -37.74817556645062],
              [148.4870108204676, -37.753452045637],
              [148.49804006393683, -37.75224748063832],
              [148.49861942108404, -37.74861670130968]]]),
        {
          "system:index": "10"
        })]);
/*
Constants -------------------------------------------
*/

var IMAGE_COLLECTION_ID = "COPERNICUS/S2_SR";
var SHAPE_FILES_PATH = geometry;
var EXPORTED_FILE_NAME = 'generated_land_pixels_data';


var LAND_CLASS = 2;
var BANDS = ['B2', 'B3', 'B4', 'B8'];
var START_DATE = '2019-01-01';
var END_DATE = '2019-02-01';
var NUM_POINTS = 20;
var CLOUDY_PIXEL_PERCENTAGE = 15;
var SCALE = 10;

var classDict = {'class': LAND_CLASS};

// Display 
var CENTER_LAT = 143.96306;
var CENTER_LON = -37.74696;
var ZOOM_LEVEL = 12;
var DISPLAY_LABEL_POLYGON = 'Land';
var DISPLAY_LABEL_POINTS = 'Land Points';
var POINTS_COLOR = 'black';

/*
Functions -------------------------------------------
*/

// Generate random points and overlay and extract pixel value behind them.
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


var Sentinel2A = ee.ImageCollection(IMAGE_COLLECTION_ID);
      
var polygons = ee.FeatureCollection(SHAPE_FILES_PATH);

print (polygons);


var ic = Sentinel2A
  .filterDate(START_DATE, END_DATE)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', CLOUDY_PIXEL_PERCENTAGE));
  

// ic, polygons, classDict, numPts, scale
var data = generateData(ic, polygons, classDict, NUM_POINTS, SCALE);

print (data);

Map.setCenter(CENTER_LAT, CENTER_LON, ZOOM_LEVEL);

Map.addLayer(polygons,{} , DISPLAY_LABEL_POLYGON);
Map.addLayer(data, {color: POINTS_COLOR}, DISPLAY_LABEL_POINTS);


// Save the extracted points
Export.table.toDrive({
collection: data,
folder: 'GEE',
description: EXPORTED_FILE_NAME,
fileFormat: 'CSV'
});

