import React, { useState } from 'react';
import { 
  Eye, 
  Columns, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Calculator, 
  Download,
  Share2,
  Printer,
  ChevronDown,
  Layers
} from 'lucide-react';
import MathText from './learn/MathText';
import { 
  Cuboid3DDiagram, 
  HistogramDiagram, 
  FunctionGraphDiagram, 
  ProbabilityTreeDiagram, 
  ExamDataTable, 
  VoronoiDiagram, 
  NormalCurveDiagram 
} from './learn/MathDiagram';

export interface ExamStudioProps {
  paperTitle: string;
  curriculum: string;
  paperNumber: string;
  season: string;
  year: number;
  pdfUrl?: string;
  markschemeUrl?: string;
  questions?: StudioQuestion[];
  onDownloadQP?: () => void;
  onDownloadMS?: () => void;
}

interface StudioQuestion {
  id: string;
  num: number;
  marks: number;
  calc: boolean;
  topic: string;
  subtopic: string;
  stem: string;
  diagramType?: 'cuboid' | 'histogram' | 'calculus' | 'tree' | 'voronoi' | 'normal';
  parts?: { label: string; text: string; marks: number }[];
  scheme: {
    part?: string;
    step: string;
    code: 'M1' | 'A1' | 'B1' | 'R1';
    codeDesc: string;
    guidance: string;
  }[];
  finalAnswer: string;
  examinerTrap: string;
  commonMistake: string;
}

