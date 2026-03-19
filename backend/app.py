import json, sqlite3, datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict_disease
from firstaid import get_first_aid

DB_PATH = "data.db"

app = Flask(__name__)
CORS(app)

# --- DB Setup ---
def query_db(query, args=(), one=False):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(query, args)
        rv = cur.fetchall()
        conn.commit()
    return (rv[0] if rv else None) if one else rv

def init_db():
    query_db('''CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        symptoms TEXT,
        disease TEXT,
        confidence REAL,
        created_at TEXT
    )''')

    
    query_db('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at TEXT
    )''')

init_db()

@app.route("/")
def home():
    return jsonify({"message": "Backend is running and DB initialized."})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        name = data.get("name", "Unknown")
        age = data.get("age", 0)

        # dynamic symptoms list with severity
        symptoms = data.get("symptoms", [])  

        # vitals
        vitals = {
            "body_temp": data.get("body_temp"),
            "heart_rate": data.get("heart_rate"),
            "blood_pressure_sys": data.get("blood_pressure_sys"),
            "blood_pressure_dia": data.get("blood_pressure_dia"),
            "blood_sugar": data.get("blood_sugar"),
            "oxygen_level": data.get("oxygen_level")
        }

        # dynamic prediction (from model.py)
        disease, confidence = predict_disease(symptoms, vitals)

        # dynamic first aid
        first_aid = get_first_aid(disease)

        created_at = datetime.datetime.utcnow().isoformat()

        # store in DB
        query_db(
            "INSERT INTO history (name, age, symptoms, disease, confidence, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (name, age, json.dumps(symptoms), disease, confidence, created_at)
        )

        last_id = query_db("SELECT last_insert_rowid() as id", one=True)["id"]

        return jsonify({
            "id": last_id,
            "name": name,
            "age": age,
            "symptoms": symptoms,
            "vitals": vitals,
            "prediction": disease,
            "confidence": f"{confidence*100:.0f}%",
            "first_aid": first_aid,
            "created_at": created_at
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/history", methods=["GET"])
def history():
    try:
        name = request.args.get("name")
        rows = query_db(
            "SELECT * FROM history {} ORDER BY id DESC".format("WHERE name=?" if name else ""),
            (name,) if name else ()
        )

        results = [{
            "id": r["id"],
            "name": r["name"],
            "age": r["age"],
            "symptoms": json.loads(r["symptoms"] or "[]"),
            "prediction": r["disease"],
            "confidence": r["confidence"],
            "created_at": r["created_at"]
        } for r in rows]

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/history/<int:rec_id>", methods=["GET"])
def history_by_id(rec_id):
    try:
        r = query_db("SELECT * FROM history WHERE id=?", (rec_id,), one=True)
        if not r:
            return jsonify({"error": "Record not found"}), 404
        return jsonify({
            "id": r["id"], "name": r["name"], "age": r["age"],
            "symptoms": json.loads(r["symptoms"] or "[]"),
            "prediction": r["disease"], "confidence": r["confidence"],
            "created_at": r["created_at"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

from werkzeug.security import generate_password_hash, check_password_hash

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True)
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"error": "All fields required"}), 400

        # check if user already exists
        existing = query_db("SELECT * FROM users WHERE email=?", (email,), one=True)
        if existing:
            return jsonify({"error": "User already exists"}), 409

        password_hash = generate_password_hash(password)
        created_at = datetime.datetime.utcnow().isoformat()

        query_db(
            "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (username, email, password_hash, created_at)
        )

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        email = data.get("email")
        password = data.get("password")

        user = query_db("SELECT * FROM users WHERE email=?", (email,), one=True)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid password"}), 401

        return jsonify({"message": "Login successful", "username": user["username"]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
