import tensorflow as tf
from PIL import Image
import numpy as np
import io

model = tf.keras.models.load_model("nasa_model.h5")
class_names = ['Galaxy', 'Nebula', 'Planet', 'Star']

async def predict_image(file):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image = image.resize((150,150))

    img = np.array(image)/255.0
    img = np.expand_dims(img, axis=0)

    predictions = model.predict(img)[0]

    results = {class_names[i]: float(predictions[i])
               for i in range(len(class_names))}

    return {
        "label": class_names[np.argmax(predictions)],
        "confidence": float(np.max(predictions)),
        "scores": results
    }