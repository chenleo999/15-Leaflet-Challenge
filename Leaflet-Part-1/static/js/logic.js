// API endpoint, all earthquakes in the past 7 days, url from USGC
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// geoJSON request
d3.json(url).then(function (data) {
  console.log(data);  
  createFeatures(data.features);
});

// marker size function
function markerSize(magnitude) {
  return magnitude * 50000;
};

// marker color by depth function
function chooseColor(depth) {
  if (depth < 10) return "#64B5F6";
  else if (depth < 30) return "#43A047";
  else if (depth < 50) return "#FFF176";
  else if (depth < 70) return "#FB8C00";
  else if (depth < 90) return "#B71C1C";
  else return "#FF3300";
};

// create feature function
function createFeatures(earthquakeData) {

  // popup description 
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}
        </p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
    // onEachFeature function for each piece of data in array
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        // point-to-layer for marker circles
        pointToLayer: function (feature, latlon) {

            // Determine the style of markers based on properties
            let spots = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.5,
                color: "black",
                stroke: true,
                weight: 1
            }
            return L.circle(latlon, spots);
        }
    });

    // pass earthquakes layer to the createMap 
    createMap(earthquakes);
};


function createMap(earthquakes) {

  // base layer street and topo
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // base map object
  let baseMap = {
      "Street Map": street,
      "Topographic Map": topo
  };

  // overlay object
  let overlayMap = {
      Earthquakes: earthquakes
  };

  // set up my map
  let myMap = L.map("map", {
      center: [41, 35],
      zoom: 3,
      layers: [street, earthquakes]
  });

  // layer control stuff
  L.control.layers(baseMap, overlayMap, {
      collapsed: false
  }).addTo(myMap);

  // lastly legend, color schema is not perfact for topo layer, but it works
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      div.innerHTML += "<h4 style='text-align: center'>Earthquake Depth (km)</h4>";
      div.innerHTML += '<li style=\"background-color: #64B5F6"></li><span>10km or less</span><br>';
      div.innerHTML += '<li style=\"background-color: #43A047"></li><span>30km or less</span><br>';
      div.innerHTML += '<li style=\"background-color: #FFF176"></li><span>50km or less</span><br>';
      div.innerHTML += '<li style=\"background-color: #FB8C00"></li><span>70km or less</span><br>';
      div.innerHTML += '<li style=\"background-color: #FF3300"></li><span>90km or less</span><br>';
      div.innerHTML += '<li style=\"background-color: #B71C1C"></li><span>More than 90km</span><br>';
      return div;
  };

  legend.addTo(myMap);
}

