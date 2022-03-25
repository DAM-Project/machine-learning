// USE LINK ITS BETTER
// https://code.earthengine.google.com/9e1070a6a8e84925c8dba3b58781a955
var victoriafarms = ee.FeatureCollection('users/billh7000/shapefarm1');
victoriafarms = victoriafarms.geometry();
Map.centerObject(victoriafarms);
Map.addLayer(victoriafarms, {color: 'red'}, 'victoriafarms');