import os
import requests
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression
from datetime import timedelta

# Load API Keys
load_dotenv()
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

app = FastAPI()

# Allow React to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/market/{symbol}")
def get_market_data(symbol: str):
    # 1. Fetch Historical Data from Alpha Vantage
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
    response = requests.get(url)
    data = response.json()

    if "Time Series (Daily)" not in data:
        raise HTTPException(status_code=400, detail="Failed to fetch market data. Check API keys or limit.")

    time_series = data["Time Series (Daily)"]
    market_data = []
    
    # Grab the last 30 days of data
    dates = list(time_series.keys())[:30]
    dates.reverse() # Sort chronologically (oldest to newest)

    for date in dates:
        market_data.append({
            "date": date,
            "price": round(float(time_series[date]["4. close"]), 2)
        })

    # 2. MACHINE LEARNING: Predict the next 5 days
    if len(market_data) > 1:
        df = pd.DataFrame(market_data)
        df['date'] = pd.to_datetime(df['date'])
        df['days_since'] = (df['date'] - df['date'].min()).dt.days
        
        X = df[['days_since']]
        y = df['price']
        
        # Train AI Model
        model = LinearRegression()
        model.fit(X.values, y)
        
        last_date = df['date'].max()
        last_day_since = df['days_since'].max()
        
        future_data = []
        for i in range(1, 6):
            next_day_since = last_day_since + i
            next_date = last_date + timedelta(days=i)
            predicted_price = model.predict([[next_day_since]])[0]
            
            future_data.append({
                "date": next_date.strftime('%Y-%m-%d'),
                "prediction": round(predicted_price, 2)
            })
            
        # Combine past data with future predictions
        return market_data + future_data

    return market_data


@app.get("/api/news/{symbol}")
def get_news(symbol: str):
    # Fetch News
    url = f"https://newsapi.org/v2/everything?q={symbol}&sortBy=publishedAt&language=en&apiKey={NEWS_API_KEY}"
    response = requests.get(url)
    data = response.json()

    if "articles" not in data:
        return []

    articles = data["articles"][:10]
    news_feed = []

    # Simple Keyword Sentiment Analysis
    positive_words = ['surge', 'jump', 'grow', 'gain', 'beat', 'up', 'high', 'buy', 'upgrade']
    negative_words = ['drop', 'fall', 'plunge', 'miss', 'down', 'low', 'sell', 'downgrade', 'lawsuit']

    for article in articles:
        title = article.get("title", "").lower()
        
        sentiment = "Neutral"
        if any(word in title for word in positive_words):
            sentiment = "Positive"
        elif any(word in title for word in negative_words):
            sentiment = "Negative"

        news_feed.append({
            "title": article.get("title"),
            "url": article.get("url"),
            "source": article.get("source", {}).get("name"),
            "sentiment": sentiment
        })

    return news_feed