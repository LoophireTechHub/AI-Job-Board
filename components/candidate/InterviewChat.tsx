'use client';
import React, { useState } from 'react';

const QUESTIONS_BY_ROLE: { [key: string]: string[] } = {
  'senior-react': [
    'Tell me about your experience with React hooks and state management.',
    'How do you optimize performance in large React applications?',
    'Describe your approach to testing React components.',
    'How do you handle complex component compositions?',
    'What patterns do you use for managing side effects?'
  ],
  'full-stack': [
    'Explain your experience with Next.js and backend development.',
    'How do you design scalable REST APIs?',
    'Tell me about database optimization techniques you have used.',
    'How do you approach full-stack security?',
    'Describe your deployment and DevOps experience.'
  ],
  'python': [
    'What Python frameworks have you used and why?',
    'Explain how you design efficient database queries.',
    'Tell me about your experience with microservices.',
    'How do you handle error handling and logging in production?',
    'Describe your approach to code testing and CI/CD.'
  ],
  'devops': [
    'Describe your experience with cloud platforms like AWS or GCP.',
    'How do you design scalable infrastructure?',
    'Tell me about your Kubernetes experience.',
    'How do you approach monitoring and alerting?',
    'Describe your CI/CD pipeline setup.'
  ]
};

const getQuestionsForJob = (jobTitle: string): string[] => {
  if (jobTitle.includes('React')) return QUESTIONS_BY_ROLE['senior-react'];
  if (jobTitle.includes('Full Stack')) return QUESTIONS_BY_ROLE['full-stack'];
  if (jobTitle.includes('Python')) return QUESTIONS_BY_ROLE['python'];
  if (jobTitle.includes('DevOps')) return QUESTIONS_BY_ROLE['devops'];
  return QUESTIONS_BY_ROLE['full-stack'];
};

interface InterviewChatProps {
  job: any;
  onInterviewComplete: () => void;
}

export function InterviewChat({ job, onInterviewComplete }: InterviewChatProps) {
  const questions = getQuestionsForJob(job.title);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ id: 1, text: questions[0], sender: 'ai' }]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { id: messages.length + 1, text: input, sender: 'user' }]);
    setInput('');

    if (current < questions.length - 1) {
      setTimeout(() => {
        const next = current + 1;
        setCurrent(next);
        setMessages(m => [...m, { id: m.length + 1, text: questions[next], sender: 'ai' }]);
      }, 500);
    } else {
      setTimeout(() => onInterviewComplete(), 500);
    }
  };

  const progress = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Interview for {job.title}</h1>
          <p className="text-indigo-100 mb-4">at {job.company}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm">Question {current + 1} of {questions.length}</span>
            <span className="text-2xl font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="w-full h-1 bg-slate-200">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4 py-6">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
