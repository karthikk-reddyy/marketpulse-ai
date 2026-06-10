import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, Activity, Bot } from 'lucide-react';

export default function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const marketRes = await fetch(`http://127.0.0.1:5000/api/market/${symbol}`);
      if (!marketRes.ok) throw new Error("Failed to fetch market data.");
      const marketJson = await marketRes.json();
      
      const newsRes = await fetch(`http://127.0.0.1:5000/api/news/${symbol}`);
      if (!newsRes.ok) throw new Error("Failed to fetch news data.");
      const newsJson = await newsRes.json();

      setMarketData(marketJson);
      setNewsData(newsJson);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(ticker);
  }, [ticker]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="text-blue-500" /> MarketPulse AI
          </h1>
          <p className="text-slate-400">Real-time tracking & predictive modeling</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-96 bg-slate-800 rounded-lg p-1 border border-slate-700 focus-within:border-blue-500 transition-colors">
          <input 
            type="text" 
            placeholder="Search ticker (e.g., TSLA, MSFT)..."
            className="bg-transparent w-full p-2 outline-none text-white uppercase placeholder:normal-case"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors flex items-center">
            <Search size={18} />
          </button>
        </form>
      </header>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-8 text-center">
          {error} <br/> 
          <span className="text-sm opacity-80">Make sure your Python server is running and your .env file has valid API keys!</span>
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                {ticker} <span className="text-slate-300 text-xl font-medium">Historical & AI Forecast</span>
              </h2>
              {loading && <span className="text-sm text-slate-400 animate-pulse">Running ML Model...</span>}
            </div>
            
            <div className="h-96 w-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700 animate-pulse">
                  <Bot className="animate-bounce text-purple-500 mr-2" /> Training Model...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#60a5fa' }} />
                    
                    {/* Real Historical Data Line */}
                    <Line type="monotone" dataKey="price" name="Actual Price" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                    
                    {/* Machine Learning Prediction Line */}
                    <Line type="monotone" dataKey="prediction" name="AI Forecast" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-4 flex gap-4 text-sm justify-center">
               <span className="flex items-center gap-1 text-blue-400"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Past 30 Days</span>
               <span className="flex items-center gap-1 text-purple-400"><div className="w-3 h-3 bg-purple-500 rounded-full border border-purple-300 border-dashed"></div> 5-Day Forecast</span>
            </div>
          </div>

          {/* News Section */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col h-[500px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-700 pb-4">
              Live Sentiment Feed
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-700 animate-pulse rounded-lg"></div>
                ))
              ) : newsData.length === 0 ? (
                <p className="text-slate-400 text-center mt-10">No recent news found for {ticker}.</p>
              ) : (
                newsData.map((article, index) => (
                  <a key={index} href={article.url} target="_blank" rel="noreferrer" className="block p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="text-xs text-slate-400 font-semibold uppercase">{article.source}</span>
                      {article.sentiment === 'Positive' && <span className="bg-green-900/80 text-green-300 text-xs px-2 py-1 rounded border border-green-700 flex items-center gap-1"><TrendingUp size={12}/> Pos</span>}
                      {article.sentiment === 'Negative' && <span className="bg-red-900/80 text-red-300 text-xs px-2 py-1 rounded border border-red-700 flex items-center gap-1"><TrendingDown size={12}/> Neg</span>}
                      {article.sentiment === 'Neutral' && <span className="bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded border border-slate-500">Neutral</span>}
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2">{article.title}</h3>
                  </a>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}