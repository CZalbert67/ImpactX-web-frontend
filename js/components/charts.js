// js/components/charts.js
import { esc } from '../utils.js';

export function barChart(counts, totalLabel = 'eventos') {
  const values = Object.values(counts);
  const max = Math.max(1, ...values);
  return `
    <div class="bar-chart">
      ${Object.entries(counts).map(([label, value]) => `
        <div class="bar-row">
          <span>${esc(label)}</span>
          <div class="bar-track"><i style="width:${Math.max(4, Math.round((value / max) * 100))}%"></i></div>
          <strong>${value}</strong>
        </div>
      `).join('')}
      <p class="mini-note">Total: ${values.reduce((a, b) => a + b, 0)} ${esc(totalLabel)}.</p>
    </div>
  `;
}

export function horizontalMeter(label, value, cls = 'primary') {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return `
    <div class="meter-block">
      <div class="meter-label">
        <span>${esc(label)}</span>
        <strong>${safe}%</strong>
      </div>
      <div class="progress tall">
        <span class="${cls}" style="width:${safe}%"></span>
      </div>
    </div>
  `;
}

export function donutLegend(counts) {
  const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));
  return `
    <div class="legend-list">
      ${Object.entries(counts).map(([label, value]) => `
        <div>
          <span class="legend-dot"></span>
          <strong>${esc(label)}</strong>
          <em>${value} · ${Math.round(value / total * 100)}%</em>
        </div>
      `).join('')}
    </div>
  `;
}

export function donutChart(counts, title) {
  const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));
  let cursor = 0;
  const colors = ['#22c55e', '#f59e0b', '#38bdf8', '#ef4444', '#a855f7'];
  const stops = Object.values(counts).map((value, index) => {
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  }).join(', ');
  
  return `
    <div class="donut-wrap">
      <div class="donut" style="background:conic-gradient(${stops || '#1f2937 0 100%'})">
        <span>${total}</span>
      </div>
      <div>
        <h4>${esc(title)}</h4>
        ${donutLegend(counts)}
      </div>
    </div>
  `;
}

export function svgLineChart(data) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const width = 360;
  const height = 150;
  const points = entries.map(([_, value], index) => {
    const x = 20 + index * ((width - 40) / Math.max(1, entries.length - 1));
    const y = height - 25 - (value / max) * 95;
    return [x, y, value];
  });
  const poly = points.map(p => `${p[0]},${p[1]}`).join(' ');
  
  return `
    <div class="line-card">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Tendencia de incidentes">
        <polyline points="${poly}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${points.map(([x, y, value]) => `
          <circle cx="${x}" cy="${y}" r="5"></circle>
          <text x="${x}" y="${height - 6}" text-anchor="middle">${value}</text>
        `).join('')}
      </svg>
      <div class="trend-labels">
        ${entries.map(([label]) => `<span>${esc(label)}</span>`).join('')}
      </div>
    </div>
  `;
}
