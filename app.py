from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

def get_recommendations(lat, lng, radius):
    overpass_url = "https://overpass-api.de/api/interpreter"

    query = f"""
    [out:json][timeout:15];
    (
        node(around:{radius},{lat},{lng})["tourism"~"viewpoint"];
        node(around:{radius},{lat},{lng})["historic"~"castle|ruins|monument"];
        node(around:{radius},{lat},{lng})["natural"~"peak|cliff|beach|waterfall|lake"];
        node(around:{radius},{lat},{lng})["man_made"~"lighthouse|tower"];
        node(around:{radius},{lat},{lng})["place"~"island"];
        node(around:{radius},{lat},{lng})["landuse"~"vineyard"];
        node(around:{radius},{lat},{lng})["leisure"~"park"];
        way(around:{radius},{lat},{lng})["natural"~"coastline"];
    );
    out body 15;
    """

    response = requests.get(overpass_url, params={'data': query})
    data = response.json()
    recommendations = []
    
    if 'elements' in data:
        for recommendation in data['elements']:
            if 'tags' in recommendation and 'name' in recommendation['tags']:
                recommendations.append(recommendation['tags']['name'])

    return recommendations

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def submit_form():
    data = request.get_json()
    lat = data['lat']
    lng = data['lng']
    radius = data['radius']

    if int(radius) < 500:
        radius = "500"
    elif int(radius) > 10000:
        radius = "10000"

    recommendations = get_recommendations(lat, lng, radius)

    return jsonify({
        'status': 'success',
        'data': {
            'recommendations': recommendations,
            'location': {'lat': lat, 'lng': lng},
            'radius': radius
        }
    })

if __name__ == '__main__':
    app.run(debug=True)