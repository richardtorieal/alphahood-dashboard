"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, PieChart as PieChartIcon, History, TrendingUp } from 'lucide-react';

const BACKTEST_DATA = [
  { stopLoss: "-10%", netReturn: "+643.31%", finalEquity: "$37,165.37", winRate: "36.50%", maxDrawdown: "-87.26%", trades: 137 },
  { stopLoss: "-15%", netReturn: "+211.94%", finalEquity: "$15,596.92", winRate: "39.23%", maxDrawdown: "-87.61%", trades: 130 },
  { stopLoss: "-20%", netReturn: "+156.88%", finalEquity: "$12,844.07", winRate: "42.02%", maxDrawdown: "-87.81%", trades: 119 },
  { stopLoss: "-25%", netReturn: "+137.17%", finalEquity: "$11,858.36", winRate: "45.37%", maxDrawdown: "-88.70%", trades: 108 },
  { stopLoss: "-35%", netReturn: "+16.45%", finalEquity: "$5,822.43", winRate: "51.52%", maxDrawdown: "-90.69%", trades: 99 },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

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

  const { portfolio } = data;
  
  // Create realistic chart data if history is empty
  const chartData = portfolio.history.length > 0 ? portfolio.history : [];
  
  const currentEquity = chartData.length > 0 ? chartData[chartData.length - 1].equity : portfolio.cash;
  const initialEquity = chartData.length > 0 ? chartData[0].equity : 500;
  const isPositive = currentEquity >= initialEquity;
  const equityChange = currentEquity - initialEquity;
  const equityChangePercent = (equityChange / initialEquity) * 100;

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Alphahood</div>
        <div>
          <span className="text-gray" style={{ fontSize: '0.875rem' }}>Paper Trading Mode</span>
        </div>
      </header>

      <main className="main-grid">
        <div className="chart-section">
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
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ display: 'none' }}
                  itemStyle={{ color: isPositive ? '#00c805' : '#ff5000', fontWeight: 600 }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Equity']}
                />
                <Line 
                  type="monotone" 
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
              <TrendingUp size={20} /> Strategy Performance
            </h2>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Win Rate</div>
                <div className="stat-value">42.02%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Net P&L</div>
                <div className="stat-value text-green">+$7,344.07</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Max Drawdown</div>
                <div className="stat-value text-red">-87.81%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Trades</div>
                <div className="stat-value">119</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} /> Backtest Stop-Loss Comparison
            </h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stop Loss</th>
                  <th>Net Return</th>
                  <th>Final Equity</th>
                  <th>Win Rate</th>
                  <th>Max DD</th>
                  <th>Trades</th>
                </tr>
              </thead>
              <tbody>
                {BACKTEST_DATA.map((row, i) => (
                  <tr key={i}>
                    <td>{row.stopLoss}</td>
                    <td className={row.netReturn.startsWith('+') ? 'text-green' : 'text-red'}>{row.netReturn}</td>
                    <td>{row.finalEquity}</td>
                    <td>{row.winRate}</td>
                    <td className="text-red">{row.maxDrawdown}</td>
                    <td>{row.trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sidebar">
          <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChartIcon size={20} /> Open Positions
            </h2>
            {portfolio.positions && portfolio.positions.length > 0 ? (
              portfolio.positions.map((pos: any, i: number) => (
                <div className="list-item" key={i}>
                  <div className="list-item-left">
                    <span className="list-item-title">{pos.symbol}</span>
                    <span className="list-item-subtitle">{pos.qty} shares @ ${pos.entryPrice}</span>
                  </div>
                  <div className="list-item-right">
                    <span className="list-item-value">${pos.currentPrice}</span>
                    <span className={pos.pnl >= 0 ? 'text-green list-item-subtitle' : 'text-red list-item-subtitle'}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl}
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
            <div className="list-item">
              <div className="list-item-left">
                <span className="list-item-title">SPY Call 500</span>
                <span className="list-item-subtitle">Sell to Close</span>
              </div>
              <div className="list-item-right">
                <span className="list-item-value text-green">+$145.00</span>
                <span className="list-item-subtitle">May 12</span>
              </div>
            </div>
            <div className="list-item">
              <div className="list-item-left">
                <span className="list-item-title">QQQ Put 400</span>
                <span className="list-item-subtitle">Sell to Close</span>
              </div>
              <div className="list-item-right">
                <span className="list-item-value text-red">-$45.00</span>
                <span className="list-item-subtitle">May 10</span>
              </div>
            </div>
            <div className="list-item">
              <div className="list-item-left">
                <span className="list-item-title">IWM Call 200</span>
                <span className="list-item-subtitle">Sell to Close</span>
              </div>
              <div className="list-item-right">
                <span className="list-item-value text-green">+$85.50</span>
                <span className="list-item-subtitle">May 08</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
