import React, { useState } from 'react';
import { TimelinePoint } from '../types';
import { TrendingUp, Activity, Calendar, ShieldCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HealthTimelineProps {
  timeline: TimelinePoint[];
  patientName: string;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ timeline, patientName }) => {
  const [selectedMetric, setSelectedMetric] = useState<'fbs' | 'hba1c' | 'hemoglobin' | 'cholesterol'>('hba1c');

  const metricConfigs = {
    hba1c: {
      name: 'HbA1c (Glycated Hemoglobin)',
      unit: '%',
      normalRange: '4.0 - 5.6 %',
      normalMax: 5.6,
      warningThreshold: 6.5,
      yMin: 3.5,
      yMax: 9.0,
      description: 'Reflects 3-month average blood glucose binding to hemoglobin proteins.',
    },
    fbs: {
      name: 'Fasting Blood Sugar (FBS)',
      unit: 'mg/dL',
      normalRange: '70 - 99 mg/dL',
      normalMax: 99,
      warningThreshold: 126,
      yMin: 60,
      yMax: 180,
      description: 'Measures blood glucose concentration after an 8-hour fasting period.',
    },
    hemoglobin: {
      name: 'Hemoglobin (Hb)',
      unit: 'g/dL',
      normalRange: '13.5 - 17.5 g/dL',
      normalMax: 17.5,
      warningThreshold: 12.0,
      yMin: 10.0,
      yMax: 18.0,
      description: 'Oxygen-transport metalloprotein in red blood cells.',
    },
    cholesterol: {
      name: 'Total Cholesterol',
      unit: 'mg/dL',
      normalRange: '< 200 mg/dL',
      normalMax: 200,
      warningThreshold: 240,
      yMin: 140,
      yMax: 260,
      description: 'Circulating lipid concentration indicator for cardiovascular health.',
    },
  };

  const config = metricConfigs[selectedMetric];

  // SVG Chart Dimensions
  const width = 640;
  const height = 240;
  const paddingX = 60;
  const paddingY = 40;

  const points = timeline.map((pt, idx) => {
    const val = pt[selectedMetric] as number;
    const x = paddingX + (idx / (timeline.length - 1)) * (width - paddingX * 2);
    // Invert Y axis
    const yRatio = (val - config.yMin) / (config.yMax - config.yMin);
    const y = height - paddingY - yRatio * (height - paddingY * 2);
    return { ...pt, val, x, y };
  });

  // Calculate SVG line path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Normal range Y position
  const normalMaxRatio = (config.normalMax - config.yMin) / (config.yMax - config.yMin);
  const normalMaxY = height - paddingY - normalMaxRatio * (height - paddingY * 2);

  const initialVal = points[0]?.val || 0;
  const currentVal = points[points.length - 2]?.val || initialVal;
  const change = (currentVal - initialVal).toFixed(1);
  const isRising = currentVal > initialVal;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/30">
                Longitudinal EHR Analytics
              </span>
              <span className="text-xs text-slate-400">Patient: {patientName}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Biomarker Health Trajectory</h2>
            <p className="text-xs text-slate-400">
              Aggregated from verified clinical diagnostic panels across testing intervals in 2026.
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            {(Object.keys(metricConfigs) as (keyof typeof metricConfigs)[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedMetric === key
                    ? 'bg-teal-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest Observed</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{currentVal}</span>
              <span className="text-xs text-slate-400 font-mono">{config.unit}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Reference: {config.normalRange}</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trend Trajectory</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <TrendingUp className={`w-5 h-5 ${isRising ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className={`text-xl font-bold font-mono ${isRising ? 'text-amber-300' : 'text-emerald-300'}`}>
                {Number(change) > 0 ? `+${change}` : change} {config.unit}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Change since baseline (Mar 2026)</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Evaluation</span>
            <div className="mt-1">
              {currentVal > config.normalMax ? (
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Above Normal Baseline</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Within Target Band</span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 truncate">{config.description}</div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-2 px-2">
            <span className="font-semibold text-slate-300">{config.name} Over Time</span>
            <div className="flex items-center space-x-4 text-[10px]">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-0.5 bg-emerald-500/50"></span>
                <span>Normal Threshold ({config.normalRange})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                <span>Observed Labs</span>
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[300px]">
              {/* Background Reference Zone (Green Band for Normal Range) */}
              <rect
                x={paddingX}
                y={normalMaxY}
                width={width - paddingX * 2}
                height={height - paddingY - normalMaxY}
                fill="rgba(16, 185, 129, 0.07)"
                rx={4}
              />

              {/* Threshold Line */}
              <line
                x1={paddingX}
                y1={normalMaxY}
                x2={width - paddingX}
                y2={normalMaxY}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <text
                x={width - paddingX + 5}
                y={normalMaxY + 3}
                fill="#10b981"
                fontSize="10"
                fontFamily="monospace"
              >
                Max Normal ({config.normalMax})
              </text>

              {/* Connecting Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((p, i) => {
                const isTarget = p.isTarget;
                return (
                  <g key={i}>
                    {/* Vertical reference guideline */}
                    <line
                      x1={p.x}
                      y1={p.y}
                      x2={p.x}
                      y2={height - paddingY}
                      stroke="#334155"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />

                    {/* Circle Node */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isTarget ? 5 : 6}
                      fill={isTarget ? '#10b981' : '#0f172a'}
                      stroke={isTarget ? '#34d399' : '#2dd4bf'}
                      strokeWidth={isTarget ? 2 : 3}
                    />

                    {/* Numeric Value Label above node */}
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      fill={isTarget ? '#34d399' : '#f8fafc'}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {p.val}
                    </text>

                    {/* Date / Month Label below X axis */}
                    <text
                      x={p.x}
                      y={height - paddingY + 18}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Timeline Log Table */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Chronological Lab Manifest
          </h4>
          <div className="space-y-2">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.reportTitle}</div>
                    <div className="text-[11px] text-slate-400">{item.date} • {item.label}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Fasting Sugar</span>
                    <span className="font-bold text-slate-200">{item.fbs} mg/dL</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">HbA1c</span>
                    <span className="font-bold text-teal-400">{item.hba1c} %</span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 block uppercase">Hemoglobin</span>
                    <span className="font-bold text-slate-200">{item.hemoglobin} g/dL</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
