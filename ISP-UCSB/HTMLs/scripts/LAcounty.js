// Author: Robin Martin July 2023
// Patrick Wied. (n.d.). Heatmap.js. GitHub Repository. Retrieved July 2023, from https://github.com/pa7/heatmap.js


// set baselayer 
var baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


// Set up Heatmap
// declare the heatmap variable outside of the function
frontier_la_heatmap = []
spectrum_la_heatmap = []
att_la_heatmap = []

gradient = {
  '0.0': '#6D6875',// darkest purple
  '0.05': '#B5838D',// purple
  '0.1': '#E5989B', // pink purple
  '0.5': '#FFB4A2', // pink
  '1.0': '#FFCDB2'  // lightest pink 
 }

// Set Configurations
var frontier_cfg = {
  "radius": 25,
  "blur": 0.2,
  "maxOpacity": .9,
  "minOpacity": 1.0, 
  "gradient": gradient,  
  latField: 'Lat',
  lngField: 'Long',
  valueField: 'cv_normalized'
}
var spectrum_cfg = {
  "radius": 25,
  "blur": 0.2,
  "maxOpacity": .9,
  "minOpacity": 1.0, // Set the min and max opacity to 0.9
  "gradient": gradient,  
  latField: 'Lat',
  lngField: 'Long',
  valueField: 'cv_normalized'
}
var att_cfg = {
    "radius": 25,
    "blur": 0.2,
    "maxOpacity": .9,
    "minOpacity": 1.0, // Set the min and max opacity to 0.9
    "gradient": gradient,  
    latField: 'Lat',
    lngField: 'Long',
    valueField: 'cv_normalized'
  }

// Define addPopup func: Displays prices on click by using a circle marker
function addPopup(point, heatLayer) {
  const median_cv = Math.round(point.median_cv * 100)/100;
  const popupContent = `<strong>${"CV:  " + median_cv}</strong>`;
  var circle = L.circle([point.Lat, point.Long], {
    opacity: 0.0,
    fillOpacity: 0.0,
    radius: 150
   });
  circle.bindPopup(popupContent);
  heatLayer.addLayer(circle);

}

var frontier_la_heatmapLayer = new HeatmapOverlay(frontier_cfg)
var frontier_group = L.layerGroup()

function frontier_la_fetchData() {
  fetch("JSONS/Los Angeles_Frontier.json")
      .then((res) => {
      return res.json();
  })
  .then((data) => {
    frontier_la_heatmap = data;
    console.log(frontier_la_heatmap);
    // Use the heatmap data
    frontier_la_heatmapLayer.addData(frontier_la_heatmap);
    frontier_group.addLayer(frontier_la_heatmapLayer)
    // Add popups for each heatmap point
    data.forEach(point => addPopup(point, frontier_group));
  });
}
// call the att_fetchData() Function
frontier_la_fetchData();

var spectrum_la_heatmapLayer = new HeatmapOverlay(spectrum_cfg)
var spectrum_group = L.layerGroup();

function spectrum_la_fetchData() {
  fetch("JSONS/Los Angeles_Spectrum.json")
      .then((res) => {
      return res.json();
  })
  .then((data) => {
    spectrum_la_heatmap = data;
    console.log(spectrum_la_heatmap);
    // Use the heatmap data
    spectrum_la_heatmapLayer.addData(spectrum_la_heatmap);
    // add heatmap layer to cox layer group
    spectrum_group.addLayer(spectrum_la_heatmapLayer)
    // Add popups for each heatmap point
    data.forEach(point => addPopup(point, spectrum_group));

  });
}
// call the cox_fetchData() Function
spectrum_la_fetchData();



var att_la_heatmapLayer = new HeatmapOverlay(att_cfg)
var att_group = L.layerGroup();

function att_la_fetchData() {
  fetch("JSONS/Los Angeles_AT&T.json")
      .then((res) => {
      return res.json();
  })
  .then((data) => {
    att_la_heatmap = data;
    console.log(att_la_heatmap);
    // Use the heatmap data
    att_la_heatmapLayer.addData(att_la_heatmap);
    // add heatmap layer to cox layer group
    att_group.addLayer(att_la_heatmapLayer)
    // Add popups for each heatmap point
    data.forEach(point => addPopup(point, att_group));

  });
}
// call the cox_fetchData() Function
att_la_fetchData();


var map = new L.Map('map', {
  center: new L.LatLng(34.05, -118.24), // HERE is where the cities Lat and Long go to center the map
  minZoom: 8,
  maxZoom: 15,
  zoom: 8,
  layers: [baseLayer, frontier_group]
})

var overlayMaps = {
  "Frontier": frontier_group,
  "Specturm": spectrum_group,
  "AT&T": att_group
};

var layerControl = L.control.layers(overlayMaps).addTo(map);

//-- Adding a legend --//
var legend = L.control({position: 'bottomright'});


legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');

  // Adding the colored squares based on the gradient
  for (var key in gradient) {
    if (gradient.hasOwnProperty(key)) {
      div.innerHTML +=
        '<i style="background:' + gradient[key] + '"></i> ' +
        key + '<br>';
    }
  }

  return div;
};

legend.addTo(map);
//-- End of Legend --//

var maxBounds = map.getBounds();
// Set the bounds for all zoom levels
map.setMaxBounds(maxBounds);


