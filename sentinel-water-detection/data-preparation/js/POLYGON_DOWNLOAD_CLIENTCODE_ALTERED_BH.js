// USE LINK INSTEAD
// https://code.earthengine.google.com/bc18a6a50d7d67b9ce0264f1866994d5
// Choose here the polygons to analyse
var myPoly = FarmDams;

// Choose here the satellite data
var mySat = Sentinel2A;

 // Choose dates
var StartDate = '2019-01-01';
var EndDate = '2020-01-01';

// Output name (Water)
var SaveWater = 'FarmDams_water_AllBandsAllDates_level2A';

// Output name (Veg)
var SaveVeg = 'FarmDams_vegetation_AllBandsAllDates_level2A';

////////////////////////////////////////


function zonalStats(ic, fc, params) {
  // Initialize internal params dictionary.
  var _params = {
    reducer: ee.Reducer.mean(),
    scale: null,
    crs: null,
    bands: null,
    bandsRename: null,
    imgProps: null,
    imgPropsRename: null,
    datetimeName: 'datetime',
    datetimeFormat: 'YYYY-MM-dd HH:MM:ss'
  };

  // Replace initialized params with provided params.
  if (params) {
    for (var param in params) {
      _params[param] = params[param] || _params[param];
    }
  }

  // Set default parameters based on an image representative.
  var imgRep = ic.first();
  var nonSystemImgProps = ee.Feature(null)
    .copyProperties(imgRep).propertyNames();
  if (!_params.bands) _params.bands = imgRep.bandNames();
  if (!_params.bandsRename) _params.bandsRename = _params.bands;
  if (!_params.imgProps) _params.imgProps = nonSystemImgProps;
  if (!_params.imgPropsRename) _params.imgPropsRename = _params.imgProps;

  // Map the reduceRegions function over the image collection.
  var results = ic.map(function(img) {
    // Select bands (optionally rename), set a datetime & timestamp property.
    img = ee.Image(img.select(_params.bands, _params.bandsRename))
      .set(_params.datetimeName, img.date().format(_params.datetimeFormat))
      .set('timestamp', img.get('system:time_start'));

    // Define final image property dictionary to set in output features.
    var propsFrom = ee.List(_params.imgProps)
      .cat(ee.List([_params.datetimeName, 'timestamp']));
    var propsTo = ee.List(_params.imgPropsRename)
      .cat(ee.List([_params.datetimeName, 'timestamp']));
    var imgProps = img.toDictionary(propsFrom);

    // Subset points that intersect the given image.
    var fcSub = fc.filterBounds(img.geometry());

    // Reduce the image by regions.
    return img.reduceRegions({
      collection: fcSub,
      reducer: _params.reducer,
      scale: _params.scale,
      crs: _params.crs
    })
    // Add metadata to each feature.
    .map(function(f) {
      return f.set(imgProps);
    })
    .map(function(feature) {
    var ndvi = ee.List([feature.get('quality_check'), -9999])
      .reduce(ee.Reducer.firstNonNull())
    return feature.set({'quality_check': ndvi, 'imageID': img.id()})
    })
    
  }).flatten().filter(ee.Filter.notNull(_params.bandsRename));

  return results;
  return fcSub;

}

var modisCol = ee.ImageCollection(mySat
    .filterBounds(Region)
    .filterDate(StartDate, EndDate)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
    .select('B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B8A', 'B11', 'B12')
  );

//print(modisCol)

// Define parameters for the zonalStats function.
var params = {
  scale: 0,
  bands: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B8A', 'B11', 'B12'],
  bandsRename: ['Band_1', 'Band_2', 'Band_3', 'Band_4', 'Band_5', 'Band_6', 'Band_7','Band_8','Band_9','Band_B8A','Band_11','Band_12'],
  datetimeName: 'date',
  datetimeFormat: 'YYYY-MM-dd'
};




// Load the function to add a buffer to each point
// This is not needed when dealing with POLYGONS instead of POINTS
function bufferPoints(radius, bounds) {
  return function(pt) {
    pt = ee.Feature(pt);
    return bounds ? pt.buffer(radius).bounds() : pt.buffer(radius);
  };
}




///////////////////////////
// ANALYSE THE FARM DAMS //
///////////////////////////

// Remove 5 meters of buffer at each polygon to make sure we get the water
//var PolyWater = ANUFarms.map(bufferPoints(-5, false));
var PolyWater = myPoly.map(bufferPoints(-5, false));
print(PolyWater);


// Extract zonal statistics per point per image and calculating the area of polygon in m2.
var PolyWater_Stats = zonalStats(modisCol,PolyWater, params).map(function(f) {
          var stateArea = f.geometry().area()
          return f.set('Area_in_m2', ee.Number(stateArea));
    });
//print(PolyWater_Stats);


// Save water stats
Export.table.toDrive({
  collection: PolyWater_Stats,
  folder: 'GEE',
  description: SaveWater,
  fileFormat: 'CSV',
  selectors:['Ref','Sites','date','Band_1', 'Band_2', 'Band_3', 'Band_4','Band_5', 'Band_6', 'Band_7','Band_8','Band_9','Band_B8A','Band_11','Band_12','Area_in_m2']
});



/////////////////////////////////
// ANALYSE THE SURROUNDING VEG //
/////////////////////////////////


// Add 30 meters of buffer at each polygon for the vegetation
//var PolyLarge = ANUFarms.map(bufferPoints(30, false));

// Remove the water section
// See https://gis.stackexchange.com/questions/300725/difference-between-two-polygons-in-earth-engine
// See https://gis.stackexchange.com/questions/246161/compute-centroids-and-buffers-for-multiple-polygons-in-google-earth-engine
// This option doesn't work because you are dealing with a collection of polygons
// var PolyVeg = PolyLarge.difference(ANUFarms);
// You need to MAP over multiple polygons

var PolyDiff = function(Poly) {
  var PolyLarge = Poly.buffer(50); // Create the large polygon
  return PolyLarge.difference(Poly);
};

var PolyVeg = myPoly.map(PolyDiff);

//print(PolyVeg);


// Extract zonal statistics per point per image and calculating the area of polygon in m2.
var PolyVeg_Stats = zonalStats(modisCol,PolyVeg, params).map(function(f) {
          var stateArea = f.geometry().area()
          return f.set('Area_in_m2', ee.Number(stateArea));
    });
    
print(PolyVeg_Stats);


// Save vegetation stats
Export.table.toDrive({
  collection: PolyVeg_Stats,
  folder: 'GEE',
  description: SaveVeg,
  fileFormat: 'CSV',
  selectors:['Ref','Sites','date','Band_1', 'Band_2', 'Band_3', 'Band_4','Band_5', 'Band_6', 'Band_7','Band_8','Band_9','Band_B8A','Band_11','Band_12','Area_in_m2']
});



//////////
// PLOT //
//////////

Map.setCenter(143.96306, -37.74696, 12);
//Map.addLayer(modisCol, {min: 3000, max: 3500});
Map.addLayer(PolyWater,{} , 'Water');
Map.addLayer(PolyVeg, {} , 'Vegetation');