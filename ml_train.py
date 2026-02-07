import tensorflow as tf
from keras import layers, models
from keras.src.legacy.preprocessing.image import ImageDataGenerator
import os

# 1. PRE-PROCESSING & DATA AUGMENTATION
# We rotate and flip images because space has no 'up' or 'down'—this doubles our data!
train_datagen = ImageDataGenerator(
    rescale=1./255,           # Normalize pixel values to 0-1
    rotation_range=90,        
    horizontal_flip=True,
    vertical_flip=True,
    validation_split=0.2      # 20% of your 1,000 images will be used for testing
)

# Load data from your sorted folders
train_generator = train_datagen.flow_from_directory(
    'training_data/',
    target_size=(150, 150),   # Resize images for faster training
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    'training_data/',
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# 2. BUILDING THE CNN ARCHITECTURE
model = models.Sequential([
    # First set of 'eyes': Looks for simple edges/colors
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    layers.MaxPooling2D(2, 2),
    
    # Second set: Looks for more complex shapes
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D(2, 2),
    
    # Third set: Looks for textures (Galaxy spirals vs. Nebula clouds)
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D(2, 2),
    
    # Flattening data to feed into the "decision-making" layers
    layers.Flatten(),
    layers.Dense(512, activation='relu'),
    layers.Dropout(0.5),      # Prevents the model from just 'memorizing' photos
    layers.Dense(len(train_generator.class_indices), activation='softmax')
])

# 3. COMPILING & TRAINING
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

print("🚀 Training starting... This may take 10-15 minutes on a standard laptop.")
model.fit(
    train_generator,
    epochs=10, 
    validation_data=validation_generator
)

# 4. SAVE THE BRAIN
model.save('nasa_model.h5')
print("✅ Done! 'nasa_model.h5' is ready for use in your API.")

