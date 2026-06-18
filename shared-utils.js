// ============================================
// RSC TRADING JOURNAL - SHARED UTILITIES
// ============================================

const TRADERS = ['Nassim', 'Noa', 'Joseph', 'Owen', 'Tom'];
const PAIRS = ['EUR/USD','GBP/USD','USD/JPY','AUD/USD','EUR/JPY','GBP/JPY','USD/CHF','USD/CAD','EUR/GBP','AUD/JPY'];

// ============================================
// STORAGE - localStorage avec sync temps réel
// ============================================

class StorageManager {
  static loadTrades(trader) {
    try {
      return JSON.parse(localStorage.getItem(`rsc_trades_${trader}`) || '[]');
    } catch(e) {
      return [];
    }
  }

  static saveTrades(trader, trades) {
    try {
      localStorage.setItem(`rsc_trades_${trader}`, JSON.stringify(trades));
      this.notifyUpdate('trades', trader);
    } catch(e) {
      console.error('Storage error:', e);
    }
  }

  static loadBacktests(trader) {
    try {
      return JSON.parse(localStorage.getItem(`rsc_backtests_${trader}`) || '[]');
    } catch(e) {
      return [];
    }
  }

  static saveBacktests(trader, backtests) {
    try {
      localStorage.setItem(`rsc_backtests_${trader}`, JSON.stringify(backtests));
      this.notifyUpdate('backtests', trader);
    } catch(e) {
      console.error('Storage error:', e);
    }
  }

  static notifyUpdate(type, trader) {
    // Broadcast update à toutes les pages ouvertes
    localStorage.setItem('lastUpdate', JSON.stringify({
      type, trader, timestamp: Date.now()
    }));
    window.dispatchEvent(new Event('storageUpdate'));
  }

  static getAllData() {
    const data = {};
    TRADERS.forEach(trader => {
      data[trader] = {
        trades: this.loadTrades(trader),
        backtests: this.loadBacktests(trader)
      };
    });
    return data;
  }
}

// ============================================
// CALCULATIONS - Calculs RR et statistiques
// ============================================

