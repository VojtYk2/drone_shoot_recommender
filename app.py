from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

def get_recommendations(lat, lng, radius):
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json];
    (
        node()
    )
    """

    response = requests.get(overpass_url, params={'data': query})
    data = response.json()
    recommendations = []
    for recommendation in data['elements']:
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