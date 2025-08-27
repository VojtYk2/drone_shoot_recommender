// Used the Leaflet tutorial on their website for help
var map = L.map('map');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var marker;
var circle;
let lastGen = null;
let gen = false;
let load = false;
let displayingLoc = false;
let markers = [];

function success(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    map.setView([lat, lng], 10);
    marker = L.marker([lat, lng]).addTo(map);
    circle = L.circle([lat, lng], {
        radius: document.getElementById('radius').value,
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5
    }).addTo(map);
}

function fail(error) {
    map.setView([51.505, -0.09], 10);
    marker = L.marker([51.505, -0.09]).addTo(map);
    circle = L.circle([51.505, -0.09], {
        radius: document.getElementById('radius').value,
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5
    }).addTo(map);
}

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, fail, {enableHighAccuracy: true, timeout: 5000, maximumAge: 0});
}
else {
    map.setView([51.505, -0.09], 10);
    marker = L.marker([51.505, -0.09]).addTo(map);
    circle = L.circle([51.505, -0.09], {
        radius: document.getElementById('radius').value,
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5
    }).addTo(map);
}

function onMapClick(e) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    createCircle();
}

function createCircle() {
    if (circle) {
        map.removeLayer(circle);
    }
    circle = L.circle([marker.getLatLng().lat, marker.getLatLng().lng], {
        radius: document.getElementById('radius').value,
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5
    }).addTo(map);
}

function submitForm() {
    var lat = marker.getLatLng().lat;
    var lng = marker.getLatLng().lng;
    var radius = document.getElementById('radius').value;
    gen = true;
    load = true;

    if (displayingLoc) {
        displayLocations();
    }
    document.getElementsByClassName('displayLocationsButton')[0].style.display = 'none';

    if (window.innerWidth <= 900) {
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
            lastGen = data.data.recommendations;
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
    load = false;
    if (window.innerWidth <= 900) {
        recommendationsDiv.innerHTML = '<button class="generate-again">Generate Again</button><h2>Recommendations</h2>';
        
        document.getElementsByClassName('generate-again')[0].addEventListener('click', function() {
            document.getElementsByClassName('mapDiv')[0].style.display = 'flex';
            document.getElementsByClassName('recommendationsDiv')[0].innerHTML = '';
        });
    }
    else {
        recommendationsDiv.innerHTML = '<h2>Recommendations</h2>';
    }
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = message;
    recommendationsDiv.appendChild(noResultsMessage);
}

function displayRecommendations(recommendations) {
    const recommendationsDiv = document.getElementsByClassName('recommendationsDiv')[0];
    load = false;
    document.getElementsByClassName('displayLocationsButton')[0].style.display = 'block';
    if (window.innerWidth <= 900) {
        recommendationsDiv.innerHTML = '<button class="generate-again">Generate Again</button><h2>Recommendations</h2>';
    }
    else {
        recommendationsDiv.innerHTML = '<h2>Recommendations</h2>';
    }
    const recommendationsContainer = document.createElement('div');
    recommendationsContainer.className = 'recommendations';
    recommendationsDiv.appendChild(recommendationsContainer);

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

function displayLocations() {
    if (!displayingLoc) {
        displayingLoc = true;
        var locMarker;
        lastGen.forEach(element => {
            locMarker = L.marker([element.lat, element.lng]).addTo(map);
            markers.push(locMarker);
            locMarker.bindPopup(element.name);
            locMarker.on('mouseover', function (e) {
                this.openPopup();
            });
            locMarker.on('mouseout', function (e) {
                this.closePopup();
            });
        });
        document.getElementsByClassName('displayLocationsButton')[0].innerHTML = 'Hide Locations';
    }
    else {
        markers.forEach(element => {
            map.removeLayer(element);
        });
        displayingLoc = false;
        document.getElementsByClassName('displayLocationsButton')[0].innerHTML = 'Show Locations';
    }
}

document.getElementById('radius').addEventListener('input', function() {
    createCircle();
});


document.getElementById('radius').value = 5000;
document.getElementById('radiusOutput').value = document.getElementById('radius').value;

map.on('click', onMapClick);

window.addEventListener('resize', function() {
    if(gen){
        if (window.innerWidth <= 900) {
            document.getElementsByClassName('mapDiv')[0].style.display = 'none';

            if (!document.getElementsByClassName('generate-again')[0] && !load) {
                var div = document.getElementsByClassName('recommendationsDiv')[0];
                var inner = div.innerHTML;
                div.innerHTML = '<button class="generate-again">Generate Again</button>' + inner;

                document.getElementsByClassName('generate-again')[0].addEventListener('click', function() {
                    document.getElementsByClassName('mapDiv')[0].style.display = 'flex';
                    gen = false;
                    document.getElementsByClassName('recommendationsDiv')[0].innerHTML = '';
                });
            }
        }
        else {
            document.getElementsByClassName('mapDiv')[0].style.display = 'flex';

            if (document.getElementsByClassName('generate-again')[0]) {
                document.getElementsByClassName('generate-again')[0].remove();
            }
        }
    }
});