import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileDown,
  Printer,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import {
  bifurcatePdf,
  downloadPdfReport,
  downloadJsonReport,
  type BifurcatedReportData,
  type BifurcatedItem,
  type DifficultyLevel,
} from '../utils/bifurcatorApi';

type StepStatus = 'idle' | 'uploading' | 'extracting' | 'bifurcating' | 'ready' | 'error';

export const PDFBifurcator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subjectHint, setSubjectHint] = useState<string>('');
  const [maxPages, setMaxPages] = useState<number>(30);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [status, setStatus] = useState<StepStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [reportData, setReportData] = useState<BifurcatedReportData | null>(null);

  // Filters & Search
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BifurcatedItem>>({});
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newItemForm, setNewItemForm] = useState<Partial<BifurcatedItem>>({
    subject: 'Mathematics',
    topic: '',
    subtopic: '',
    difficulty: 'Intermediate',
    justification: '',
    page_ref: 'Page 1',
    key_notes: '',
  });

  // Export state
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file (.pdf)');
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25 MB limit.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
  };

  const startExtraction = async () => {
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');

    try {
      // Simulate realistic stepper progress for responsive UX
      setTimeout(() => {
        setStatus((current) => (current === 'uploading' ? 'extracting' : current));
      }, 700);

      setTimeout(() => {
        setStatus((current) => (current === 'extracting' ? 'bifurcating' : current));
      }, 1800);

      const result = await bifurcatePdf(file, {
        subjectHint: subjectHint || undefined,
        maxPages: maxPages,
      });

      setReportData(result);
      setStatus('ready');
    } catch (err: any) {
      console.error('Bifurcation failed:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to extract and bifurcate the PDF document.');
    }
  };

  const resetAll = () => {
    setFile(null);
    setStatus('idle');
    setErrorMessage('');
    setReportData(null);
    setEditingId(null);
    setIsAddingNew(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!reportData) return [];
    return reportData.items.filter((item) => {
      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && item.difficulty !== selectedDifficulty) {
        return false;
      }
      // Topic filter
      if (selectedTopic !== 'ALL' && item.topic !== selectedTopic) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = item.topic.toLowerCase().includes(q);
        const matchesSubtopic = item.subtopic.toLowerCase().includes(q);
        const matchesJustification = item.justification.toLowerCase().includes(q);
        const matchesNotes = item.key_notes.toLowerCase().includes(q);
        const matchesPage = item.page_ref.toLowerCase().includes(q);
        if (!matchesTopic && !matchesSubtopic && !matchesJustification && !matchesNotes && !matchesPage) {
          return false;
        }
      }
      return true;
    });
  }, [reportData, selectedDifficulty, selectedTopic, searchQuery]);

  // Distinct topics for dropdown
  const distinctTopics = useMemo(() => {
    if (!reportData) return [];
    return Array.from(new Set(reportData.items.map((i) => i.topic))).sort();
  }, [reportData]);

  // Recalculate summary metrics after inline edits/deletions
  const currentSummary = useMemo(() => {
    if (!reportData) return null;
    const items = reportData.items;
    const beg = items.filter((i) => i.difficulty === 'Beginner').length;
    const inter = items.filter((i) => i.difficulty === 'Intermediate').length;
    const adv = items.filter((i) => i.difficulty === 'Advanced').length;
    const total = items.length;

    return {
      total_items: total,
      beginner_count: beg,
      intermediate_count: inter,
      advanced_count: adv,
      difficulty_distribution: {
        Beginner: Math.round((beg / Math.max(1, total)) * 100),
        Intermediate: Math.round((inter / Math.max(1, total)) * 100),
        Advanced: Math.round((adv / Math.max(1, total)) * 100),
      },
    };
  }, [reportData]);

  // Item modifications
  const handleStartEdit = (item: BifurcatedItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (!reportData || !editingId) return;
    const updatedItems = reportData.items.map((itm) => {
      if (itm.id === editingId) {
        return {
          ...itm,
          ...editForm,
        } as BifurcatedItem;
      }
      return itm;
    });

    setReportData({
      ...reportData,
      items: updatedItems,
    });
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteItem = (id: string) => {
    if (!reportData) return;
    const updatedItems = reportData.items.filter((i) => i.id !== id);
    setReportData({
      ...reportData,
      items: updatedItems,
    });
  };

  const handleSaveNewItem = () => {
    if (!reportData) return;
    if (!newItemForm.topic || !newItemForm.subtopic) {
      alert('Please enter both a Topic and a Subtopic.');
      return;
    }

    const newItem: BifurcatedItem = {
      id: `custom-${Date.now()}`,
      subject: newItemForm.subject || reportData.subject || 'Mathematics',
      topic: newItemForm.topic,
      subtopic: newItemForm.subtopic,
      difficulty: (newItemForm.difficulty as DifficultyLevel) || 'Intermediate',
      justification: newItemForm.justification || 'Custom syllabus item added by educator.',
      page_ref: newItemForm.page_ref || 'Page 1',
      key_notes: newItemForm.key_notes || '',
    };

    setReportData({
      ...reportData,
      items: [newItem, ...reportData.items],
    });

    setIsAddingNew(false);
    setNewItemForm({
      subject: reportData.subject || 'Mathematics',
      topic: '',
      subtopic: '',
      difficulty: 'Intermediate',
      justification: '',
      page_ref: 'Page 1',
      key_notes: '',
    });
  };

  // Export ReportLab PDF
  const handleExportPdf = async () => {
    if (!reportData) return;
    setIsExportingPdf(true);
    try {
      const payload: BifurcatedReportData = {
        ...reportData,
        summary: currentSummary || reportData.summary,
      };
      await downloadPdfReport(payload);
    } catch (err: any) {
      console.error('Export PDF error:', err);
      alert('Failed to generate PDF report: ' + (err.message || 'Server error'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    if (!reportData) return;
    const payload: BifurcatedReportData = {
      ...reportData,
      summary: currentSummary || reportData.summary,
    };
    downloadJsonReport(payload);
  };

  // Helper for difficulty badges
  const renderDifficultyBadge = (level: DifficultyLevel) => {
    switch (level) {
      case 'Beginner':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
            Beginner
          </span>
        );
      case 'Intermediate':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            Intermediate
          </span>
        );
      case 'Advanced':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-500"></span>
            Advanced
          </span>
        );
      default:
        return <span>{level}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI & Vector Content Bifurcation Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            PDF Curriculum & Content Bifurcator
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Upload any mathematics paper, past examination booklet, or revision guide. Our engine automatically
            extracts and categorizes content into <b>Subject</b>, <b>Topic</b>, <b>Subtopic</b>, and <b>Difficulty Level</b> with
            pedagogical justifications, source page references, and exportable A4 reports.
          </p>
        </div>

        {/* Upload & Configuration Card (When not ready or when editing) */}
        {status !== 'ready' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto">
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Upload className="w-7 h-7" />
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for analysis
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-medium text-slate-800">
                    Drag and drop your PDF here, or <span className="text-blue-600 hover:underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Supports Cambridge IGCSE, IBDP, A-Level, and STEM PDFs up to 25 MB
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Ingestion Parameters */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Context (Optional)
                </label>
                <select
                  value={subjectHint}
                  onChange={(e) => setSubjectHint(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Auto-Detect Curriculum / Subject</option>
                  <option value="Mathematics">Mathematics (0580 / 0607 / IBDP)</option>
                  <option value="Additional Mathematics">Additional Mathematics (0606)</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Economics">Economics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extraction Page Range
                </label>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value={15}>First 15 pages (Fastest)</option>
                  <option value={30}>First 30 pages (Recommended)</option>
                  <option value={50}>First 50 pages (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-end">
              <button
                disabled={!file || status !== 'idle'}
                onClick={startExtraction}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status !== 'idle' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    Extract & Bifurcate Content
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Active Stepper Status */}
            {status !== 'idle' && status !== 'ready' && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>
                      {status === 'uploading' && '1/3 · Uploading PDF file to server...'}
                      {status === 'extracting' && '2/3 · PyMuPDF vector text & layout parsing...'}
                      {status === 'bifurcating' && '3/3 · Bifurcating into Subject, Topic & Difficulty...'}
                    </span>
                    <span className="text-blue-600 animate-pulse font-mono">In Progress</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`bg-blue-600 h-2 rounded-full transition-all duration-500 ${
                        status === 'uploading'
                          ? 'w-1/3'
                          : status === 'extracting'
                          ? 'w-2/3'
                          : 'w-11/12'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Structured Results Studio (When Ready) */}
        {status === 'ready' && reportData && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {reportData.filename}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {reportData.subject} · {reportData.pages_processed} of {reportData.total_pages} pages processed (
                    {reportData.total_words.toLocaleString()} words) · Engine: {reportData.engine || 'Academic Taxonomy'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={resetAll}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Upload Another PDF
                </button>

                <button
                  onClick={handleExportJson}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5"
                  title="Export structured JSON data"
                >
                  <FileDown className="w-4 h-4 text-slate-500" />
                  Export JSON
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5"
                  title="Print current breakdown"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  Print
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Polished PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Executive Metric Cards */}
            {currentSummary && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units</span>
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{currentSummary.total_items}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Bifurcated syllabus items</div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Beginner</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {currentSummary.difficulty_distribution.Beginner}%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 mt-2">{currentSummary.beginner_count}</div>
                  <div className="text-[11px] text-emerald-700 mt-1">Foundational fluency / definitions</div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Intermediate</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      {currentSummary.difficulty_distribution.Intermediate}%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-800 mt-2">{currentSummary.intermediate_count}</div>
                  <div className="text-[11px] text-amber-700 mt-1">Standard multi-step problems</div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Advanced</span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      {currentSummary.difficulty_distribution.Advanced}%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-purple-800 mt-2">{currentSummary.advanced_count}</div>
                  <div className="text-[11px] text-purple-700 mt-1">Calculus, proofs & synthesis</div>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Difficulty tabs */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Level:
                </span>
                {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedDifficulty === lvl
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lvl === 'ALL' ? 'All Levels' : lvl}
                  </button>
                ))}
              </div>

              {/* Topic dropdown and Search Input */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white max-w-[180px]"
                >
                  <option value="ALL">All Topics ({distinctTopics.length})</option>
                  {distinctTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 md:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subtopics, concepts..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Unit
                </button>
              </div>
            </div>

            {/* Inline Add New Item Modal / Form */}
            {isAddingNew && (
              <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Add Custom Curriculum Unit</h3>
                  <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Topic</label>
                    <input
                      type="text"
                      value={newItemForm.topic}
                      onChange={(e) => setNewItemForm({ ...newItemForm, topic: e.target.value })}
                      placeholder="e.g. Calculus"
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subtopic</label>
                    <input
                      type="text"
                      value={newItemForm.subtopic}
                      onChange={(e) => setNewItemForm({ ...newItemForm, subtopic: e.target.value })}
                      placeholder="e.g. Stationary Points"
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Difficulty</label>
                    <select
                      value={newItemForm.difficulty}
                      onChange={(e) => setNewItemForm({ ...newItemForm, difficulty: e.target.value as DifficultyLevel })}
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Page Ref</label>
                    <input
                      type="text"
                      value={newItemForm.page_ref}
                      onChange={(e) => setNewItemForm({ ...newItemForm, page_ref: e.target.value })}
                      placeholder="e.g. Page 4"
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Difficulty Justification</label>
                    <input
                      type="text"
                      value={newItemForm.justification}
                      onChange={(e) => setNewItemForm({ ...newItemForm, justification: e.target.value })}
                      placeholder="Reasoning behind difficulty assignment"
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Key Notes / Focus</label>
                    <input
                      type="text"
                      value={newItemForm.key_notes}
                      onChange={(e) => setNewItemForm({ ...newItemForm, key_notes: e.target.value })}
                      placeholder="Summary of question or formula"
                      className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewItem}
                    className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Unit
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Hierarchy Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4 w-52">Topic & Subtopic</th>
                      <th className="py-3 px-4 w-32">Difficulty</th>
                      <th className="py-3 px-4 w-28">Source Ref</th>
                      <th className="py-3 px-4">Pedagogical Justification & Key Focus</th>
                      <th className="py-3 px-4 w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No items match the selected filter or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, idx) => {
                        const isEditing = editingId === item.id;

                        if (isEditing) {
                          return (
                            <tr key={item.id} className="bg-blue-50/50">
                              <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4 space-y-1.5">
                                <input
                                  type="text"
                                  value={editForm.topic || ''}
                                  onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                                  className="w-full text-xs font-bold text-blue-900 border rounded p-1 bg-white"
                                />
                                <input
                                  type="text"
                                  value={editForm.subtopic || ''}
                                  onChange={(e) => setEditForm({ ...editForm, subtopic: e.target.value })}
                                  className="w-full text-xs text-slate-700 border rounded p-1 bg-white"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={editForm.difficulty}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, difficulty: e.target.value as DifficultyLevel })
                                  }
                                  className="text-xs border rounded p-1 bg-white"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  value={editForm.page_ref || ''}
                                  onChange={(e) => setEditForm({ ...editForm, page_ref: e.target.value })}
                                  className="w-full text-xs border rounded p-1 bg-white"
                                />
                              </td>
                              <td className="py-3 px-4 space-y-1.5">
                                <input
                                  type="text"
                                  value={editForm.justification || ''}
                                  onChange={(e) => setEditForm({ ...editForm, justification: e.target.value })}
                                  className="w-full text-xs border rounded p-1 bg-white"
                                  placeholder="Justification"
                                />
                                <input
                                  type="text"
                                  value={editForm.key_notes || ''}
                                  onChange={(e) => setEditForm({ ...editForm, key_notes: e.target.value })}
                                  className="w-full text-xs border rounded p-1 bg-white text-slate-500"
                                  placeholder="Key Notes"
                                />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                    title="Save changes"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{item.topic}</div>
                              <div className="text-slate-600 font-medium mt-0.5">{item.subtopic}</div>
                            </td>
                            <td className="py-3.5 px-4">{renderDifficultyBadge(item.difficulty)}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">{item.page_ref}</td>
                            <td className="py-3.5 px-4">
                              <div className="italic text-slate-700">{item.justification}</div>
                              {item.key_notes && (
                                <div className="text-slate-500 text-[11px] mt-1 font-mono">{item.key_notes}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 opacity-70 hover:opacity-100 transition">
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                  title="Edit unit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"
                                  title="Delete unit"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {filteredItems.length} of {reportData.items.length} units
                </span>
                <span className="font-mono">MathIB Structured Document Intelligence</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFBifurcator;
