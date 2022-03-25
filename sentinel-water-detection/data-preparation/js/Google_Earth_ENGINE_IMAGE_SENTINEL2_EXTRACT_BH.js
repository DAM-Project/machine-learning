// Google_Earth_ENGINE_IMAGE_SENTINEL2_EXTRACT_BH
// USE LINK FOR GOOGLE EARTH NOT THIS 
// https://code.earthengine.google.com/58eefc3069ea05359a0315f4fb0aa88f

// This is the Sentinel 2 collection (all the possible available Sentinel-2 imagery)
var S2_collection = ee.ImageCollection("COPERNICUS/S2")
  .filterBounds(geometry)
  .filterDate('2019-01-01', '2019-02-01'); // change date range here

// This tells us what images are inside the collection
print(S2_collection.median());

// These are the bands that we want to be displayed
var S2_bands = ['B2', 'B3', 'B4'];
// Bands require for the image 
var S2_bandss = ['B2', 'B3', 'B4', 'B8'];
// This turns the whole S2 collection into one image, finding the middle value for each pixel
var S2_mosaic = S2_collection.median().select(S2_bandss).clip(geometry);

// This controls how we want the S2 image to be displayed
var S2_display = {bands: S2_bands, min: 0, max: 3000};

// This adds the S2_mosaic to the map, using the S2_display visual parameters, and giving it the name "S2_Image"
Map.addLayer(S2_mosaic, S2_display, "S2_Image");

// This automatically pans the map to the middle of our area of interest


var victoriafarms = ee.FeatureCollection('users/billh7000/shapefarm1');
victoriafarms = victoriafarms.geometry();
Map.addLayer(victoriafarms, {color: 'red'}, 'victoriafarms');

// This exports our Sentinel-2 image to Google Drive where we can download it
Export.image.toDrive({ 
  image: S2_mosaic,
  description: 'Sentinel-2',
  scale: 10, 
  maxPixels: 1e13, 
  region: geometry 
});