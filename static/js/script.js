// Used the Leaflet tutorial on their website for help
var map = L.map('map').setView([51.505, -0.09], 10);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var marker = L.marker([51.505, -0.09]).addTo(map);
var lastMarker = null;

lastMarker = marker;

function onMapClick(e) {
    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    map.removeLayer(lastMarker);
    lastMarker = marker;
}

map.on('click', onMapClick);