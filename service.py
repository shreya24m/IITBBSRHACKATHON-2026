import httpx

NASA_KEY = "DEMO_KEY"

async def get_asteroids(date):
    url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={date}&end_date={date}&api_key={NASA_KEY}"

    async with httpx.AsyncClient() as client:
        res = await client.get(url)

    return res.json()

async def get_apod():
    url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_KEY}"

    async with httpx.AsyncClient() as client:
        res = await client.get(url)

    return res.json()