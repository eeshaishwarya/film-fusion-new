from flask import Flask, request, jsonify
import pandas as pd
import json
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# TMDb API key — replace with your own key
TMDB_API_KEY = "78ebf86582d69ef98354742f26678646"

# Load dataset
df = pd.read_csv('../src/data/tmdb_5000_movies.csv')

def parse_json(column):
    def safe_parse(val):
        if isinstance(val, list):
            return val
        if pd.isnull(val):
            return []
        try:
            return json.loads(val.replace("'", '"'))
        except json.JSONDecodeError:
            print(f"Skipping invalid JSON: {val[:100]}")
            return []
    return column.apply(safe_parse)

def combine_features(row):
    genres = ' '.join([genre['name'] for genre in row['genres']]) if row['genres'] else ''
    keywords = ' '.join([keyword['name'] for keyword in row['keywords']]) if row['keywords'] else ''
    return f"{genres} {keywords}"

def fetch_poster(title):
    try:
        url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={title}"
        response = requests.get(url)
        data = response.json()
        if data.get("results"):
            poster_path = data["results"][0].get("poster_path")
            if poster_path:
                return f"https://image.tmdb.org/t/p/w500{poster_path}"
    except Exception as e:
        print(f"Error fetching poster for {title}: {e}")
    return "/images/placeholder.jpg"

def get_recommendations(movie_title, df, top_n=5):
    df['genres'] = parse_json(df['genres'])
    df['keywords'] = parse_json(df['keywords'])
    df['combined_features'] = df.apply(combine_features, axis=1)

    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['combined_features'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    indices = df[df['title'].str.lower() == movie_title.lower()].index
    if len(indices) == 0:
        return []

    idx = indices[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_indices = [i[0] for i in sim_scores[1:top_n + 1]]

    results = df.iloc[sim_indices][['title']].to_dict('records')
    for movie in results:
        movie['poster'] = fetch_poster(movie['title'])
    return results

@app.route("/recommend", methods=["GET"])
def recommend():
    movie1 = request.args.get("movie1")
    movie2 = request.args.get("movie2")

    if not movie1 or not movie2:
        return jsonify({"error": "Both movie titles are required"}), 400

    recs1 = get_recommendations(movie1, df, 5)
    recs2 = get_recommendations(movie2, df, 5)
    combined = recs1 + [r for r in recs2 if r not in recs1]
    unique = [r for r in combined if r['title'].lower() not in [movie1.lower(), movie2.lower()]]

    return jsonify(unique[:10])

if __name__ == "__main__":
    app.run(port=5001, debug=True)