export const ExamStudio: React.FC<ExamStudioProps> = ({
  paperTitle,
  curriculum,
  paperNumber,
  season,
  year,
  pdfUrl,
  markschemeUrl,
  questions = [],
  onDownloadQP,
  onDownloadMS,
}) => {
  // Viewing Layout: 'split' (side-by-side), 'qp' (question only), 'ms' (mark scheme only)
  const [viewMode, setViewMode] = useState<'split' | 'qp' | 'ms'>('split');
  const [selectedQ, setSelectedQ] = useState<number>(0);
  const [showAllHints, setShowAllHints] = useState<boolean>(true);

  const currentQ = questions[selectedQ] || null;

  const renderVisual = (type?: string) => {
    switch (type) {
      case 'cuboid':
        return <Cuboid3DDiagram length={4} width={5} height={7} diagonalLabel="d" />;
      case 'histogram':
        return (
          <div>
            <HistogramDiagram />
            <ExamDataTable
              caption="Exam Distribution Table: Class Width & Frequency"
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
      case 'calculus':
        return <FunctionGraphDiagram />;
      case 'tree':
        return <ProbabilityTreeDiagram />;
      case 'voronoi':
        return (
          <VoronoiDiagram
            title="Voronoi Boundary: Midpoint & Bisector"
            sites={[
              { x: 2, y: 1, label: 'A', color: '#1e293b' },
              { x: 6, y: 5, label: 'B', color: '#1e293b' },
            ]}
            edges={[{ from: [1, 6], to: [7, 0] }]}
            vertices={[{ x: 4, y: 3, label: 'M (4, 3)' }]}
            xMin={0}
            xMax={8}
            yMin={0}
            yMax={8}
            width={330}
            height={260}
          />
        );
      case 'normal':
        return (
          <NormalCurveDiagram
            label="Weights ~ N(170, 6²): Tail P(X > 180)"
            mean={170}
            sd={6}
            shadeFrom={180}
            shadeType="right"
            width={330}
            height={160}
          />
        );
      default:
        return null;
    }
  };

  const getMarkBadge = (code: string) => {
    switch (code) {
      case 'M1':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">M1 · Method</span>;
      case 'A1':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">A1 · Accuracy</span>;
      case 'B1':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">B1 · Fact/Indep</span>;
      case 'R1':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">R1 · Proof</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-300">{code}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans">
      {/* Top Professional Control Toolbar */}
      <header className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">{paperTitle}</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Studio View
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {curriculum} · {paperNumber} ({season} {year})
            </p>
          </div>
        </div>

        {/* Layout & Mode Switcher: Side-by-Side vs Single Tab */}
        <div className="flex items-center space-x-2">
          {/* Dual Split-View Segmented Control */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-700/80 flex items-center shadow-inner">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="View Question Paper on Left and Mark Scheme on Right"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Side-by-Side Dual View</span>
            </button>
            <button
              onClick={() => setViewMode('qp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'qp'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Question Only</span>
            </button>
            <button
              onClick={() => setViewMode('ms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'ms'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Scheme Only</span>
            </button>
          </div>

          {/* Action Download Buttons */}
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
            {onDownloadQP && (
              <button
                onClick={onDownloadQP}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition"
                title="Download Official Question Paper PDF"
              >
                <Download className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">QP PDF</span>
              </button>
            )}
            {onDownloadMS && (
              <button
                onClick={onDownloadMS}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition"
                title="Download Official Mark Scheme PDF"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">MS PDF</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {questions.length === 0 || !currentQ ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Official Examination Booklet Mode</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            MathIB presents verified official exam papers and marking schemes in high-definition vector format.
            Please use the <span className="text-emerald-400 font-semibold">Official PDF Booklet</span> view above to browse the complete official question paper and marking scheme.
          </p>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Open Official PDF
            </a>
          )}
        </div>
      ) : (
        <>
      {/* Question Selector Tabs */}
      <nav aria-label="Question selector" className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Questions:</span>
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setSelectedQ(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedQ === idx
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span>Q{q.num}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedQ === idx ? 'bg-blue-700 text-blue-100' : 'bg-slate-700 text-slate-400'}`}>
              {q.marks}m
            </span>
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 hidden md:inline">
          {currentQ.topic} · {currentQ.subtopic}
        </span>
      </nav>

      {/* Main Studio Body: Side-by-Side or Single View */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-900">
        <div className={`grid gap-6 ${viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          {/* =========================================================================
              LEFT COLUMN: QUESTION PAPER STUDIO
              ========================================================================= */}
          {(viewMode === 'split' || viewMode === 'qp') && (
            <div className="flex flex-col bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
              {/* Question Header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900/60 to-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                    Q{currentQ.num}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Question {currentQ.num}</h2>
                    <p className="text-[11px] text-blue-200">{currentQ.subtopic}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 text-blue-400 border border-blue-500/20">
                    [{currentQ.marks} Marks]
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Calculator className="h-3 w-3" />
                    {currentQ.calc ? 'Calc' : 'Non-Calc'}
                  </span>
                </div>
              </div>

              {/* Question Stem & Math */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 leading-relaxed text-sm text-slate-100">
                  <MathText text={currentQ.stem} as="div" />
                </div>

                {/* Vector Diagram / Graph / Table Visual Rendering */}
                {currentQ.diagramType && (
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-xl border border-slate-700/50">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      [Fig 1.1: Official Examination Diagram / Chart]
                    </div>
                    {renderVisual(currentQ.diagramType)}
                  </div>
                )}

                {/* Sub-parts */}
                {currentQ.parts && currentQ.parts.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {currentQ.parts.map((p) => (
                      <div key={p.label} className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-700/40">
                        <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {p.label}
                        </span>
                        <div className="flex-1 text-sm text-slate-200">
                          <MathText text={p.text} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                          [{p.marks}]
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              RIGHT COLUMN: STRUCTURED MARK SCHEME & WORKED SOLUTIONS
              ========================================================================= */}
          {(viewMode === 'split' || viewMode === 'ms') && (
            <div className="flex flex-col bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
              {/* Mark Scheme Header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-900/60 to-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                    MS
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Official Mark Scheme & Solutions</h2>
                    <p className="text-[11px] text-emerald-200">Examiner Marking Guide & Method Allocation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllHints(v => !v)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 text-emerald-400 border border-emerald-500/20 hover:bg-slate-700 transition"
                >
                  {showAllHints ? 'Hide Examiner Tips' : 'Show Examiner Tips'}
                </button>
              </div>

              {/* Mark Scheme Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {/* Method Marks Breakdown Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3 w-14">Part</th>
                        <th className="py-2.5 px-3">Answer & Indicative Method</th>
                        <th className="py-2.5 px-3 w-28">Mark & Type</th>
                        <th className="py-2.5 px-3">Examiner Guidance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {currentQ.scheme.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50 transition">
                          <td className="py-3 px-3 font-bold text-blue-400">
                            {s.part || `Step ${idx + 1}`}
                          </td>
                          <td className="py-3 px-3 text-slate-100 font-medium leading-relaxed">
                            <MathText text={s.step} />
                          </td>
                          <td className="py-3 px-3">
                            {getMarkBadge(s.code)}
                          </td>
                          <td className="py-3 px-3 text-slate-300 text-[11px] leading-relaxed">
                            {s.guidance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Final Answer Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-xs font-bold uppercase text-emerald-300 tracking-wider">Final Answer:</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-emerald-500/40">
                    <MathText text={currentQ.finalAnswer} />
                  </span>
                </div>

                {/* Examiner Tips & Trap Warnings */}
                {showAllHints && (
                  <div className="space-y-3 pt-1">
                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Common Examiner Trap</h4>
                        <p className="text-xs text-amber-100/90 leading-relaxed">{currentQ.examinerTrap}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Common Student Slip</h4>
                        <p className="text-xs text-blue-100/90 leading-relaxed">{currentQ.commonMistake}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ExamStudio;
