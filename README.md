# 📈 MarketPulse AI - Full-Stack Financial Dashboard

MarketPulse AI is a real-time financial tracking dashboard that combines historical stock market data with live sentiment analysis. It consumes external APIs, processes nested data structures, and serves a dynamic, responsive UI.

## 🚀 Live Demo
*(Coming soon: I am deploying this to Vercel and Render shortly!)*

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS v4, Recharts
* **Backend:** Python, FastAPI, Uvicorn
* **APIs Used:** Alpha Vantage (Market Data), NewsAPI (Sentiment & Articles)

## 💡 Key Features
* **Real-Time Data Pipeline:** Built an asynchronous Python proxy server to securely fetch, clean, and format live financial data.
* **Algorithmic Sentiment Tagging:** Implemented logic to scan recent news article headlines and categorize market sentiment as Positive, Negative, or Neutral.
* **Dynamic Visualizations:** Engineered a responsive React UI featuring interactive time-series line charts that update instantly based on user search queries.

## 💻 Local Setup
1. Clone the repository: `git clone https://github.com/YOUR_USERNAME/marketpulse-ai.git`
2. Setup the Python Backend:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --port 5000 --reload
