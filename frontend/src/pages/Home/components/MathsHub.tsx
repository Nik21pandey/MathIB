import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Search, Shapes, ToggleRight } from 'lucide-react';
import DailyFiveWidget from '../../../components/learn/DailyFiveWidget';

const highlights = [
  {
    to: '/igcse-0580/non-calculator-paper-2',
    icon: Calculator,
    title: 'IGCSE 0580 non-calculator sprint hub',
    text: 'Paper 2 is now two hours with no calculator. Practise surds, exact trig values and index work by hand.',
  },
  {
    to: '/ibdp-math-aa-hl',
    icon: ToggleRight,
    title: 'IB Math AA: current and new syllabus',
    text: 'One switch shows what stays and what leaves when the new course is first examined in May 2029.',
  },
  {
    to: '/ib-myp-math',
    icon: Shapes,
    title: 'MYP Criterion B and D',
    text: 'Interactive pattern investigations and real-life tasks with model answers at every step.',
  },
  {
    to: '/worksheet-builder',
    icon: FileText,
    title: 'Worksheet and paper builder',
    text: 'Tick questions, then export a student booklet and a mark scheme. Each page carries a QR code to the solutions.',
  },
];

/** Home page entry points into the maths learning platform. */
const MathsHub: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  return (
    <section className="px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl lg:text-3xl font-bold">Find any maths topic in one step</h2>
        <p className="mt-2 text-blue-100 max-w-2xl">Notes, a fluency drill and graded exam questions for every topic. Free, with no login.</p>
        <form
          className="mt-5 flex flex-col sm:flex-row gap-3 max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(query.trim() ? `/contents?q=${encodeURIComponent(query.trim())}` : '/contents');
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search maths topics"
              placeholder='Try "surds" or "binomial theorem"'
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <button type="submit" className="px-5 py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50">Search topics</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Link to="/contents" className="underline underline-offset-2 hover:text-blue-100">Browse the full contents index</Link>
          <Link to="/learn" className="underline underline-offset-2 hover:text-blue-100">Or choose your syllabus</Link>
        </div>
      </div>

      <DailyFiveWidget />

      <div className="grid md:grid-cols-2 gap-4">
        {highlights.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="group flex gap-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-500 transition">
            <span className="p-3 rounded-lg bg-blue-50 text-blue-600 h-fit"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <span className="flex-1">
              <span className="flex items-center gap-2 font-semibold text-gray-900">
                {title}
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" aria-hidden="true" />
              </span>
              <span className="block text-sm text-gray-600 mt-1">{text}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MathsHub;
