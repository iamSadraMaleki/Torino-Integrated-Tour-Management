import React from "react";
import "./AnalyticsCharts.css";

// ============================================================
// نمودار میله‌ای عمودی
// ============================================================
interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  formatValue?: (v: number) => string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  color = "#0d9488",
  formatValue,
  height = 170,
}) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="an-bar-chart" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="an-bar-col"
          title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
        >
          <span className="an-bar-value">
            {formatValue ? formatValue(d.value) : d.value}
          </span>
          <div className="an-bar-track">
            <div
              className="an-bar-fill"
              style={{
                height: `${d.value > 0 ? Math.max((d.value / max) * 100, 6) : 0}%`,
                background: `linear-gradient(180deg, ${color}, ${color}cc)`,
              }}
            />
          </div>
          <span className="an-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// نمودار خطی (منطقه‌ای) SVG
// ============================================================
interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  formatValue?: (v: number) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  color = "#0d9488",
  formatValue,
}) => {
  const gid = React.useId().replace(/:/g, "");
  const W = 100;
  const H = 40;
  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = Math.max(max - min, 1);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * W;
    const y = H - 4 - ((d.value - min) / range) * (H - 10);
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div className="an-line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="an-line-svg">
        <defs>
          <linearGradient id={`lg-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* خطوط شبکه افقی */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1="0"
            x2={W}
            y1={H * t}
            y2={H * t}
            stroke="#f1f5f9"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={areaPath} fill={`url(#lg-${gid})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.1"
            fill="white"
            stroke={color}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          >
            <title>{`${p.label}: ${formatValue ? formatValue(p.value) : p.value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="an-line-labels">
        {data.map((d, i) => (
          <span key={i} className="an-line-label" title={d.label}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// نمودار گیج (درصد تکمیل)
// ============================================================
interface GaugeChartProps {
  value: number; // 0 تا 100
  label?: string;
  color?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  label,
  color = "#7c3aed",
}) => {
  const v = Math.max(0, Math.min(100, value));
  const R = 15.915494;
  const dash = `${v} ${100 - v}`;
  return (
    <div className="an-gauge">
      <div className="an-gauge-svg-wrap">
        <svg viewBox="0 0 42 42" className="an-gauge-svg">
          <circle
            cx="21"
            cy="21"
            r={R}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="5"
          />
          <circle
            cx="21"
            cy="21"
            r={R}
            fill="transparent"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={dash}
            className="an-gauge-fill"
          />
        </svg>
        <div className="an-gauge-center">
          <strong>٪{v.toLocaleString("fa-IR")}</strong>
          {label && <span>{label}</span>}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// نمودار دونات (SVG)
// ============================================================
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel,
  centerValue,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 15.915494; // محیط = 100
  let offset = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const pct = total > 0 ? (d.value / total) * 100 : 0;
      const seg = {
        color: d.color,
        dash: `${pct} ${100 - pct}`,
        offset: -offset,
      };
      offset += pct;
      return seg;
    });

  return (
    <div className="an-donut-wrap">
      <div className="an-donut-svg-wrap">
        <svg viewBox="0 0 42 42" className="an-donut">
          <circle
            cx="21"
            cy="21"
            r={R}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="5"
          />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx="21"
              cy="21"
              r={R}
              fill="transparent"
              stroke={s.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={s.dash}
              strokeDashoffset={s.offset}
              className="an-donut-seg"
            />
          ))}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="an-donut-center">
            {centerValue && <strong>{centerValue}</strong>}
            {centerLabel && <span>{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="an-donut-legend">
        {data.map((d, i) => (
          <div key={i} className="an-legend-item">
            <span className="an-legend-dot" style={{ background: d.color }} />
            <span className="an-legend-label">{d.label}</span>
            <span className="an-legend-value">
              {d.value.toLocaleString("fa-IR")}
              {total > 0 && (
                <small className="an-legend-pct">
                  {" "}
                  (٪{Math.round((d.value / total) * 100)})
                </small>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// نوار تقسیم‌شده (توزیع وضعیت)
// ============================================================
interface SegmentedBarProps {
  data: Array<{ label: string; value: number; color: string }>;
  formatValue?: (v: number) => string;
}

export const SegmentedBar: React.FC<SegmentedBarProps> = ({
  data,
  formatValue,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const segments = data.filter((d) => d.value > 0);
  return (
    <div className="an-segmented">
      <div className="an-segmented-track">
        {segments.length === 0 && <div className="an-segmented-track-empty" />}
        {segments.map((d, i) => (
          <div
            key={i}
            className="an-segmented-seg"
            style={{ width: `${(d.value / total) * 100}%`, background: d.color }}
            title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
          />
        ))}
      </div>
      <div className="an-segmented-legend">
        {data.map((d, i) => (
          <div key={i} className="an-legend-item">
            <span className="an-legend-dot" style={{ background: d.color }} />
            <span className="an-legend-label">{d.label}</span>
            <span className="an-legend-value">
              {formatValue ? formatValue(d.value) : d.value.toLocaleString("fa-IR")}
              {total > 0 && (
                <small className="an-legend-pct">
                  {" "}
                  (٪{Math.round((d.value / total) * 100)})
                </small>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// لیست میله‌ای افقی (برترین‌ها)
// ============================================================
export interface HBarItem {
  label: string;
  sublabel?: string;
  value: number;
  display?: string;
  color?: string;
}

interface HBarListProps {
  items: HBarItem[];
  color?: string;
  showRank?: boolean;
}

export const HBarList: React.FC<HBarListProps> = ({
  items,
  color = "#7c3aed",
  showRank = true,
}) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  const rankColors = ["#f59e0b", "#94a3b8", "#b45309"];
  return (
    <div className="an-hbar-list">
      {items.length === 0 && (
        <div className="an-empty">داده‌ای برای نمایش وجود ندارد</div>
      )}
      {items.map((item, i) => (
        <div key={i} className="an-hbar-item">
          <div className="an-hbar-top">
            <span className="an-hbar-label-wrap">
              {showRank && (
                <span
                  className="an-hbar-rank"
                  style={{
                    background: rankColors[i] || "#0d9488",
                  }}
                >
                  {i + 1}
                </span>
              )}
              <span className="an-hbar-label">{item.label}</span>
            </span>
            <span className="an-hbar-value">
              {item.display ?? item.value.toLocaleString("fa-IR")}
            </span>
          </div>
          <div className="an-hbar-track">
            <div
              className="an-hbar-fill"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${item.color || color}, ${item.color || color}99)`,
              }}
            />
          </div>
          {item.sublabel && <span className="an-hbar-sublabel">{item.sublabel}</span>}
        </div>
      ))}
    </div>
  );
};

// ============================================================
// کارت شاخص کلیدی (KPI)
// ============================================================
interface KpiCardProps {
  title: string;
  value: string;
  icon: string;
  color?: string;
  hint?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, hint }) => (
  <div className="an-kpi-card" style={{ borderTopColor: color || "#0d9488" }}>
    <div
      className="an-kpi-icon"
      style={{ background: `${color || "#0d9488"}1a`, color: color || "#0d9488" }}
    >
      {icon}
    </div>
    <div className="an-kpi-info">
      <h4>{title}</h4>
      <p className="an-kpi-value">{value}</p>
      {hint && <span className="an-kpi-hint">{hint}</span>}
    </div>
  </div>
);
