from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import requests

# 1. INITIALIZATION
app = FastAPI(title="PRAVAAH | Deep Space Explorer API")

# Use your actual NASA Key to avoid the 429 rate limits of 'DEMO_KEY'
NASA_API_KEY = "Dy7ip1RgXTL4uVeGHzybkNXMP8qa4EnzqOTaky9H"

# 2. CORS MIDDLEWARE
# Essential for allowing your Live Server (Port 5500) to talk to Port 8001
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. LOAD ML MODEL
try:
    model = tf.keras.models.load_model('nasa_model.h5')
    class_names = ['Galaxy', 'Nebula', 'Planet', 'Star']
    print("✅ NASA Brain Loaded Successfully")
except Exception as e:
    print(f"❌ Error loading nasa_model.h5: {e}. Ensure the file is in the same directory.")

# 4. API ROUTES

@app.get("/")
def read_root():
    """Confirms the API is alive and lists available endpoints"""
    return {
        "status": "online",
        "project": "PRAVAAH",
        "endpoints": ["/predict", "/asteroids", "/apod"]
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Handles image classification using the CNN model"""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image = image.resize((150, 150)) # Matches training resolution
    
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)[0]
    top_idx = np.argmax(predictions)
    
    return {
        "summary": {
            "label": class_names[top_idx],
            "confidence": f"{round(float(predictions[top_idx]) * 100, 2)}%"
        },
        "detailed_scores": {class_names[i]: float(predictions[i]) for i in range(len(class_names))}
    }

@app.get("/asteroids")
async def get_asteroids_data(date: str):
    """Fetches real NASA NeoWs data for 3D visualization"""
    url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={date}&end_date={date}&api_key={NASA_API_KEY}"
    try:
        response = requests.get(url)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/apod")
async def get_apod():
    """Fetches Astronomy Picture of the Day for the UI dashboard"""
    url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
    return requests.get(url).json()

# 5. SERVER LAUNCH
from fastapi import FastAPI
# ... (all your other imports and routes)

app = FastAPI(title="PRAVAAH | Space Explorer API")

# ... (your @app.get and @app.post routes)

if __name__ == "__main__":
    import uvicorn
    # Use a string "filename:app_variable" for reload to work
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)