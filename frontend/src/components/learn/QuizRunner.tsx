import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, RefreshCw, Timer, Trophy, X } from 'lucide-react';
import type { Quiz } from '../../learn/quiz';
import { formatDuration } from '../../learn/quiz';
import { progressActions } from '../../learn/progress';
import { absoluteUrl, challengePath, copyText, whatsappUrl } from '../../learn/share';
import MathText from './MathText';

interface QuizRunnerProps {
  quiz: Quiz;
  /** Score and time set by the friend who sent the challenge link. */
  beat?: { score: number; seconds: number } | null;
  /** Path that starts a fresh quiz of the same kind (topic quizzes only). */
  retryPath?: string;
}

const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, beat, retryPath }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const startedAt = useRef(Date.now());
  const recorded = useRef(false);

  const total = quiz.items.length;
  const finished = answers.length === total;
  const score = answers.reduce((s, a, i) => s + (a === quiz.items[i].correct ? 1 : 0), 0);

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (!finished || recorded.current) return;
    recorded.current = true;
    const [, id, seed] = quiz.spec.split('.');
    if (quiz.kind === 'daily') progressActions.recordDaily(seed, id, score, seconds);
    if (quiz.kind === 'topic' && quiz.topicId) progressActions.recordTopicQuiz(quiz.topicId, score, total);
  }, [finished, quiz, score, seconds, total]);

  const choose = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
  };
  const next = () => {
    if (picked === null) return;
    setAnswers((a) => [...a, picked]);
    setPicked(null);
    setCurrent((c) => Math.min(c + 1, total - 1));
  };

  if (finished) {
    const link = absoluteUrl(challengePath(quiz.spec, score, seconds));
    const message = `I scored ${score}/${total} in ${formatDuration(seconds)} on ${quiz.title}. Can you beat me?`;
    const won = beat ? score > beat.score || (score === beat.score && seconds < beat.seconds) : false;
    const copy = async () => {
      if (await copyText(`${message} ${link}`)) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    };
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
          <Trophy className="h-10 w-10 mx-auto text-amber-500" aria-hidden="true" />
          <p className="mt-3 text-3xl font-bold text-gray-900">{score}/{total}</p>
          <p className="text-gray-600">in {formatDuration(seconds)}</p>
          {beat && (
            <p className={`mt-3 font-medium ${won ? 'text-emerald-700' : 'text-gray-700'}`}>
              {won ? 'You beat the challenge.' : 'Not quite this time.'} Score to beat was {beat.score}/{total} in {formatDuration(beat.seconds)}.
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a href={whatsappUrl(`${message} ${link}`)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
              Challenge a friend on WhatsApp
            </a>
            <button type="button" onClick={copy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
              <Copy className="h-4 w-4" aria-hidden="true" /> {copied ? 'Link copied' : 'Copy link for Discord'}
            </button>
            {retryPath && (
              <Link to={retryPath} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> New questions
              </Link>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">Your friend gets exactly the same five questions and a timer.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Review</h2>
          {quiz.items.map((item, i) => {
            const right = answers[i] === item.correct;
            return (
              <div key={item.key} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${right ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {right ? <Check className="h-4 w-4" aria-label="Correct" /> : <X className="h-4 w-4" aria-label="Incorrect" />}
                  </span>
                  <div className="flex-1">
                    <MathText text={item.prompt} as="div" className="text-gray-900" />
                    <p className="mt-2 text-sm text-gray-700">
                      Correct answer: <MathText text={item.options[item.correct]} />
                      {!right && (
                        <>
                          <span className="mx-2 text-gray-300">|</span>You chose: <MathText text={item.options[answers[i]]} />
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const item = quiz.items[current];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>Question {current + 1} of {total} <span className="text-gray-400">· {item.skill}</span></span>
        <span className="inline-flex items-center gap-1 font-mono" aria-label="Time taken">
          <Timer className="h-4 w-4" aria-hidden="true" /> {formatDuration(seconds)}
        </span>
      </div>
      {beat && current === 0 && picked === null && (
        <p className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
          Score to beat: {beat.score}/{total} in {formatDuration(beat.seconds)}.
        </p>
      )}
      <MathText text={item.prompt} as="div" className="text-lg text-gray-900 mb-5" />
      <div className="grid sm:grid-cols-2 gap-3">
        {item.options.map((opt, i) => {
          const isPicked = picked === i;
          const reveal = picked !== null;
          const isCorrect = i === item.correct;
          let style = 'border-gray-300 hover:border-blue-500 hover:bg-blue-50';
          if (reveal && isCorrect) style = 'border-emerald-500 bg-emerald-50';
          else if (reveal && isPicked) style = 'border-red-500 bg-red-50';
          else if (reveal) style = 'border-gray-200 opacity-60';
          return (
            <button
              key={i}
              type="button"
              disabled={reveal}
              onClick={() => choose(i)}
              className={`flex items-center justify-between gap-3 text-left px-4 py-3 rounded-lg border-2 transition-colors ${style}`}
            >
              <MathText text={opt} />
              {reveal && isCorrect && <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" aria-label="Correct answer" />}
              {reveal && isPicked && !isCorrect && <X className="h-5 w-5 text-red-600 flex-shrink-0" aria-label="Your answer, incorrect" />}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={next}
          disabled={picked === null}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {current + 1 === total ? 'Finish' : 'Next question'}
        </button>
      </div>
    </div>
  );
};

export default QuizRunner;
