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

/** Automatically renders visual diagrams for syllabus questions that require geometric/statistical figures */
export function renderQuestionDiagram(questionId: string): React.ReactNode {
  switch (questionId) {
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
