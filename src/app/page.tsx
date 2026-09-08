"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, PieChart as PieChartIcon, History, TrendingUp, Info } from 'lucide-react';

const STRATEGIES = {
  'portfolio_atr': {
    name: 'ATR Momentum (SPY/QQQ)',
    description: 'An intraday momentum breakout strategy focusing on major market indices. It uses a 5-minute timeframe to catch breakouts supported by volume, employing a 3x ATR trailing stop.',
    parameters: 'RSI > 40, Volume > 0.8x avg, Trailing Stop: 3.0x ATR',
    backtest: 'Backtested on 60-day 5m data. Focuses on high win-rate with moderate R/R.'
  },
  'portfolio_eod': {
    name: 'EOD Trend Follower (Swing)',
    description: 'An End-of-Day trend following strategy that holds positions for days to weeks. It enters on 10/50 EMA golden crosses with high ADX trend strength.',
    parameters: 'Fast EMA: 10, Slow EMA: 50, ADX > 25, Trailing Stop: 3.0x ATR',
    backtest: 'Backtested on multi-year daily data. Captures long-term macro trends.'
  },
  'portfolio_atr-micro': {
    name: 'Micro Leveraged ETFs',
    description: 'A high-volatility momentum strategy for small accounts ($500), trading 3x leveraged ETFs (TQQQ/SOXL). It requires extreme intraday momentum to trigger and uses wider stops to survive leveraged chop.',
    parameters: 'RSI > 70, Volume > 1.5x avg, Trailing Stop: 4.0x ATR, Hard Stop: -5%',
    backtest: 'Backtested on 60-day 5m data with high real-world friction (0.40% slippage, $1.30 commissions). Achieved +393% net return.'
  }
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<keyof typeof STRATEGIES>('portfolio_atr');

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p className="text-gray">Loading dashboard...</p>
      </div>
    );
  }

  const { portfolios } = data;
  
  // Extract active portfolio
  const portfolio = portfolios[activeTab] || { cash: 500, positions: [], history: [] };
  const strategyInfo = STRATEGIES[activeTab];

  // Calculate current equity
  const openPositionsValue = (portfolio.positions || []).reduce((acc: number, pos: any) => acc + (pos.current_value || (pos.qty * pos.entryPrice) || 0), 0);
  const currentEquity = (portfolio.cash || 0) + openPositionsValue;
  
  // Calculate initial equity based on portfolio type
  const initialEquity = activeTab === 'portfolio_atr-micro' ? 500 : 5000;
  
  const isPositive = currentEquity >= initialEquity;
  const equityChange = currentEquity - initialEquity;
  const equityChangePercent = (equityChange / initialEquity) * 100;

  // Build chart data from history (trades)
  let chartData: any[] = [];
  const trades = portfolio.history || [];
  const realTrades = trades.filter((t: any) => t.pnl !== undefined);

  if (realTrades.length > 0) {
    let runningEquity = initialEquity;
    chartData.push({ name: 'Start', equity: runningEquity });
    realTrades.forEach((trade: any, i: number) => {
      runningEquity += trade.pnl;
      chartData.push({
        name: `Trade ${i+1}`,
        equity: runningEquity,
        pnl: trade.pnl
      });
    });
  } else {
    // Dummy chart data if no real trades yet
    chartData = Array.from({ length: 30 }).map((_, i) => ({
        name: `Day ${i}`,
        equity: initialEquity + (Math.random() * 200 - 100) + (i * 5)
    }));
  }

  // Calculate stats
  const winCount = realTrades.filter((t: any) => t.pnl > 0).length;
  const winRate = realTrades.length > 0 ? ((winCount / realTrades.length) * 100).toFixed(1) + '%' : 'N/A';
  
  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="logo" style={{ margin: 0 }}>Alphahood</div>
        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', backgroundColor: '#1a1a24', padding: '0.25rem', borderRadius: '8px', border: '1px solid #2a2a35'}}>
          {Object.keys(STRATEGIES).map(key => (
            <button 
              key={key} 
              onClick={() => setActiveTab(key as any)}
              style={{
                padding: '0.5rem 1rem', 
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: activeTab === key ? '#2a2a35' : 'transparent',
                color: activeTab === key ? '#fff' : '#888',
                transition: 'all 0.2s'
              }}
            >
              {STRATEGIES[key as keyof typeof STRATEGIES].name}
            </button>
          ))}
        </div>
      </header>

      <main className="main-grid">
        <div className="chart-section">
          
          <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', padding: '1.5rem' }}>
             <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00c805', fontSize: '1.1rem', marginBottom: '1rem' }}>
              <Info size={20} /> Strategy Intelligence
            </h2>
            <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>{strategyInfo.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#111119', padding: '1rem', borderRadius: '6px' }}>
                <strong style={{color: '#888', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Parameters</strong> 
                <span style={{color: '#fff'}}>{strategyInfo.parameters}</span>
              </div>
              <div style={{ background: '#111119', padding: '1rem', borderRadius: '6px' }}>
                <strong style={{color: '#888', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Backtest Edge</strong> 
                <span style={{color: '#fff'}}>{strategyInfo.backtest}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="portfolio-value">${currentEquity.toFixed(2)}</div>
            <div className={`portfolio-change ${isPositive ? 'text-green' : 'text-red'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              ${Math.abs(equityChange).toFixed(2)} ({Math.abs(equityChangePercent).toFixed(2)}%)
              <span className="text-gray" style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>All Time</span>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%', marginBottom: '2rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)', backgroundColor: '#1e1e2d', color: '#fff' }}
                  labelStyle={{ display: 'none' }}
                  itemStyle={{ color: isPositive ? '#00c805' : '#ff5000', fontWeight: 600 }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Equity']}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="equity" 
                  stroke={isPositive ? '#00c805' : '#ff5000'} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: isPositive ? '#00c805' : '#ff5000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} /> Performance Stats
            </h2>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Win Rate</div>
                <div className="stat-value">{winRate}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Net P&L</div>
                <div className={`stat-value ${isPositive ? 'text-green' : 'text-red'}`}>
                   {isPositive ? '+' : '-'}${Math.abs(equityChange).toFixed(2)}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Trades</div>
                <div className="stat-value">{realTrades.length}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Cash Balance</div>
                <div className="stat-value">${(portfolio.cash || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>

        </div>

        <div className="sidebar">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChartIcon size={20} /> Open Positions
            </h2>
            {portfolio.positions && portfolio.positions.length > 0 ? (
              portfolio.positions.map((pos: any, i: number) => (
                <div className="list-item" key={i}>
                  <div className="list-item-left">
                    <span className="list-item-title">{pos.symbol} {pos.contract_type} {pos.strike}</span>
                    <span className="list-item-subtitle">{pos.contracts || pos.qty || 1} ctrs @ ${(pos.entry_price || pos.entryPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="list-item-right" style={{ textAlign: 'right' }}>
                    <span className="list-item-value">${(pos.current_value || (pos.qty * pos.entryPrice) || 0).toFixed(2)}</span>
                    <span className={(pos.unrealized_pnl || pos.pnl || 0) >= 0 ? 'text-green list-item-subtitle' : 'text-red list-item-subtitle'}>
                      {(pos.unrealized_pnl || pos.pnl || 0) >= 0 ? '+' : ''}{(pos.unrealized_pnl || pos.pnl || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray" style={{ fontSize: '0.875rem' }}>No open positions.</p>
            )}
          </div>

          <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} /> Trade History
            </h2>
            {realTrades.length > 0 ? (
              <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {[...realTrades].reverse().map((trade: any, i: number) => (
                  <div className="list-item" key={i}>
                    <div className="list-item-left">
                      <span className="list-item-title">{trade.symbol} {trade.strike} {trade.contract_type}</span>
                      <span className="list-item-subtitle">{trade.reason || 'Closed'} • {trade.contracts || 1} ctrs</span>
                    </div>
                    <div className="list-item-right" style={{ textAlign: 'right' }}>
                      <span className={`list-item-value ${trade.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                      <span className="list-item-subtitle">
                         {trade.exit_timestamp ? new Date(trade.exit_timestamp).toLocaleDateString() : trade.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray" style={{ fontSize: '0.875rem' }}>No closed trades yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
