from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

def get_cats(recommendation):
    if "tourism" in recommendation['tags'].keys():
        subcategory = recommendation['tags']['tourism']
        if subcategory == 'yes':
            subcategory = 'general attraction'
        return {'category': 'Tourism', 'subcategory': subcategory}
    elif "natural" in recommendation['tags'].keys():
        subcategory = recommendation['tags']['natural']
        if subcategory == 'yes':
            subcategory = 'general natural feature'
        return {'category': 'Natural', 'subcategory': subcategory}
    elif "man_made" in recommendation['tags'].keys():
        subcategory = recommendation['tags']['man_made']
        if subcategory == 'yes':
            subcategory = 'general structure'
        return {'category': 'Man-Made', 'subcategory': subcategory}
    elif "historic" in recommendation['tags'].keys():
        subcategory = recommendation['tags']['historic']
        if subcategory == 'yes':
            subcategory = 'general historic site'
        return {'category': 'Historic', 'subcategory': subcategory}
    else:
        return {'category': 'Unknown', 'subcategory': 'Unknown'}

def get_recommendations(lat, lng, radius):
    overpass_url = "https://lz4.overpass-api.de/api/interpreter"

    query = f"""
    [out:json][timeout:15];
    (
        node(around:{radius},{lat},{lng})["tourism"="viewpoint"];
        way(around:{radius},{lat},{lng})["tourism"="viewpoint"];
        relation(around:{radius},{lat},{lng})["tourism"="viewpoint"];
        node(around:{radius},{lat},{lng})["natural"~"peak|volcano|cliff|waterfall|bay|beach|lake|island"];
        way(around:{radius},{lat},{lng})["natural"~"peak|volcano|cliff|waterfall|bay|beach|lake|island"];
        relation(around:{radius},{lat},{lng})["natural"~"peak|volcano|cliff|waterfall|bay|beach|lake|island"];
        node(around:{radius},{lat},{lng})["man_made"="lighthouse"];
        way(around:{radius},{lat},{lng})["man_made"="lighthouse"];
        relation(around:{radius},{lat},{lng})["man_made"="lighthouse"];
        node(around:{radius},{lat},{lng})["man_made"="bridge"]["bridge"~"suspension|cable_stayed|arch|cantilever|truss"];
        way(around:{radius},{lat},{lng})["man_made"="bridge"]["bridge"~"suspension|cable_stayed|arch|cantilever|truss"];
        relation(around:{radius},{lat},{lng})["man_made"="bridge"]["bridge"~"suspension|cable_stayed|arch|cantilever|truss"];
        node(around:{radius},{lat},{lng})["man_made"="bridge"]["layer"~"3|4|5"];
        way(around:{radius},{lat},{lng})["man_made"="bridge"]["layer"~"3|4|5"];
        relation(around:{radius},{lat},{lng})["man_made"="bridge"]["layer"~"3|4|5"];
        node(around:{radius},{lat},{lng})["historic"~"castle|fort"];
        way(around:{radius},{lat},{lng})["historic"~"castle|fort"];
        relation(around:{radius},{lat},{lng})["historic"~"castle|fort"];
    );
    out body center;
    """

    response = requests.get(overpass_url, params={'data': query})
    data = response.json()
    recommendations = []
    names = []
    
    if 'elements' in data:
        for recommendation in data['elements']:
            if 'tags' in recommendation and 'name' in recommendation['tags']:
                if recommendation['tags']['name'].lower() not in names:
                    names.append(recommendation['tags']['name'].lower())
                    lat_coord = recommendation.get('lat') or recommendation.get('center', {}).get('lat')
                    lon_coord = recommendation.get('lon') or recommendation.get('center', {}).get('lon')
                    mapsLink = f"https://www.google.com/maps/search/?api=1&query={lat_coord},{lon_coord}"
                    cats = get_cats(recommendation)
                    recommendations.append({"name":recommendation['tags']['name'], "link":mapsLink, "category":cats['category'], "subcategory":cats['subcategory'], "lat":lat_coord, "lng":lon_coord})


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

    if not recommendations:
        return jsonify({
            'status': 'no_results',
            'message': 'No recommendations found for the specified location and radius.'
        })
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