import os
import hashlib
import hmac
import base64
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
try:
    from tensorflow.keras.models import load_model
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False
    print("Warning: TensorFlow not installed. Model predictions will use random fallback.")
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

# ==========================================
# DATABASE CONFIGURATION (DEPLOYMENT READY)
# ==========================================
# If deployed (e.g. Render/Heroku), it uses the secure 'DATABASE_URL' Cloud URL.
# If running locally on your PC, it defaults to the file 'users.db'.
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
SECRET_KEY = os.environ.get('SECRET_KEY', 'super_secret_ai_key_do_not_share')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    tokens = db.Column(db.Integer, default=50)
    is_google = db.Column(db.Integer, default=0)

# Create the database tables if they don't exist yet
with app.app_context():
    db.create_all()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_jwt(user_id):
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip('=')
    payload = base64.urlsafe_b64encode(json.dumps({"user_id": user_id}).encode()).decode().rstrip('=')
    signature = base64.urlsafe_b64encode(hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()).decode().rstrip('=')
    return f"{header}.{payload}.{signature}"

def verify_jwt(token):
    try:
        parts = token.split('.')
        if len(parts) != 3: return None
        header, payload, signature = parts
        expected_sig = base64.urlsafe_b64encode(hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()).decode().rstrip('=')
        if hmac.compare_digest(signature, expected_sig):
            decoded_payload = json.loads(base64.urlsafe_b64decode(payload + '==').decode())
            return decoded_payload.get('user_id')
    except Exception:
        pass
    return None

def get_user(token):
    if not token or not token.startswith('Bearer '):
        return None
    user_id = verify_jwt(token.split(' ')[1])
    if not user_id:
        return None
    user = User.query.get(user_id)
    if user:
        return {"id": user.id, "email": user.email, "tokens": user.tokens}
    return None

# ==========================================
# ML MODEL SETUP
# ==========================================
try:
    if HAS_TENSORFLOW:
        model = load_model("model.h5")
    else:
        model = None
except Exception as e:
    print("Warning: Could not load model.h5:", e)
    model = None

def preprocess(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# ==========================================
# API ROUTES
# ==========================================
@app.route('/')
def home():
    return "AI Detector Backend Running"

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
        
    new_user = User(email=email, password_hash=hash_password(password), tokens=50, is_google=0)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"token": create_jwt(new_user.id), "tokens": 50, "email": email})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email, is_google=0).first()
    if user and user.password_hash == hash_password(password):
        return jsonify({"token": create_jwt(user.id), "tokens": user.tokens, "email": email})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/google-login', methods=['POST'])
def google_login():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email, tokens=50, is_google=1)
        db.session.add(user)
        db.session.commit()
        
    return jsonify({"token": create_jwt(user.id), "tokens": user.tokens, "email": email})

@app.route('/api/me', methods=['GET'])
def me():
    user = get_user(request.headers.get('Authorization'))
    if user:
        return jsonify(user)
    return jsonify({"error": "Unauthorized"}), 401

@app.route('/api/buy', methods=['POST'])
def buy():
    user_data = get_user(request.headers.get('Authorization'))
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401
        
    amount = request.json.get('tokens', 0)
    user = User.query.get(user_data['id'])
    user.tokens += amount
    db.session.commit()
    
    return jsonify({"success": True, "new_tokens": user.tokens})

@app.route('/predict', methods=['POST'])
def predict():
    user_data = get_user(request.headers.get('Authorization'))
    if not user_data:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        is_video = 'video' in file.mimetype
        cost = 25 if is_video else 10
        
        user = User.query.get(user_data['id'])
        if user.tokens < cost:
            return jsonify({"error": f"Insufficient tokens! Need {cost}."}), 403

        if is_video:
            pred = np.random.uniform(0, 1) # Mock video
        else:
            image = Image.open(file).convert("RGB")
            img = preprocess(image)
            pred = model.predict(img)[0][0] if model else np.random.uniform(0, 1)

        result = "Real" if pred > 0.5 else "Fake"
        
        # Deduct cost
        user.tokens -= cost
        db.session.commit()
        
        return jsonify({
            "prediction": result,
            "cost": cost,
            "tokens_remaining": user.tokens,
            "confidence": float(pred)
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Error processing media"}), 400

if __name__ == "__main__":
    app.run(debug=True)