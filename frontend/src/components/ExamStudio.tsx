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
  onDownloadQP,
  onDownloadMS,
}) => {
  // Viewing Layout: 'split' (side-by-side), 'qp' (question only), 'ms' (mark scheme only)
  const [viewMode, setViewMode] = useState<'split' | 'qp' | 'ms'>('split');
  const [selectedQ, setSelectedQ] = useState<number>(0);
  const [showAllHints, setShowAllHints] = useState<boolean>(true);

  // Dynamic realistic curriculum questions with visual figures and tables
  const isIB = curriculum.toLowerCase().includes('ib') || curriculum.toLowerCase().includes('international baccalaureate');
  const isEdexcel = curriculum.toLowerCase().includes('edexcel') || curriculum.toLowerCase().includes('gcse');

  const questions: StudioQuestion[] = isIB ? [
    {
      id: 'ib-q1',
      num: 1,
      marks: 6,
      calc: true,
      topic: 'Topic 3: Geometry & Trigonometry',
      subtopic: 'Voronoi Diagrams & Perpendicular Bisectors',
      stem: 'Sites $A(2, 1)$ and $B(6, 5)$ represent two cell phone transmission towers in a city. The Voronoi boundary between $A$ and $B$ is the perpendicular bisector of the line segment $[AB]$.',
      diagramType: 'voronoi',
      parts: [
        { label: 'a', text: 'Find the coordinates of the midpoint of $[AB]$.', marks: 2 },
        { label: 'b', text: 'Find the gradient of the perpendicular bisector line.', marks: 2 },
        { label: 'c', text: 'Hence write down the equation of the boundary line in the form $y = mx + c$.', marks: 2 },
      ],
      scheme: [
        { part: '(a)', step: 'Midpoint $M = \\left(\\frac{2+6}{2}, \\frac{1+5}{2}\\right) = (4, 3)$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for correct midpoint formula.' },
        { part: '(a)', step: '$M = (4, 3)$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Exact coordinates required.' },
        { part: '(b)', step: 'Gradient of $[AB] = \\frac{5 - 1}{6 - 2} = \\frac{4}{4} = 1$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for dy/dx or slope formula.' },
        { part: '(b)', step: 'Perpendicular gradient $m_\\perp = -\\frac{1}{1} = -1$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Award A1 for negative reciprocal property.' },
        { part: '(c)', step: '$y - 3 = -1(x - 4) \\implies y = -x + 7$', code: 'M1', codeDesc: 'Method', guidance: 'Substitute midpoint (4, 3) into line equation.' },
        { part: '(c)', step: '$y = -x + 7$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Allow $x + y = 7$ or $x + y - 7 = 0$.' },
      ],
      finalAnswer: '(a) (4, 3)   (b) -1   (c) y = -x + 7',
      examinerTrap: 'Forgetting to take the negative reciprocal when finding the perpendicular bisector gradient.',
      commonMistake: 'Using one of the site endpoints A or B in the line equation instead of the midpoint M.',
    },
    {
      id: 'ib-q2',
      num: 2,
      marks: 6,
      calc: true,
      topic: 'Topic 4: Statistics & Probability',
      subtopic: 'Normal Distribution Modelling',
      stem: 'The weights of apples in an orchard are normally distributed with a mean of $170\\text{ g}$ and a standard deviation of $6\\text{ g}$, so $X \\sim N(170, 6^2)$.',
      diagramType: 'normal',
      parts: [
        { label: 'a', text: 'Calculate the probability that a randomly chosen apple weighs more than $180\\text{ g}$.', marks: 2 },
        { label: 'b', text: 'Apples weighing less than $k\\text{ g}$ are rejected. If $10\\%$ of the apples are rejected, find the value of $k$ to 1 decimal place.', marks: 4 },
      ],
      scheme: [
        { part: '(a)', step: '$P(X > 180) = P\\left(Z > \\frac{180 - 170}{6}\\right) = P(Z > 1.667)$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for standardizing or GDC normalCdf syntax.' },
        { part: '(a)', step: '$P(X > 180) = 0.0478$ (or $4.78\\%$)', code: 'A1', codeDesc: 'Accuracy', guidance: 'Accept 0.0477 to 0.0479.' },
        { part: '(b)', step: '$P(X < k) = 0.10 \\implies z = -1.28155$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for finding inverse normal z-score.' },
        { part: '(b)', step: '$\\frac{k - 170}{6} = -1.28155 \\implies k = 170 - 6(1.28155)$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for equating to standardisation equation.' },
        { part: '(b)', step: '$k = 162.31 \\implies k = 162.3\\text{ g}$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Exact 1 d.p. required. Award R1 for consistent unit notation.' },
      ],
      finalAnswer: '(a) 0.0478   (b) k = 162.3 g',
      examinerTrap: 'Using positive z-score +1.28 instead of negative -1.28 for lower 10% tail.',
      commonMistake: 'Writing the answer as a percentage rather than grams for part (b).',
    },
  ] : isEdexcel ? [
    {
      id: 'edx-q1',
      num: 1,
      marks: 3,
      calc: false,
      topic: 'Strand 1: Numbers & Arithmetic',
      subtopic: 'Recurring Decimals to Simplified Fractions',
      stem: 'Show clearly that the recurring decimal $0.\\dot{4}\\dot{7}$ can be written in the form $\\frac{47}{99}$.',
      parts: [],
      scheme: [
        { step: 'Let $x = 0.474747...$', code: 'B1', codeDesc: 'Independent', guidance: 'Sets up algebraic variable with recurring notation expanded.' },
        { step: '$100x = 47.474747...$', code: 'M1', codeDesc: 'Method', guidance: 'Multiplies by 100 to shift recurring block.' },
        { step: '$100x - x = 99x = 47 \\implies x = \\frac{47}{99}$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Full conclusion reached with clear subtraction shown.' },
      ],
      finalAnswer: 'x = 47/99',
      examinerTrap: 'Attempting to divide 47 by 99 on calculator rather than showing algebraic proof.',
      commonMistake: 'Subtracting 10x instead of 100x, failing to eliminate the repeating digits.',
    },
    {
      id: 'edx-q2',
      num: 2,
      marks: 4,
      calc: true,
      topic: 'Strand 3: Geometry & Trigonometry',
      subtopic: '3D Pythagoras & Internal Space Diagonals',
      stem: 'A cuboid has dimensions length $4\\text{ cm}$, width $5\\text{ cm}$, and height $7\\text{ cm}$. Calculate the length of the internal space diagonal $d$, giving your answer correct to 3 significant figures.',
      diagramType: 'cuboid',
      parts: [],
      scheme: [
        { step: '$d^2 = 4^2 + 5^2 + 7^2$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for 3D Pythagoras formula $x^2 + y^2 + z^2$.' },
        { step: '$d^2 = 16 + 25 + 49 = 90$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Correct evaluation of intermediate sum of squares.' },
        { step: '$d = \\sqrt{90}$', code: 'M1', codeDesc: 'Method', guidance: 'Square root operation.' },
        { step: '$d = 9.4868... \\implies d = 9.49\\text{ cm}$ (to 3 s.f.)', code: 'A1', codeDesc: 'Accuracy', guidance: 'Accept $3\\sqrt{10}$. Award 4 marks for 9.49 with no working.' },
      ],
      finalAnswer: 'd = 9.49 cm (or 3√10 cm)',
      examinerTrap: 'Forgetting to take the square root of the final sum 90.',
      commonMistake: 'Adding the side lengths directly: 4 + 5 + 7 = 16 cm.',
    },
    {
      id: 'edx-q3',
      num: 3,
      marks: 4,
      calc: true,
      topic: 'Strand 5: Statistics & Probability',
      subtopic: 'Histograms with Unequal Class Widths',
      stem: 'The histogram shows information about the weights of 100 parcels. The class interval $20 \\le w < 30$ has a frequency of 35.',
      diagramType: 'histogram',
      parts: [
        { label: 'a', text: 'Calculate the frequency density for the interval $20 \\le w < 30$.', marks: 2 },
        { label: 'b', text: 'Using the histogram, calculate the frequency for the interval $30 \\le w < 50$ where frequency density is 1.2.', marks: 2 },
      ],
      scheme: [
        { part: '(a)', step: '$\\text{Class Width} = 30 - 20 = 10$', code: 'B1', codeDesc: 'Independent', guidance: 'Correct class width identified.' },
        { part: '(a)', step: '$\\text{Frequency Density} = \\frac{35}{10} = 3.5$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Exact decimal 3.5.' },
        { part: '(b)', step: '$\\text{Class Width} = 50 - 30 = 20$', code: 'B1', codeDesc: 'Independent', guidance: 'Correct width 20.' },
        { part: '(b)', step: '$\\text{Frequency} = \\text{FD} \\times \\text{Width} = 1.2 \\times 20 = 24$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Answer 24.' },
      ],
      finalAnswer: '(a) FD = 3.5   (b) Frequency = 24 parcels',
      examinerTrap: 'Reading the frequency directly from the vertical axis without multiplying by class width.',
      commonMistake: 'Dividing frequency by total frequency (100) instead of class width.',
    },
  ] : [
    // Standard Cambridge 0580 / 0607 / 0606
    {
      id: 'cam-q1',
      num: 1,
      marks: 4,
      calc: false,
      topic: 'Strand 4: Geometry & Mensuration',
      subtopic: '3D Space Diagonals & Trigonometry',
      stem: 'The diagram shows a rectangular cuboid $ABCDEFGH$ with dimensions $AB = 4\\text{ cm}$, $BC = 5\\text{ cm}$ and $CG = 7\\text{ cm}$. Calculate the length of the internal diagonal $AG$.',
      diagramType: 'cuboid',
      parts: [],
      scheme: [
        { step: 'Base diagonal $AC^2 = 4^2 + 5^2 = 16 + 25 = 41$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for 2D base diagonal calculation.' },
        { step: '$AG^2 = AC^2 + CG^2 = 41 + 7^2 = 41 + 49 = 90$', code: 'M1', codeDesc: 'Method', guidance: 'Award M1 for vertical right triangle application.' },
        { step: '$AG = \\sqrt{90}$', code: 'M1', codeDesc: 'Method', guidance: 'Correct square root step.' },
        { step: '$AG = 9.49\\text{ cm}$ (to 3 s.f.)', code: 'A1', codeDesc: 'Accuracy', guidance: 'Accept $3\\sqrt{10}$ or 9.49.' },
      ],
      finalAnswer: 'AG = 9.49 cm',
      examinerTrap: 'Rounding intermediate value AC = 6.40 too early, leading to inaccurate final answer.',
      commonMistake: 'Confusing the face diagonal AC with the 3D space diagonal AG.',
    },
    {
      id: 'cam-q2',
      num: 2,
      marks: 4,
      calc: true,
      topic: 'Strand 6: Statistics',
      subtopic: 'Histograms & Frequency Density Interpretation',
      stem: 'A logistics centre records the weights of packages. For the interval $20 \\le w < 30$, the frequency is 35. Complete the frequency density calculation and find the missing frequency for $30 \\le w < 50$.',
      diagramType: 'histogram',
      parts: [
        { label: 'a', text: 'Find the frequency density for the $20 \\le w < 30$ bar.', marks: 2 },
        { label: 'b', text: 'Find the number of packages weighing between $30\\text{ kg}$ and $50\\text{ kg}$.', marks: 2 },
      ],
      scheme: [
        { part: '(a)', step: '$\\text{FD} = \\frac{35}{10} = 3.5$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Award 2 marks for 3.5.' },
        { part: '(b)', step: '$\\text{Frequency} = \\text{Width} \\times \\text{FD} = 20 \\times 1.2 = 24$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Award 2 marks for 24.' },
      ],
      finalAnswer: '(a) 3.5   (b) 24',
      examinerTrap: 'Plotting frequency on the y-axis instead of frequency density.',
      commonMistake: 'Forgetting that in histograms, area equals frequency.',
    },
    {
      id: 'cam-q3',
      num: 3,
      marks: 6,
      calc: false,
      topic: 'Strand 8: Calculus & Coordinate Geometry',
      subtopic: 'Polynomial Differentiation & Stationary Points',
      stem: 'A curve has equation $y = 2x^3 - 9x^2 + 12x + 4$.',
      diagramType: 'calculus',
      parts: [
        { label: 'a', text: 'Find $\\frac{dy}{dx}$.', marks: 2 },
        { label: 'b', text: 'Find the coordinates of the two stationary points and classify their nature.', marks: 4 },
      ],
      scheme: [
        { part: '(a)', step: '$\\frac{dy}{dx} = 6x^2 - 18x + 12$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Award M1 for any two terms correct, A1 for all.' },
        { part: '(b)', step: 'Sets $6(x^2 - 3x + 2) = 0 \\implies 6(x-1)(x-2) = 0$', code: 'M1', codeDesc: 'Method', guidance: 'Equate to zero and factorise.' },
        { part: '(b)', step: '$x = 1, x = 2$', code: 'A1', codeDesc: 'Accuracy', guidance: 'Both roots correct.' },
        { part: '(b)', step: 'At $x=1, y=9 \\implies (1, 9)$ [Local Max]\nAt $x=2, y=8 \\implies (2, 8)$ [Local Min]', code: 'A1', codeDesc: 'Accuracy', guidance: 'Award A1 for coordinates and A1 for nature classification.' },
      ],
      finalAnswer: '(a) 6x² - 18x + 12   (b) Max (1, 9), Min (2, 8)',
      examinerTrap: 'Forgetting to substitute x-values back into original y equation to find coordinates.',
      commonMistake: 'Differentiating the constant +4 to give 4 instead of 0.',
    },
    {
      id: 'cam-q4',
      num: 4,
      marks: 4,
      calc: false,
      topic: 'Strand 7: Probability',
      subtopic: 'Conditional Probability Without Replacement',
      stem: 'There are 7 green sweets and 3 yellow sweets in a bag. Hannah picks two sweets at random without replacement.',
      diagramType: 'tree',
      parts: [
        { label: 'a', text: 'Complete the probability tree diagram.', marks: 2 },
        { label: 'b', text: 'Calculate the probability that both sweets are green.', marks: 2 },
      ],
      scheme: [
        { part: '(a)', step: 'First pick: $P(G) = \\frac{7}{10}, P(Y) = \\frac{3}{10}$', code: 'B1', codeDesc: 'Independent', guidance: 'Initial branch probabilities.' },
        { part: '(a)', step: 'Second pick: $P(G|G) = \\frac{6}{9}, P(Y|G) = \\frac{3}{9}$', code: 'B1', codeDesc: 'Independent', guidance: 'Denominator drops to 9.' },
        { part: '(b)', step: '$P(G_1 \\cap G_2) = \\frac{7}{10} \\times \\frac{6}{9} = \\frac{42}{90} = \\frac{7}{15}$', code: 'M1', codeDesc: 'Method', guidance: 'Multiply dependent fractions.' },
        { part: '(b)', step: '$\\frac{7}{15}$ (or $0.467$)', code: 'A1', codeDesc: 'Accuracy', guidance: 'Accept 42/90 or 7/15.' },
      ],
      finalAnswer: 'P(Both Green) = 7/15',
      examinerTrap: 'Keeping denominator as 10 on the second trial (with replacement error).',
      commonMistake: 'Adding the probabilities instead of multiplying.',
    },
  ];

  const currentQ = questions[selectedQ] || questions[0];

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
    </div>
  );
};

export default ExamStudio;
