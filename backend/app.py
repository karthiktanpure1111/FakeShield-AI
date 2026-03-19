from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow React connection

model = load_model("model.h5")

def preprocess(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route('/')
def home():
    return "Backend Running"
@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['file']
        image = Image.open(file).convert("RGB")  # ✅ FIX

        img = preprocess(image)
        pred = model.predict(img)[0][0]

        print("Raw prediction:", pred)

        result = "Real" if pred > 0.5 else "Fake"

        return jsonify({"prediction": result})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Invalid image"}), 400
if __name__ == "__main__":
    app.run(debug=True)