import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const defaultSubreddits = [
  "r/india", "r/startups", "r/entrepreneur", "r/ProductManagement", "r/technology",
  "r/business", "r/marketing", "r/SideProject", "r/webdev", "r/programming",
  "r/investing", "r/personalfinance", "r/fintech", "r/IndiaInvestments", "r/mildlyinfuriating",
  "r/LifeAdvice", "r/AskIndia", "r/bangalore", "r/delhi", "r/mumbai",
  "r/datascience", "r/MachineLearning", "r/artificial", "r/ChatGPT", "r/gaming",
  "r/androiddev", "r/iOSProgramming", "r/reactjs", "r/node", "r/devops"
];

const formatDate = (utcTimestamp) => {
  try {
    return formatDistanceToNow(new Date(utcTimestamp * 1000), { addSuffix: true });
  } catch {
    return "Unknown date";
  }
};

const ResultCard = ({ result }) => {
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  const getSentimentText = (ratio) => {
    if (ratio === null || ratio === undefined) return { text: "Neutral", bg: "bg-gray-100 text-gray-700" };
    if (ratio >= 0.80) return { text: "Positive", bg: "bg-green-100 text-green-800" };
    if (ratio < 0.50) return { text: "Negative", bg: "bg-red-100 text-red-800" };
    return { text: "Neutral", bg: "bg-gray-100 text-gray-700" };
  };

  const sentiment = getSentimentText(result.upvote_ratio);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="font-semibold text-primary bg-blue-50 px-3 py-1 rounded-full text-xs tracking-wide">
          {result.subreddit}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${sentiment.bg}`}>
          {sentiment.text}
        </span>
      </div>

      <a href={result.permalink} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-gray-900 hover:text-primary transition-colors block mb-4 leading-tight">
        {result.title}
      </a>
      <div>{result.selftext}</div>

      <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-gray-500 mb-2">
        <span className="flex items-center gap-1.5" title="Upvotes">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          {result.score}
        </span>
        <span className="flex items-center gap-1.5" title="Comments">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {result.num_comments}
        </span>
        <span className="flex items-center gap-1.5" title="Posted">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(result.created_utc)}
        </span>
      </div>

      {result.topComments && result.topComments.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <button
            onClick={() => setCommentsExpanded(!commentsExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors focus:outline-none"
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${commentsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {commentsExpanded ? 'Hide comments' : 'Show comments'}
          </button>

          {commentsExpanded && (
            <div className="mt-4 space-y-3">
              {result.topComments.map((comment, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-gray-300">
                  <div className="text-gray-700 text-sm mb-3">{comment.body}</div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                    <span>u/{comment.author}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      </svg>
                      {comment.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  const [keyword, setKeyword] = useState("");
  const [subreddits, setSubreddits] = useState(defaultSubreddits);

  // Initialize all predefined subreddits as checked
  const [selectedSubreddits, setSelectedSubreddits] = useState(
    defaultSubreddits.reduce((acc, sub) => ({ ...acc, [sub]: true }), {})
  );

  const [customSub, setCustomSub] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]); // Empty array for now
  const [isLoading, setIsLoading] = useState(false);
  const [currentScanSub, setCurrentScanSub] = useState("");

  // State to freeze the searched keyword and selected count when search is performed
  const [searchMeta, setSearchMeta] = useState({ keyword: "", count: 0 });
  const [sortBy, setSortBy] = useState("recent"); // 'recent' or 'upvoted'

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const toggleSubreddit = (sub) => {
    setSelectedSubreddits(prev => ({
      ...prev,
      [sub]: !prev[sub]
    }));
  };

  const addCustomSubreddit = (e) => {
    e.preventDefault();
    const sub = customSub.trim();
    if (!sub) return;

    // Auto-prefix with r/ if missing, simple logic
    const formattedSub = sub.startsWith("r/") ? sub : `r/${sub}`;

    if (!subreddits.includes(formattedSub)) {
      setSubreddits([formattedSub, ...subreddits]);
    }

    // Automatically select the newly added subreddit
    setSelectedSubreddits(prev => ({
      ...prev,
      [formattedSub]: true
    }));

    setCustomSub("");
  };

  const selectAll = () => {
    const allSelected = subreddits.reduce((acc, sub) => ({ ...acc, [sub]: true }), {});
    setSelectedSubreddits(allSelected);
  };

  const deselectAll = () => {
    const noneSelected = subreddits.reduce((acc, sub) => ({ ...acc, [sub]: false }), {});
    setSelectedSubreddits(noneSelected);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    // Disable search button and clear existing state
    setIsLoading(true);
    setHasSearched(false);
    setResults([]);

    const activeSubreddits = Object.keys(selectedSubreddits).filter(sub => selectedSubreddits[sub]);
    const selectedCount = activeSubreddits.length;

    if (selectedCount === 0) {
      setIsLoading(false);
      return;
    }

    setSearchMeta({
      keyword: keyword.trim(),
      count: selectedCount
    });

    let allResults = [];

    for (let i = 0; i < activeSubreddits.length; i++) {
      const sub = activeSubreddits[i];
      const cleanSub = sub.replace(/^r\//, '');
      setCurrentScanSub(cleanSub);

      try {
        const url = `https://www.reddit.com/r/${cleanSub}/search.json?q=${encodeURIComponent(keyword)}&sort=new&limit=25&restrict_sr=1`;
        console.log(url);
        const response = await fetch(url, {
          headers: {
            "User-Agent": "my-app"
          }
        });
        console.log(response.ok);



        if (!response.ok) {
          console.error(`Failed to fetch from ${cleanSub}: ${response.status}`);
        } else {
          const data = await response.json();
          const posts = data.data.children;

          for (const post of posts) {
            const p = post.data;
            let topComments = [];

            // Only fetch comments if there are any
            if (p.num_comments > 0) {
              try {
                const postUrl = `https://www.reddit.com${p.permalink}.json`;
                const postResponse = await fetch(postUrl);
                if (postResponse.ok) {
                  const postData = await postResponse.json();
                  if (postData.length > 1 && postData[1].data.children.length > 0) {
                    const commentsData = postData[1].data.children
                      .filter(c => c.kind === 't1') // Filter out "more" elements
                      .map(c => c.data)
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3);

                    topComments = commentsData.map(c => ({
                      body: c.body,
                      score: c.score,
                      author: c.author
                    }));
                  }
                }
              } catch (commentErr) {
                console.error(`Failed to fetch comments for ${p.title}`, commentErr);
              }
            }

            allResults.push({
              id: p.id,
              selftext: p.selftext,
              title: p.title,
              subreddit: `r/${p.subreddit}`,
              score: p.score,
              created_utc: p.created_utc,
              permalink: `https://www.reddit.com${p.permalink}`,
              num_comments: p.num_comments,
              upvote_ratio: p.upvote_ratio,
              topComments: topComments
            });
          }
        }
      } catch (err) {
        console.error(`Error processing ${sub}:`, err);
      }

      // Delay to respect rate limits, unless it's the last iteration
      if (i < activeSubreddits.length - 1) {
        await sleep(1000);
      }
    }

    setResults(allResults);
    setIsLoading(false);
    setHasSearched(true);
  };

  // Sort the results based on current selection
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.created_utc - a.created_utc;
    } else {
      return b.score - a.score;
    }
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary selection:text-white flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-gray-100 py-4 px-4 md:px-12 flex flex-col sm:flex-row items-center justify-between bg-white sticky top-0 z-10 w-full">
        <div className="flex items-center space-x-3">
          <img src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png" alt="Reddit Logo" className="w-8 h-8 rounded-full shadow-sm" />
          <h1 className="text-2xl font-bold text-primary tracking-tight">SubScan</h1>
        </div>
        <p className="text-gray-500 font-medium text-sm mt-2 sm:mt-0 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          What is Reddit saying about your brand?
        </p>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        {/* Search Section */}
        <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 p-5 md:p-10 space-y-8 transition-all w-full">

          {/* Keyword Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Target Keyword</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter a keyword, brand, or topic..."
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400 font-medium transition-all"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Subreddits */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-gray-800">Select Subreddits ({Object.values(selectedSubreddits).filter(Boolean).length})</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={selectAll} className="text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">Select All</button>
                <button type="button" onClick={deselectAll} className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors">Deselect All</button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[12rem] max-h-72 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                {subreddits.map(sub => (
                  <label key={sub} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!selectedSubreddits[sub]}
                        onChange={() => toggleSubreddit(sub)}
                        className="peer h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                      />
                    </div>
                    <span className={`text-sm tracking-wide transition-colors truncate ${selectedSubreddits[sub] ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {sub}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Add custom subreddit */}
            <form onSubmit={addCustomSubreddit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-medium sm:text-sm">r/</span>
                </div>
                <input
                  type="text"
                  placeholder="AskReddit"
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                  value={customSub}
                  onChange={e => setCustomSub(e.target.value.replace(/^r\//, ''))}
                />
              </div>
              <button
                type="submit"
                disabled={!customSub.trim()}
                className="px-5 py-2.5 bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors"
                title="+ Add custom subreddit"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSearch}
              disabled={!keyword.trim() || Object.values(selectedSubreddits).filter(Boolean).length === 0 || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-4 bg-primary hover:bg-[#154360] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all outline-none focus:ring-4 focus:ring-blue-500/30"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Scanning r/{currentScanSub}...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Scan Reddit</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Loading Skeletons */}
        {isLoading && !hasSearched && (
          <section className="mt-14 space-y-6 animate-in fade-in duration-500 w-full">
            <div className="h-8 bg-gray-200 rounded-md w-2/3 md:w-1/3 animate-pulse mb-8"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Results Section */}
        {hasSearched && !isLoading && (
          <section className="mt-10 md:mt-14 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-5 border-b border-gray-100 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                <span className="text-primary">{results.length}</span> mentions found for <br className="hidden md:block" />
                <span className="text-primary">"{searchMeta.keyword}"</span> across <span className="text-primary">{searchMeta.count}</span> subreddits
              </h2>

              <div className="flex items-center bg-gray-100/80 p-1.5 rounded-lg border border-gray-200/60 shrink-0">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${sortBy === 'recent' ? 'bg-white shadow-sm text-gray-900 border border-black/5' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setSortBy('upvoted')}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${sortBy === 'upvoted' ? 'bg-white shadow-sm text-gray-900 border border-black/5' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Most Upvoted
                </button>
              </div>
            </div>

            {sortedResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed">
                <div className="w-16 h-16 mb-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No mentions found</h3>
                <p className="text-gray-500 text-center max-w-sm font-medium">Try broader keywords or add more subreddits.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedResults.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-50 border-t border-gray-200 py-6 mt-10">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500 font-medium tracking-wide">
          SubScan &mdash; Built by Aman Bagrecha | Data sourced from Reddit's public API
        </div>
      </footer>
    </div>
  );
}

export default App;
