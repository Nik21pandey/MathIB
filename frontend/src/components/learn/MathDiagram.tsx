import React from 'react';

export interface VoronoiSite {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface VoronoiEdge {
  from: [number, number];
  to: [number, number];
  dashed?: boolean;
}

export interface VoronoiVertex {
  x: number;
  y: number;
  label?: string;
}

export interface VoronoiDiagramProps {
  sites: VoronoiSite[];
  edges?: VoronoiEdge[];
  vertices?: VoronoiVertex[];
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
}

/** Crisp, print-ready SVG Voronoi diagram renderer */
export const VoronoiDiagram: React.FC<VoronoiDiagramProps> = ({
  sites,
  edges = [],
  vertices = [],
  xMin = 0,
  xMax = 8,
  yMin = 0,
  yMax = 8,
  title,
  width = 360,
  height = 300,
  className = '',
}) => {
  const pad = 36;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;

  const toSvgX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => height - pad - ((y - yMin) / (yMax - yMin)) * plotH;

  return (
    <div className={`inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-gray-400 ${className}`}>
      {title && <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">{title}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible font-sans">
        {/* Grid lines */}
        {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).map((x) => (
          <line
            key={`grid-x-${x}`}
            x1={toSvgX(x)}
            y1={toSvgY(yMin)}
            x2={toSvgX(x)}
            y2={toSvgY(yMax)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map((y) => (
          <line
            key={`grid-y-${y}`}
            x1={toSvgX(xMin)}
            y1={toSvgY(y)}
            x2={toSvgX(xMax)}
            y2={toSvgY(y)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1={toSvgX(xMin)} y1={toSvgY(0)} x2={toSvgX(xMax)} y2={toSvgY(0)} stroke="#475569" strokeWidth="1.5" />
        <line x1={toSvgX(0)} y1={toSvgY(yMin)} x2={toSvgX(0)} y2={toSvgY(yMax)} stroke="#475569" strokeWidth="1.5" />

        {/* Axis Ticks and Numbers */}
        {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).map((x) => (
          <text key={`tx-${x}`} x={toSvgX(x)} y={toSvgY(0) + 14} fontSize="9" textAnchor="middle" fill="#64748b">
            {x}
          </text>
        ))}
        {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map((y) => (
          y !== 0 && (
            <text key={`ty-${y}`} x={toSvgX(0) - 8} y={toSvgY(y) + 3} fontSize="9" textAnchor="end" fill="#64748b">
              {y}
            </text>
          )
        ))}

        {/* Voronoi Edges (Perpendicular Bisectors) */}
        {edges.map((e, i) => (
          <line
            key={`edge-${i}`}
            x1={toSvgX(e.from[0])}
            y1={toSvgY(e.from[1])}
            x2={toSvgX(e.to[0])}
            y2={toSvgY(e.to[1])}
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray={e.dashed ? '4 3' : undefined}
          />
        ))}

        {/* Vertices */}
        {vertices.map((v, i) => (
          <g key={`vert-${i}`}>
            <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
            {v.label && (
              <text x={toSvgX(v.x) + 6} y={toSvgY(v.y) - 6} fontSize="11" fontWeight="bold" fill="#dc2626">
                {v.label} ({v.x}, {v.y})
              </text>
            )}
          </g>
        ))}

        {/* Sites */}
        {sites.map((s, i) => (
          <g key={`site-${i}`}>
            <circle cx={toSvgX(s.x)} cy={toSvgY(s.y)} r="5" fill={s.color || '#1e293b'} stroke="#ffffff" strokeWidth="1.5" />
            <text x={toSvgX(s.x)} y={toSvgY(s.y) - 8} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1e293b">
              {s.label || `S${i + 1}`} ({s.x}, {s.y})
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export interface NormalCurveProps {
  mean?: number;
  sd?: number;
  shadeFrom?: number;
  shadeTo?: number;
  shadeType?: 'left' | 'right' | 'between' | 'none';
  label?: string;
  width?: number;
  height?: number;
  className?: string;
}

/** Standard Normal Distribution curve with dynamic area shading */
export const NormalCurveDiagram: React.FC<NormalCurveProps> = ({
  mean = 0,
  sd = 1,
  shadeFrom,
  shadeTo,
  shadeType = 'between',
  label = '',
  width = 360,
  height = 180,
  className = '',
}) => {
  const pad = 28;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;

  const xMin = mean - 3.5 * sd;
  const xMax = mean + 3.5 * sd;

  // Gaussian PDF
  const pdf = (x: number) => {
    const z = (x - mean) / sd;
    return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
  };

  const maxPdf = pdf(mean);

  const toSvgX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => height - pad - (y / maxPdf) * plotH * 0.9;

  // Generate curve path
  const steps = 80;
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    points.push([toSvgX(x), toSvgY(pdf(x))]);
  }

  const curveD = `M ${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ')}`;

  // Generate shaded area path
  let shadeD = '';
  if (shadeType !== 'none') {
    let sFrom = shadeFrom !== undefined ? shadeFrom : xMin;
    let sTo = shadeTo !== undefined ? shadeTo : xMax;

    if (shadeType === 'left') {
      sFrom = xMin;
      sTo = shadeTo !== undefined ? shadeTo : mean;
    } else if (shadeType === 'right') {
      sFrom = shadeFrom !== undefined ? shadeFrom : mean;
      sTo = xMax;
    }

    const shadePoints: [number, number][] = [];
    const shadeSteps = 40;
    for (let i = 0; i <= shadeSteps; i++) {
      const x = sFrom + (i / shadeSteps) * (sTo - sFrom);
      shadePoints.push([toSvgX(x), toSvgY(pdf(x))]);
    }

    const startX = toSvgX(sFrom);
    const endX = toSvgX(sTo);
    const baselineY = toSvgY(0);

    shadeD = `M ${startX.toFixed(1)},${baselineY} L ${shadePoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ')} L ${endX.toFixed(1)},${baselineY} Z`;
  }

  return (
    <div className={`inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-gray-400 ${className}`}>
      {label && <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 text-center">{label}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible font-sans">
        {/* Baseline / Horizontal Axis */}
        <line x1={pad - 6} y1={toSvgY(0)} x2={width - pad + 6} y2={toSvgY(0)} stroke="#475569" strokeWidth="1.5" />

        {/* Shaded Area */}
        {shadeD && <path d={shadeD} fill="#93c5fd" fillOpacity="0.45" stroke="#3b82f6" strokeWidth="1" />}

        {/* Bell Curve */}
        <path d={curveD} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />

        {/* Center line (Mean) */}
        <line x1={toSvgX(mean)} y1={toSvgY(0)} x2={toSvgX(mean)} y2={toSvgY(maxPdf)} stroke="#2563eb" strokeWidth="1" strokeDasharray="3 3" />
        <text x={toSvgX(mean)} y={toSvgY(0) + 14} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#1e293b">
          μ = {mean}
        </text>

        {/* SD markers */}
        {[-2, -1, 1, 2].map((k) => {
          const val = mean + k * sd;
          return (
            <g key={`sd-${k}`}>
              <line x1={toSvgX(val)} y1={toSvgY(0) - 3} x2={toSvgX(val)} y2={toSvgY(0) + 3} stroke="#64748b" strokeWidth="1" />
              <text x={toSvgX(val)} y={toSvgY(0) + 14} fontSize="8.5" textAnchor="middle" fill="#64748b">
                {k > 0 ? `+${k}σ` : `${k}σ`}
              </text>
            </g>
          );
        })}

        {/* Bounds Markers */}
        {shadeFrom !== undefined && shadeType !== 'left' && (
          <text x={toSvgX(shadeFrom)} y={toSvgY(0) - 8} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#1d4ed8">
            {shadeFrom}
          </text>
        )}
        {shadeTo !== undefined && shadeType !== 'right' && (
          <text x={toSvgX(shadeTo)} y={toSvgY(0) - 8} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#1d4ed8">
            {shadeTo}
          </text>
        )}
      </svg>
    </div>
  );
};

// ============================================================================
// 3D Cuboid & Space Diagonal Diagram (Pythagoras in 3D)
// ============================================================================
export interface Cuboid3DProps {
  length?: number;
  width?: number;
  height?: number;
  diagonalLabel?: string;
  widthPx?: number;
  heightPx?: number;
  className?: string;
}

export const Cuboid3DDiagram: React.FC<Cuboid3DProps> = ({
  length = 4,
  width = 5,
  height = 7,
  diagonalLabel = 'd',
  widthPx = 340,
  heightPx = 220,
  className = '',
}) => {
  // Vertices of cuboid
  // Front face: A(60, 160), B(200, 160), C(200, 60), D(60, 60)
  // Back face: E(120, 120), F(260, 120), G(260, 20), H(120, 20)
  return (
    <div className={`inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-sm print:shadow-none ${className}`}>
      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
        3D Cuboid Dimensions: {length}cm × {width}cm × {height}cm
      </div>
      <svg width={widthPx} height={heightPx} viewBox="0 0 320 200" className="overflow-visible font-sans">
        {/* Hidden back edges (dashed) */}
        <line x1="60" y1="160" x2="120" y2="120" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="120" y1="120" x2="260" y2="120" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="120" y1="120" x2="120" y2="20" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Base diagonal (dashed) */}
        <line x1="60" y1="160" x2="260" y2="120" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* 3D Internal Space Diagonal (Solid Red/Indigo line) */}
        <line x1="60" y1="160" x2="260" y2="20" stroke="#ef4444" strokeWidth="2.5" />
        <text x="160" y="85" fontSize="12" fontWeight="bold" fill="#ef4444" textAnchor="middle">
          {diagonalLabel} = √(4² + 5² + 7²) = 9.49 cm
        </text>

        {/* Visible Solid Edges */}
        {/* Front face */}
        <polygon points="60,160 200,160 200,60 60,60" fill="#3b82f6" fillOpacity="0.08" stroke="#1e293b" strokeWidth="2" />
        {/* Top face */}
        <polygon points="60,60 200,60 260,20 120,20" fill="#3b82f6" fillOpacity="0.14" stroke="#1e293b" strokeWidth="2" />
        {/* Right face */}
        <polygon points="200,160 260,120 260,20 200,60" fill="#3b82f6" fillOpacity="0.18" stroke="#1e293b" strokeWidth="2" />

        {/* Vertex Dots */}
        <circle cx="60" cy="160" r="3.5" fill="#ef4444" />
        <circle cx="260" cy="20" r="3.5" fill="#ef4444" />

        {/* Dimension Labels */}
        <text x="130" y="178" fontSize="11" fontWeight="bold" fill="#1e293b" textAnchor="middle">{length} cm (Length)</text>
        <text x="240" y="150" fontSize="11" fontWeight="bold" fill="#1e293b" textAnchor="start">{width} cm (Width)</text>
        <text x="268" y="70" fontSize="11" fontWeight="bold" fill="#1e293b" textAnchor="start">{height} cm (Height)</text>
      </svg>
    </div>
  );
};

// ============================================================================
// Histogram & Frequency Density Chart
// ============================================================================
export interface HistogramChartProps {
  title?: string;
  bars?: { label: string; xStart: number; xEnd: number; fd: number; freq: number }[];
  className?: string;
}

export const HistogramDiagram: React.FC<HistogramChartProps> = ({
  title = "Histogram: Frequency Density vs Class Width",
  bars = [
    { label: '0 ≤ w < 10', xStart: 0, xEnd: 10, fd: 1.5, freq: 15 },
    { label: '10 ≤ w < 20', xStart: 10, xEnd: 20, fd: 2.8, freq: 28 },
    { label: '20 ≤ w < 30', xStart: 20, xEnd: 30, fd: 3.5, freq: 35 },
    { label: '30 ≤ w < 50', xStart: 30, xEnd: 50, fd: 1.2, freq: 24 },
  ],
  className = '',
}) => {
  const width = 340;
  const height = 220;
  const padL = 45;
  const padB = 35;
  const plotW = width - padL - 20;
  const plotH = height - padB - 30;

  const maxW = 50;
  const maxFD = 4.0;

  const toX = (val: number) => padL + (val / maxW) * plotW;
  const toY = (fd: number) => height - padB - (fd / maxFD) * plotH;

  return (
    <div className={`inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-sm print:shadow-none ${className}`}>
      {title && <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">{title}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible font-sans">
        {/* Horizontal grid lines */}
        {[1, 2, 3, 4].map((fd) => (
          <g key={`grid-${fd}`}>
            <line x1={padL} y1={toY(fd)} x2={width - 20} y2={toY(fd)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 8} y={toY(fd) + 3} fontSize="9" textAnchor="end" fill="#64748b">{fd.toFixed(1)}</text>
          </g>
        ))}

        {/* Axes */}
        <line x1={padL} y1={height - padB} x2={width - 15} y2={height - padB} stroke="#334155" strokeWidth="1.5" />
        <line x1={padL} y1={height - padB} x2={padL} y2={20} stroke="#334155" strokeWidth="1.5" />

        {/* Axis Labels */}
        <text x={width / 2} y={height - 8} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#334155">
          Class Interval (Width)
        </text>
        <text transform={`rotate(-90 12, ${height / 2})`} x="12" y={height / 2} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#334155">
          Frequency Density
        </text>

        {/* Bars */}
        {bars.map((b, i) => {
          const bx = toX(b.xStart);
          const bw = toX(b.xEnd) - bx;
          const by = toY(b.fd);
          const bh = height - padB - by;
          const isHighlighted = b.fd === 3.5;

          return (
            <g key={`bar-${i}`}>
              <rect
                x={bx}
                y={by}
                width={bw}
                height={bh}
                fill={isHighlighted ? '#3b82f6' : '#93c5fd'}
                fillOpacity={isHighlighted ? '0.75' : '0.5'}
                stroke="#1d4ed8"
                strokeWidth="1.5"
              />
              <text x={bx + bw / 2} y={by + bh / 2} fontSize="9.5" fontWeight="bold" textAnchor="middle" fill={isHighlighted ? '#ffffff' : '#1e3a8a'}>
                f = {b.freq}
              </text>
              <text x={bx} y={height - padB + 14} fontSize="9" textAnchor="middle" fill="#64748b">
                {b.xStart}
              </text>
              {i === bars.length - 1 && (
                <text x={toX(b.xEnd)} y={height - padB + 14} fontSize="9" textAnchor="middle" fill="#64748b">
                  {b.xEnd}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ============================================================================
// Calculus Curve & Stationary Points Diagram
// ============================================================================
export const FunctionGraphDiagram: React.FC<{ title?: string; className?: string }> = ({
  title = "Curve y = 2x³ - 9x² + 12x + 4 (Stationary Points dy/dx = 0)",
  className = '',
}) => {
  const width = 340;
  const height = 210;
  const padL = 40;
  const padB = 30;

  // Domain x from 0 to 3, Range y from 0 to 14
  const toX = (x: number) => padL + (x / 3) * (width - padL - 20);
  const toY = (y: number) => height - padB - (y / 14) * (height - padB - 25);

  const points: [number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const x = 0.2 + (i / 60) * 2.7;
    const y = 2 * Math.pow(x, 3) - 9 * Math.pow(x, 2) + 12 * x + 4;
    points.push([toX(x), toY(y)]);
  }

  const curveD = `M ${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ')}`;

  return (
    <div className={`inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-sm print:shadow-none ${className}`}>
      {title && <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">{title}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible font-sans">
        {/* Axes */}
        <line x1={padL} y1={height - padB} x2={width - 15} y2={height - padB} stroke="#334155" strokeWidth="1.5" />
        <line x1={padL} y1={height - padB} x2={padL} y2={15} stroke="#334155" strokeWidth="1.5" />

        <text x={width - 12} y={height - padB + 14} fontSize="10" fontWeight="bold" fill="#334155">x</text>
        <text x={padL - 12} y={15} fontSize="10" fontWeight="bold" fill="#334155">y</text>

        {/* Ticks */}
        {[1, 2, 3].map((x) => (
          <g key={`x-${x}`}>
            <line x1={toX(x)} y1={height - padB - 3} x2={toX(x)} y2={height - padB + 3} stroke="#475569" />
            <text x={toX(x)} y={height - padB + 14} fontSize="9" textAnchor="middle" fill="#64748b">{x}</text>
          </g>
        ))}

        {/* Curve */}
        <path d={curveD} fill="none" stroke="#2563eb" strokeWidth="2.5" />

        {/* Maxima Point (x=1, y=9) */}
        <circle cx={toX(1)} cy={toY(9)} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
        <line x1={toX(0.7)} y1={toY(9)} x2={toX(1.3)} y2={toY(9)} stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
        <text x={toX(1)} y={toY(9) - 8} fontSize="9.5" fontWeight="bold" textAnchor="middle" fill="#ef4444">
          Local Max (1, 9)
        </text>

        {/* Minima Point (x=2, y=8) */}
        <circle cx={toX(2)} cy={toY(8)} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        <line x1={toX(1.7)} y1={toY(8)} x2={toX(2.3)} y2={toY(8)} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
        <text x={toX(2)} y={toY(8) + 16} fontSize="9.5" fontWeight="bold" textAnchor="middle" fill="#10b981">
          Local Min (2, 8)
        </text>
      </svg>
    </div>
  );
};

// ============================================================================
// Probability Tree Diagram
// ============================================================================
export const ProbabilityTreeDiagram: React.FC<{ title?: string; className?: string }> = ({
  title = "Probability Tree: Green (7) & Yellow (3) Without Replacement",
  className = '',
}) => {
  return (
    <div className={`inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-sm print:shadow-none ${className}`}>
      {title && <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">{title}</div>}
      <svg width={340} height={200} viewBox="0 0 340 200" className="overflow-visible font-sans">
        {/* Stage 1 Branches from (30, 100) */}
        <line x1="30" y1="100" x2="130" y2="50" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="30" y1="100" x2="130" y2="150" stroke="#1e293b" strokeWidth="1.5" />

        <text x="75" y="65" fontSize="10" fontWeight="bold" fill="#16a34a">7/10 (G)</text>
        <text x="75" y="140" fontSize="10" fontWeight="bold" fill="#ca8a04">3/10 (Y)</text>

        {/* Nodes after 1st pick */}
        <circle cx="130" cy="50" r="4" fill="#16a34a" />
        <circle cx="130" cy="150" r="4" fill="#ca8a04" />

        {/* Stage 2 from G (130, 50) */}
        <line x1="130" y1="50" x2="230" y2="25" stroke="#16a34a" strokeWidth="1.5" />
        <line x1="130" y1="50" x2="230" y2="75" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="175" y="32" fontSize="9.5" fontWeight="bold" fill="#16a34a">6/9 (G)</text>
        <text x="175" y="70" fontSize="9.5" fontWeight="bold" fill="#ca8a04">3/9 (Y)</text>

        {/* Stage 2 from Y (130, 150) */}
        <line x1="130" y1="150" x2="230" y2="125" stroke="#16a34a" strokeWidth="1.5" />
        <line x1="130" y1="150" x2="230" y2="175" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="175" y="132" fontSize="9.5" fontWeight="bold" fill="#16a34a">7/9 (G)</text>
        <text x="175" y="170" fontSize="9.5" fontWeight="bold" fill="#ca8a04">2/9 (Y)</text>

        {/* Outcomes & Probabilities on the right */}
        <text x="245" y="29" fontSize="10" fontWeight="bold" fill="#16a34a">GG = 42/90 (7/15) ★</text>
        <text x="245" y="79" fontSize="10" fill="#475569">GY = 21/90 (7/30)</text>
        <text x="245" y="129" fontSize="10" fill="#475569">YG = 21/90 (7/30)</text>
        <text x="245" y="179" fontSize="10" fill="#ca8a04">YY = 6/90 (1/15)</text>
      </svg>
    </div>
  );
};

// ============================================================================
// Formatted Exam Data Table
// ============================================================================
export interface ExamTableProps {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  className?: string;
}

export const ExamDataTable: React.FC<ExamTableProps> = ({
  headers,
  rows,
  caption,
  className = '',
}) => {
  return (
    <div className={`my-3 overflow-x-auto rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {caption && <div className="bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 text-center">{caption}</div>}
      <table className="w-full text-center text-xs">
        <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-200">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 border-r border-gray-200 last:border-r-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 border-r border-gray-200 last:border-r-0 text-gray-700 font-medium">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Automatically renders visual diagrams for syllabus questions that require geometric/statistical figures */
export function renderQuestionDiagram(questionId: string): React.ReactNode {
  switch (questionId) {
    case 'gcs2':
      return (
        <div className="my-3">
          <Cuboid3DDiagram length={4} width={5} height={7} diagonalLabel="d" />
        </div>
      );
    case 'edx3':
      return (
        <div className="my-3">
          <HistogramDiagram />
          <ExamDataTable
            caption="Recorded Data Table: Class Width & Frequency"
            headers={['Class Interval (w)', 'Class Width', 'Frequency (f)', 'Frequency Density (FD)']}
            rows={[
              ['0 ≤ w < 10', '10', '15', '1.5'],
              ['10 ≤ w < 20', '10', '28', '2.8'],
              ['20 ≤ w < 30', '10', '35', '3.5 (Target)'],
              ['30 ≤ w < 50', '20', '24', '1.2'],
            ]}
          />
        </div>
      );
    case 'edx4':
      return (
        <div className="my-3">
          <FunctionGraphDiagram />
        </div>
      );
    case 'gcs3':
      return (
        <div className="my-3">
          <ProbabilityTreeDiagram />
        </div>
      );
    case 'vo1':
      return (
        <div className="my-3">
          <VoronoiDiagram
            title="Voronoi Diagram: Sites A and B"
            sites={[
              { x: 2, y: 1, label: 'A', color: '#1e293b' },
              { x: 6, y: 5, label: 'B', color: '#1e293b' },
            ]}
            edges={[
              { from: [1, 6], to: [7, 0] },
            ]}
            xMin={0}
            xMax={8}
            yMin={0}
            yMax={8}
            width={320}
            height={260}
          />
        </div>
      );
    case 'vo2':
      return (
        <div className="my-3">
          <VoronoiDiagram
            title="Voronoi Diagram: Wells A, B, C"
            sites={[
              { x: 0, y: 0, label: 'A', color: '#1e293b' },
              { x: 4, y: 0, label: 'B', color: '#1e293b' },
              { x: 0, y: 6, label: 'C', color: '#1e293b' },
            ]}
            edges={[
              { from: [2, 3], to: [2, 8] },
              { from: [2, 3], to: [8, 3] },
              { from: [2, 3], to: [-1, 7], dashed: true },
            ]}
            vertices={[
              { x: 2, y: 3, label: 'V' },
            ]}
            xMin={-1}
            xMax={8}
            yMin={-1}
            yMax={8}
            width={320}
            height={260}
          />
        </div>
      );
    case 'nd1':
      return (
        <div className="my-3">
          <NormalCurveDiagram
            label="X ~ N(50, 8²)"
            mean={50}
            sd={8}
            shadeFrom={42}
            shadeTo={58}
            shadeType="between"
            width={340}
            height={160}
          />
        </div>
      );
    case 'nd2':
      return (
        <div className="my-3">
          <NormalCurveDiagram
            label="Heights ~ N(170, 6²): P(X > 180)"
            mean={170}
            sd={6}
            shadeFrom={180}
            shadeType="right"
            width={340}
            height={160}
          />
        </div>
      );
    case 'nd3':
      return (
        <div className="my-3">
          <NormalCurveDiagram
            label="Heights ~ N(170, 6²): P(X < k) = 0.90"
            mean={170}
            sd={6}
            shadeTo={177.7}
            shadeType="left"
            width={340}
            height={160}
          />
        </div>
      );
    default:
      return null;
  }
}
