// Used the Leaflet tutorial on their website for help
var map = L.map('map').setView([51.505, -0.09], 10);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var marker = L.marker([51.505, -0.09]).addTo(map);
var lastMarker = marker;

function onMapClick(e) {
    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    map.removeLayer(lastMarker);
    lastMarker = marker;
    createCircle();
}

var circle = L.circle([51.505, -0.09], {
    radius: document.getElementById('radius').value,
    color: 'blue',
    fillColor: '#30f',
    fillOpacity: 0.5
}).addTo(map);
var lastCircle = null;

lastCircle = circle;

function createCircle() {
    circle = L.circle([marker.getLatLng().lat, marker.getLatLng().lng], {
        radius: document.getElementById('radius').value,
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5
    }).addTo(map);
    map.removeLayer(lastCircle);
    lastCircle = circle;
}

function submitForm() {
    var lat = marker.getLatLng().lat;
    var lng = marker.getLatLng().lng;
    var radius = document.getElementById('radius').value;

    if(window.innerWidth <= 700) {
        document.getElementsByClassName('mapDiv')[0].style.display = 'none';
    }

    const recommendationsDiv = document.getElementsByClassName('recommendationsDiv')[0];
    recommendationsDiv.innerHTML = '<h2>Recommendations</h2><p>Loading recommendations...</p>';

    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            radius: radius
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success') {
            displayRecommendations(data.data.recommendations);
        }
        else if(data.status === 'no_results') {
            displayNoResults(data.message);
        }
        else {
            alert("There has been an error generating recommendations.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Network error occurred.");
    });
}

function displayNoResults(message) {
    const recommendationsDiv = document.getElementsByClassName('recommendationsDiv')[0];
    recommendationsDiv.innerHTML = '<button class="generate-again">Generate Again</button><h2>Recommendations</h2>';
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = message;
    recommendationsDiv.appendChild(noResultsMessage);
    
    document.getElementsByClassName('generate-again')[0].addEventListener('click', function() {
        document.getElementsByClassName('mapDiv')[0].style.display = 'flex';
        document.getElementsByClassName('recommendationsDiv')[0].innerHTML = '';
    });
}

function displayRecommendations(recommendations) {
    const recommendationsDiv = document.getElementsByClassName('recommendationsDiv')[0];
    recommendationsDiv.innerHTML = '<button class="generate-again">Generate Again</button><h2>Recommendations</h2>';
    const recommendationsContainer = document.createElement('div');
    recommendationsContainer.className = 'recommendations';
    recommendationsDiv.appendChild(recommendationsContainer);

    document.getElementsByClassName('generate-again')[0].addEventListener('click', function() {
        document.getElementsByClassName('mapDiv')[0].style.display = 'flex';
        document.getElementsByClassName('recommendationsDiv')[0].innerHTML = '';
    });

    recommendations.forEach(element => {
        const a = document.createElement('a');
        const h3 = document.createElement('h3');
        const cat = document.createElement('p');
        const subcat = document.createElement('p');
        h3.textContent = element['name'];
        cat.textContent = "Category: " + element['category'];
        subcat.textContent = "Subcategory: " + element['subcategory'];
        a.appendChild(h3);
        a.appendChild(cat);
        a.appendChild(subcat);
        a.href = element['link'];
        a.target = '_blank';
        recommendationsContainer.appendChild(a);
    });
}

document.getElementById('radius').addEventListener('input', function() {
    createCircle();
});

document.getElementById('radius').value = 5000;
document.getElementById('radiusOutput').value = document.getElementById('radius').value;

map.on('click', onMapClick);