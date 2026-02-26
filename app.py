from flask import Flask, render_template, request, session
import pickle
import numpy as np

# ================= Load Pickle Files =================
popular_df = pickle.load(open('popular.pkl', 'rb'))
pt = pickle.load(open('pt.pkl', 'rb'))
books = pickle.load(open('books.pkl', 'rb'))
similarity_scores = pickle.load(open('similarity_scores.pkl', 'rb'))

# ================= App Setup =================
app = Flask(__name__)
app.secret_key = "recommender_secret"

# ================= Helper: Similar Users =================
def get_top_similar_users(book_title, top_n=3):
    idx = np.where(pt.index == book_title)[0][0]
    sims = sorted(
        list(enumerate(similarity_scores[idx])),
        key=lambda x: x[1],
        reverse=True
    )[1:top_n+1]

    return [
        {
            "user_id": f"User {i}",
            "similarity": round(score * 100, 2)
        }
        for i, score in sims
    ]

# ================= Home =================
@app.route('/')
def index():
    return render_template(
        'index.html',
        book_name=list(popular_df['Book-Title']),
        author=list(popular_df['Book-Author']),
        image=list(popular_df['Image-URL-M']),
        votes=list(popular_df['num_ratings']),
        rating=list(popular_df['avg_ratings'])
    )

# ================= Recommend UI =================
@app.route('/recommend')
def recommend_ui():
    return render_template('recommend.html')

# ================= Recommend Logic =================
# ================= Recommend Logic =================
@app.route('/recommend_books', methods=['POST'])
def recommend_books():
    user_input = request.form.get('user_input')

    if not user_input or user_input not in pt.index:
        return render_template('recommend.html', error="Invalid book name")

    session.setdefault('history', [])
    session.setdefault('feedback', {})

    session['history'].append(user_input)
    session.modified = True

    index = np.where(pt.index == user_input)[0][0]

    similar_items = sorted(
        list(enumerate(similarity_scores[index])),
        key=lambda x: x[1],
        reverse=True
    )[1:5]

    data = []
    feedback = session['feedback']

    for i, score in similar_items:
        book_title = pt.index[i]

        # ---------------- Core Similarity ----------------
        base_similarity = round(score * 100, 2)

        # ---------------- Feedback Boost ----------------
        feedback_boost = 0
        if book_title in feedback:
            if feedback[book_title] == "like":
                feedback_boost = 5
            elif feedback[book_title] == "dislike":
                feedback_boost = -5

        # ---------------- Popularity Boost ----------------
        pop = popular_df[popular_df['Book-Title'] == book_title]
        popularity_boost = 0
        if not pop.empty:
            popularity_boost = min(pop['num_ratings'].values[0] / 1000, 5)

        # ---------------- Final Score ----------------
        final_score = round(base_similarity + feedback_boost + popularity_boost, 2)

        temp = books[books['Book-Title'] == book_title].drop_duplicates('Book-Title')

        data.append({
            "title": temp['Book-Title'].values[0],
            "author": temp['Book-Author'].values[0],
            "image": temp['Image-URL-M'].values[0],
            "final": final_score,
            "base": base_similarity,
            "feedback": feedback_boost,
            "popularity": round(popularity_boost, 2),
            "why": "Recommended based on users with similar taste"
        })

    return render_template('recommend.html', data=data)

# ================= Feedback =================
@app.route('/feedback', methods=['POST'])
def feedback():
    book = request.form.get('book')
    action = request.form.get('action')

    session.setdefault('feedback', {})
    session['feedback'][book] = action
    session.modified = True

    return ("", 204)

# ================= Run =================
if __name__ == '__main__':
    app.run(debug=True)