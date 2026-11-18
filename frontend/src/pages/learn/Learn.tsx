import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, ListChecks, Search, Shapes } from 'lucide-react';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import { topicMastery, useProgress } from '../../learn/progress';
import { useSeo } from '../../learn/seo';
import { ProgressBar, Tag } from '../../components/learn/ui';
import DailyFiveWidget from '../../components/learn/DailyFiveWidget';

const shortcuts = [
  { to: '/contents', icon: Search, title: 'Contents index', text: 'Search every topic and jump straight in.' },
  { to: '/igcse-0580/non-calculator-paper-2', icon: Calculator, title: '0580 non-calculator hub', text: 'Surds, exact trig and index work for the new Paper 2.' },
  { to: '/ib-myp-math', icon: Shapes, title: 'MYP criteria B and D', text: 'Interactive investigations and real-life tasks.' },
  { to: '/worksheet-builder', icon: FileText, title: 'Worksheet builder', text: 'Pick questions, export a booklet and a mark scheme.' },
  { to: '/crash', icon: ListChecks, title: 'Night-before checklists', text: 'A 60-minute plan for the evening before each paper.' },
];

const Guided: React.FC<{ index: CatalogIndex }> = ({ index }) => {
  const progress = useProgress();
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Maths, by syllabus</h1>
        <p className="text-gray-600 mt-1">Choose your course to see its topic tree and your progress. In a hurry? Use the <Link to="/contents" className="text-blue-600 hover:underline">contents index</Link>.</p>
      </header>

      {index.catalog.boards.map((board) => {
        const list = index.catalog.syllabuses.filter((s) => s.board === board.id);
        return (
          <section key={board.id}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{board.name}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((s) => {
                const topics = index.topicsOf(s.slug);
                const strong = topics.filter((t) => topicMastery(progress, index, t.id).status === 'green').length;
                const questions = topics.reduce((n, t) => n + index.questionsOf(t.id).length, 0);
                if (s.status === 'soon') {
                  return (
                    <div key={s.slug} className="rounded-xl border border-dashed border-gray-300 p-5 bg-white/60">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-500">{s.short}</span>
                        <Tag>Coming soon</Tag>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{s.name}</p>
                    </div>
                  );
                }
                return (
                  <Link key={s.slug} to={`/${s.slug}`} className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow transition">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{s.short}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-2">{topics.length} topics · {questions} exam questions</p>
                    <div className="mt-3">
                      <ProgressBar value={strong} max={topics.length} label="Topics you are strong on" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <DailyFiveWidget compact />

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Shortcuts</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortcuts.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-500 transition">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600 h-fit"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span>
                <span className="block font-medium text-gray-900">{title}</span>
                <span className="block text-sm text-gray-600">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const Learn: React.FC = () => {
  useSeo({
    title: 'Maths by syllabus: IGCSE, IB MYP, IB Diploma and A Level',
    description: 'Guided topic trees with revision notes, fluency drills, graded exam questions and progress tracking for international maths courses.',
    path: '/learn',
  });
  return <WithCatalog>{(index) => <Guided index={index} />}</WithCatalog>;
};

export default Learn;
