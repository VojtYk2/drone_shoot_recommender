from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def submit_form():
    data = request.get_json()
    lat = data['lat']
    lng = data['lng']
    radius = data['radius']

    recommendations = ["Park A", "Viewpoint B", "Lake C"]  # Dummy data  for now

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