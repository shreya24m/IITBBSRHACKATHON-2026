import requests
import mysql.connector
import os
import time
from datetime import datetime, timedelta

# --- SETTINGS ---
API_KEY = "Dy7ip1RgXTL4uVeGHzybkNXMP8qa4EnzqOTaky9H"
IMAGE_DIR = "nasa_dataset_10k"
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "7735073013@2104",
    "database": "nasa_db"
}

if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

def fetch_and_store_range(start, end):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    url = f"https://api.nasa.gov/planetary/apod?api_key={API_KEY}&start_date={start}&end_date={end}"
    
    try:
        response = requests.get(url)
        
        # Handle Rate Limiting (NASA's standard is 1000/hr for registered keys)
        if response.status_code == 429:
            print("🚦 Rate limit exceeded. Waiting 60 seconds...")
            time.sleep(60)
            return

        data = response.json()
        
        for entry in data:
            if entry.get('media_type') == 'image':
                date = entry.get('date')
                title = entry.get('title')
                url_img = entry.get('url')
                expl = entry.get('explanation')

                # 1. Database Entry
                sql = "INSERT IGNORE INTO nasa_apod (title, date, url, explanation) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (title, date, url_img, expl))
                
                # 2. Local Image Save (Necessary for ML Training)
                file_path = os.path.join(IMAGE_DIR, f"{date}.jpg")
                if not os.path.exists(file_path):
                    img_data = requests.get(url_img).content
                    with open(file_path, 'wb') as f:
                        f.write(img_data)
        
        conn.commit()
        print(f"✅ Batch Completed: {start} to {end}")

    except Exception as e:
        print(f"❌ Error at {start}: {e}")
    finally:
        cursor.close()
        conn.close()

# --- THE BIG LOOP (1996 - 2026) ---
current_date = datetime(1996, 1, 1)
end_date = datetime(2026, 2, 7)

while current_date < end_date:
    batch_end = current_date + timedelta(days=30)
    if batch_end > end_date:
        batch_end = end_date
        
    fetch_and_store_range(current_date.strftime('%Y-%m-%d'), batch_end.strftime('%Y-%m-%d'))
    
    current_date = batch_end + timedelta(days=1)
    time.sleep(1) # Small delay to keep the connection stable