class Calculator {
  static parseDate(text) {
    text = text.trim();
    const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (!match) return null;
    let [_, d, m, y] = match;
    if (y.length === 2) y = '20' + y;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  static parseRR(text) {
    text = text.trim().toUpperCase();
    text = text.replace(/,/g, '.');
    if (text === 'BE' || text === '0') return 0;
    const match = text.match(/([-+]?\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  }

  static parseDirection(text) {
    text = text.toUpperCase().trim();
    if (text.includes('LONG') || text.includes('BUY') || text.includes('ACHETEUR')) return 'LONG';
    if (text.includes('SHORT') || text.includes('SELL') || text.includes('VENDEUR')) return 'SHORT';
    return 'LONG';
  }

  static calculateStats(trades) {
    if (!trades.length) {
      return {
        total: 0, wins: 0, losses: 0, winRate: 0,
        totalRR: 0, avgRR: 0, maxWin: 0, maxLoss: 0,
        profitFactor: 0
      };
    }

    const wins = trades.filter(t => t.result === 'WIN');
    const losses = trades.filter(t => t.result === 'LOSS');
    
    const totalWinRR = wins.reduce((sum, t) => sum + parseFloat(t.rr), 0);
    const totalLossRR = losses.reduce((sum, t) => sum + parseFloat(t.rr), 0);
    const totalRR = totalWinRR + totalLossRR;

    return {
      total: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: ((wins.length / trades.length) * 100).toFixed(1),
      totalRR: totalRR.toFixed(2),
      avgRR: (totalRR / trades.length).toFixed(2),
      maxWin: wins.length > 0 ? Math.max(...wins.map(t => parseFloat(t.rr))) : 0,
      maxLoss: losses.length > 0 ? Math.min(...losses.map(t => parseFloat(t.rr))) : 0,
      profitFactor: losses.length > 0 ? (totalWinRR / Math.abs(totalLossRR)).toFixed(2) : 'N/A'
    };
  }

  static getTraderRanking() {
    const ranking = TRADERS.map(trader => {
      const trades = StorageManager.loadTrades(trader);
      const stats = this.calculateStats(trades);
      return {
        trader,
        ...stats,
        totalPnL: parseFloat(stats.totalRR)
      };
    });

    return ranking.sort((a, b) => parseFloat(b.totalRR) - parseFloat(a.totalRR));
  }
}

// ============================================
// CHARTS - Configuration Chart.js
// ============================================

class ChartManager {
  static getChartDefaults() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#888',
            font: { size: 12 }
          }
        }
      }
    };
  }

  static createWinRateChart(ctx, trades) {
    const monthlyData = {};
    trades.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { wins: 0, total: 0 };
      monthlyData[month].total++;
      if (t.result === 'WIN') monthlyData[month].wins++;
    });

    const months = Object.keys(monthlyData).sort().slice(-12);
    const winRates = months.map(m => ((monthlyData[m].wins / monthlyData[m].total) * 100).toFixed(1));

    return {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Win Rate %',
          data: winRates,
          borderColor: '#378ADD',
          backgroundColor: 'rgba(55, 138, 221, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: '#378ADD',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        ...this.getChartDefaults(),
        scales: {
          y: {
            min: 0, max: 100,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#888' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#888' }
          }
        }
      }
    };
  }

  static createRRDistributionChart(ctx, trades) {
    const rrBuckets = { 'Negative': 0, 'BE': 0, '+0.5R': 0, '+1R': 0, '+2R+': 0 };
    trades.forEach(t => {
      const rr = parseFloat(t.rr);
      if (rr < 0) rrBuckets['Negative']++;
      else if (rr === 0) rrBuckets['BE']++;
      else if (rr < 1) rrBuckets['+0.5R']++;
      else if (rr < 2) rrBuckets['+1R']++;
      else rrBuckets['+2R+']++;
    });

    return {
      type: 'doughnut',
      data: {
        labels: Object.keys(rrBuckets),
        datasets: [{
          data: Object.values(rrBuckets),
          backgroundColor: ['#E24B4A', '#ff9800', '#FFD700', '#4caf50', '#00bcd4'],
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      },
      options: {
        ...this.getChartDefaults(),
        plugins: {
          ...this.getChartDefaults().plugins,
          datalabels: { display: true }
        }
      }
    };
  }

  static createPnLChart(ctx, trades) {
    let cumRR = 0;
    const cumulative = [];
    const labels = [];

    trades.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(t => {
      cumRR += parseFloat(t.rr);
      cumulative.push(cumRR.toFixed(2));
      labels.push(t.date.substring(5));
    });

    return {
      type: 'area',
      data: {
        labels,
        datasets: [{
          label: 'Cumulative PnL',
          data: cumulative,
          borderColor: cumRR >= 0 ? '#4caf50' : '#E24B4A',
          backgroundColor: cumRR >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(226, 75, 74, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        ...this.getChartDefaults(),
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#888' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#888' }
          }
        }
      }
    };
  }
}

// ============================================
// EXPORTS - PDF & Excel
// ============================================

class ExportManager {
  static async exportToPDF(trader, trades, type = 'trading') {
    const html = this.generateHTML(trader, trades, type);
    // Implémentation PDF - utiliser jsPDF
    const win = window.open();
    win.document.write(html);
    win.print();
  }

  static generateHTML(trader, trades, type) {
    const stats = Calculator.calculateStats(trades);
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #378ADD; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #378ADD; color: white; }
          </style>
        </head>
        <body>
          <h1>${type === 'trading' ? 'Trading' : 'Backtesting'} Report - ${trader}</h1>
          
          <h2>Statistics</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total ${type === 'trading' ? 'Trades' : 'Backtests'}</td><td>${stats.total}</td></tr>
            <tr><td>Wins</td><td>${stats.wins}</td></tr>
            <tr><td>Losses</td><td>${stats.losses}</td></tr>
            <tr><td>Win Rate</td><td>${stats.winRate}%</td></tr>
            <tr><td>Total RR</td><td>${stats.totalRR}</td></tr>
            <tr><td>Avg RR</td><td>${stats.avgRR}</td></tr>
          </table>

          <h2>Detailed Records</h2>
          <table>
            <tr>
              <th>Date</th><th>Pair</th><th>Direction</th><th>RR</th><th>Result</th>
            </tr>
            ${trades.map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.pair}</td>
                <td>${t.direction}</td>
                <td>${t.rr}</td>
                <td>${t.result}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
  }

  static exportToCSV(trader, trades) {
    const rows = [
      ['Date', 'Pair', 'Direction', 'RR', 'Result', 'TF', 'Session']
    ];
    trades.forEach(t => {
      rows.push([t.date, t.pair, t.direction, t.rr, t.result, t.tf || '', t.session || '']);
    });

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trader}-${Date.now()}.csv`;
    a.click();
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

class Notification {
  static show(message, type = 'info', duration = 3000) {
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px; right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease;
      }
      .notification-success { background: #4caf50; }
      .notification-error { background: #E24B4A; }
      .notification-info { background: #378ADD; }
      .notification-warning { background: #ff9800; }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), duration);
  }

  static success(msg) { this.show(msg, 'success'); }
  static error(msg) { this.show(msg, 'error'); }
  static info(msg) { this.show(msg, 'info'); }
}

// ============================================
// SYNC EN TEMPS RÉEL
// ============================================

class RealtimeSync {
  static init(callback) {
    window.addEventListener('storage', (e) => {
      if (e.key === 'lastUpdate') {
        const update = JSON.parse(e.newValue);
        callback(update);
      }
    });
    window.addEventListener('storageUpdate', callback);
  }
}

// Export tout
window.StorageManager = StorageManager;
window.Calculator = Calculator;
window.ChartManager = ChartManager;
window.ExportManager = ExportManager;
window.Notification = Notification;
window.RealtimeSync = RealtimeSync;
window.TRADERS = TRADERS;
window.PAIRS = PAIRS;
