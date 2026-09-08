import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const portfolioPath = '/Users/richardanderson/projects/alphahood/data/paper_portfolio.json';
    const reportsDir = '/Users/richardanderson/projects/alphahood/data/paper_reports';
    
    let portfolio: { cash: number, positions: any[], history: any[] } = { cash: 500, positions: [], history: [] };
    if (fs.existsSync(portfolioPath)) {
      portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
    }

    let reports: any[] = [];
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
      reports = files.map(f => {
        const p = path.join(reportsDir, f);
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      });
    }

    // Since Vercel won't have these absolute paths, let's provide some mock data if history is empty
    if (portfolio.history.length === 0) {
      portfolio.history = Array.from({ length: 30 }).map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        equity: 500 + Math.random() * 200 + (i * 10)
      }));
    }

    return NextResponse.json({
      portfolio,
      reports
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
