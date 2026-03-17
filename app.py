from flask import Flask, jsonify, request, session
from flask_cors import CORS
import pickle
import numpy as np

# ================= Load Pickle Files =================
popular_df = pickle.load(open('popular.pkl', 'rb'))
pt         = pickle.load(open('pt.pkl', 'rb'))
books      = pickle.load(open('books.pkl', 'rb'))
similarity_scores = pickle.load(open('similarity_scores.pkl', 'rb'))

# ================= App Setup =================
app = Flask(__name__)
app.secret_key = "recommender_secret"

CORS(app, origins=["http://localhost:3000","http://localhost:3001"], supports_credentials=True)  # allow React dev-server to call Flask

# ================= API: Top 50 Books =================
@app.route('/api/popular')
def api_popular():
    data = []
    for i in range(len(popular_df)):
        data.append({
            "title":  popular_df['Book-Title'].iloc[i],
            "author": popular_df['Book-Author'].iloc[i],
            "image":  popular_df['Image-URL-M'].iloc[i],
            "votes":  int(popular_df['num_ratings'].iloc[i]),
            "rating": round(float(popular_df['avg_ratings'].iloc[i]), 2),
        })
    return jsonify(data)

# ================= API: Recommend =================
@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    body       = request.get_json()
    user_input = body.get('book', '').strip()

    if not user_input or user_input not in pt.index:
        return jsonify({"error": "Book not found. Please try another title."}), 404

    session.setdefault('history', [])
    session.setdefault('feedback', {})
    session['history'].append(user_input)
    session.modified = True

    index = np.where(pt.index == user_input)[0][0]

    similar_items = sorted(
        list(enumerate(similarity_scores[index])),
        key=lambda x: x[1], reverse=True
    )[1:5]

    data     = []
    feedback = session.get('feedback', {})

    for i, score in similar_items:
        book_title      = pt.index[i]
        base_similarity = round(score * 100, 2)

        feedback_boost = 0
        if book_title in feedback:
            feedback_boost = 5 if feedback[book_title] == "like" else -5

        pop = popular_df[popular_df['Book-Title'] == book_title]
        popularity_boost = 0
        if not pop.empty:
            popularity_boost = min(pop['num_ratings'].values[0] / 1000, 5)

        final_score = round(base_similarity + feedback_boost + popularity_boost, 2)

        temp = books[books['Book-Title'] == book_title].drop_duplicates('Book-Title')

        data.append({
            "title":      temp['Book-Title'].values[0],
            "author":     temp['Book-Author'].values[0],
            "image":      temp['Image-URL-M'].values[0],
            "final":      final_score,
            "base":       base_similarity,
            "feedback":   feedback_boost,
            "popularity": round(popularity_boost, 2),
            "why":        "Recommended based on users with similar taste",
        })

    return jsonify(data)

# ================= API: Feedback =================
@app.route('/api/feedback', methods=['POST'])
def api_feedback():
    body   = request.get_json()
    book   = body.get('book')
    action = body.get('action')   # "like" | "dislike"

    session.setdefault('feedback', {})
    session['feedback'][book] = action
    session.modified = True

    return jsonify({"ok": True})

# ================= API: Book Titles (autocomplete) =================
@app.route('/api/titles')
def api_titles():
    return jsonify(list(pt.index))

# ================= Run =================
if __name__ == '__main__':
    app.run(debug=True, port=5000)