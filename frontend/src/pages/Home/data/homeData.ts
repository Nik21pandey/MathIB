import { 
  Book, 
  MessageQuestion, 
  DocumentText, 
  Chart 
} from 'iconsax-react';
import { ComponentType } from 'react';

export interface Stat {
  label: string;
  value: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: ComponentType<any>;
  link: string;
  color: string;
}

export const homeStats: Stat[] = [
  { label: 'Past Papers', value: '2,500+' },
  { label: 'Questions', value: '50,000+' },
  { label: 'Active Users', value: '10,000+' },
  { label: 'Success Rate', value: '94%' }
];

export const homeFeatures: Feature[] = [
  {
    title: 'Past Papers Library',
    description: 'Access thousands of IB past papers with detailed mark schemes and examiner reports',
    icon: Book,
    link: '/papers',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Question Bank',
    description: 'Graded questions with step-by-step mark schemes, organized by syllabus, topic and difficulty',
    icon: MessageQuestion,
    link: '/contents',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Worksheet Builder',
    description: 'Pick questions and export a student booklet and a teacher mark scheme as PDFs',
    icon: DocumentText,
    link: '/worksheet-builder',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Progress Tracking',
    description: 'Red, amber and green mastery for every topic, updated as you practise',
    icon: Chart,
    link: '/learn',
    color: 'from-orange-500 to-orange-600'
  }
];