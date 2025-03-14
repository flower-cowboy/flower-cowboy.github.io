// Author: Robin Martin July 2023
// Patrick Wied. (n.d.). Heatmap.js. GitHub Repository. Retrieved July 2023, from https://github.com/pa7/heatmap.js


// set baselayer 
var baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


// Set up Heatmap
// declare the heatmap variable outside of the function
att_heatmap = []
spectrum_heatmap = []

gradient = {
  '0.0': '#6D6875',// darkest purple
  '0.05': '#B5838D',// purple
  '0.1': '#E5989B', // pink purple
  '0.5': '#FFB4A2', // pink
  '1.0': '#FFCDB2'  // lightest pink 
 }

// Set Configurations
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


var att_heatmapLayer = new HeatmapOverlay(att_cfg)
var att_group = L.layerGroup()

function att_fetchData() {
  fetch("JSONS/Kansas_AT&T.json")  // ****** CHANGES MADE HERE ****** //
      .then((res) => {
      return res.json();
  })
  .then((data) => {
    att_heatmap = data;
    console.log(att_heatmap);
    // Use the heatmap data
    att_heatmapLayer.addData(att_heatmap);
    att_group.addLayer(att_heatmapLayer)
    // Add popups for each heatmap point
    data.forEach(point => addPopup(point, att_group));
  });
}
// call the att_fetchData() Function
att_fetchData();

var spectrum_heatmapLayer = new HeatmapOverlay(spectrum_cfg)
var spectrum_group = L.layerGroup();

function spectrum_fetchData() {
  fetch("JSONS/Kansas_Spectrum.json")    // ****** CHANGES MADE HERE ****** //
      .then((res) => {
      return res.json();
  })
  .then((data) => {
    spectrum_heatmap = data;
    console.log(spectrum_heatmap);
    // Use the heatmap data
    spectrum_heatmapLayer.addData(spectrum_heatmap);
    // add heatmap layer to spectrum layer group
    spectrum_group.addLayer(spectrum_heatmapLayer)
    // Add popups for each heatmap point
    data.forEach(point => addPopup(point, spectrum_group));

  });
}
// call the spectrum_fetchData() Function
spectrum_fetchData();




var map = new L.Map('map', {
  center: new L.LatLng(39.099724, -94.57833),  // ****** CHANGES MADE HERE ****** //
  minZoom: 9,
  maxZoom: 15,
  zoom: 10,
  layers: [baseLayer, att_group]
})

var overlayMaps = {       // ****** CHANGES MADE HERE ****** //
  "AT&T": att_group,
  "Spectrum": spectrum_group
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

// set zoom to best viewing level
var zoomlevel = 12;
map.setZoom(zoomlevel);
