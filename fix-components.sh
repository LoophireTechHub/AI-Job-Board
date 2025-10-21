#!/bin/bash

# Update LandingPage
cat > components/candidate/LandingPage.tsx << 'LAND'
'use client';
import React from 'react';
export function LandingPage({ onStartInterview }: any) {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-bold">🤖 AI Career Coach</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-slate-900 mb-6">Discover Your Career Match in 10 Minutes</h1>
          <p className="text-xl text-slate-600 mb-12">Chat with our AI Career Coach • Get instant feedback • Know your score</p>
          <button onClick={onStartInterview} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition">🚀 Start Your Journey (Free)</button>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
            <div className="bg-white p-6 rounded-lg shadow"><div className="text-4xl mb-3">⚡</div><h3 className="font-bold text-lg mb-2">10-Minute Assessment</h3><p className="text-slate-600">Quick engagement</p></div>
            <div className="bg-white p-6 rounded-lg shadow"><div className="text-4xl mb-3">🎯</div><h3 className="font-bold text-lg mb-2">Instant Match Score</h3><p className="text-slate-600">Know your fit</p></div>
            <div className="bg-white p-6 rounded-lg shadow"><div className="text-4xl mb-3">💡</div><h3 className="font-bold text-lg mb-2">Personalized Insights</h3><p className="text-slate-600">Career guidance</p></div>
            <div className="bg-white p-6 rounded-lg shadow"><div className="text-4xl mb-3">📱</div><h3 className="font-bold text-lg mb-2">Mobile Optimized</h3><p className="text-slate-600">Any device</p></div>
          </div>
        </div>
      </div>
      <div className="bg-green-50 py-16 px-4"><div className="max-w-4xl mx-auto"><h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2><div className="grid grid-cols-3 gap-8"><div className="text-center"><div className="text-5xl font-bold text-green-600">94%</div><p className="text-slate-600 mt-2">Completion</p></div><div className="text-center"><div className="text-5xl font-bold text-green-600">2min</div><p className="text-slate-600 mt-2">Response</p></div><div className="text-center"><div className="text-5xl font-bold text-green-600">92%</div><p className="text-slate-600 mt-2">Match</p></div></div></div></div>
    </div>
  );
}
LAND

# Update ResumeUpload
cat > components/candidate/ResumeUpload.tsx << 'RESUM'
'use client';
import React, { useState } from 'react';
export function ResumeUpload({ onResumeUpload }: any) {
  const [fileName, setFileName] = useState('');
  const handleFile = (file: File) => {
    setFileName(file.name);
    setTimeout(() => onResumeUpload({ fileName: file.name }), 500);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Upload Your Resume</h1>
        <p className="text-center text-slate-600 mb-12">Let's learn more about you</p>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-white hover:border-indigo-400 transition">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">Drag and drop your resume</h3>
          <p className="text-slate-600 mb-4">or</p>
          <label><input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => e.target.files && handleFile(e.target.files[0])} className="hidden" /><span className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg cursor-pointer">Browse Files</span></label>
        </div>
        {fileName && <div className="mt-8 bg-white p-4 rounded-lg border-2 border-green-200"><div className="flex items-center gap-3"><span className="text-2xl">✅</span><div><p className="font-semibold">{fileName}</p><p className="text-sm text-green-600">Ready</p></div></div></div>}
      </div>
    </div>
  );
}
RESUM

# Update InterviewChat
cat > components/candidate/InterviewChat.tsx << 'INTER'
'use client';
import React, { useState } from 'react';
const QUESTIONS = ["Tell me about your background.", "What are your key skills?", "Describe a problem you solved.", "Where do you see yourself in 5 years?", "Why this role interests you?"];
export function InterviewChat({ onInterviewComplete }: any) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ id: 1, text: QUESTIONS[0], sender: 'ai' }]);
  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: messages.length + 1, text: input, sender: 'user' }]);
    setInput('');
    if (current < QUESTIONS.length - 1) {
      setTimeout(() => {
        const next = current + 1;
        setCurrent(next);
        setMessages(m => [...m, { id: m.length + 1, text: QUESTIONS[next], sender: 'ai' }]);
      }, 500);
    } else {
      setTimeout(() => onInterviewComplete({ score: 87 }), 500);
    }
  };
  const progress = Math.round(((current + 1) / QUESTIONS.length) * 100);
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center"><h1 className="text-2xl font-bold">Interview</h1><div className="text-right"><p className="text-sm">Question {current + 1} of {QUESTIONS.length}</p><p className="text-2xl font-bold">{progress}%</p></div></div>
      </div>
      <div className="w-full h-1 bg-slate-200"><div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }}></div></div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4 py-6">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-3 rounded-lg ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}><p>{m.text}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your answer..." className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          <button onClick={handleSend} disabled={!input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50">Send</button>
        </div>
      </div>
    </div>
  );
}
INTER

# Update ResultsPage
cat > components/candidate/ResultsPage.tsx << 'RESULT'
'use client';
import React from 'react';
export function ResultsPage({ onStartOver }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center"><h1 className="text-5xl font-bold mb-2">Interview Complete! 🎉</h1><p className="text-green-100 text-lg">Here's your performance...</p></div>
      </div>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-12 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white mb-8"><div className="text-7xl font-bold">87</div></div>
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Your Match Score</h2>
          <p className="text-lg text-slate-600">Excellent! You're a great fit 💪</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center"><div className="text-4xl mb-3">⭐</div><h3 className="font-semibold mb-2">Performance</h3><p className="text-2xl font-bold text-blue-600">Excellent</p></div>
          <div className="bg-white rounded-lg shadow p-6 text-center"><div className="text-4xl mb-3">⏱️</div><h3 className="font-semibold mb-2">Time</h3><p className="text-2xl font-bold text-green-600">8 min</p></div>
          <div className="bg-white rounded-lg shadow p-6 text-center"><div className="text-4xl mb-3">✅</div><h3 className="font-semibold mb-2">Questions</h3><p className="text-2xl font-bold text-purple-600">5 of 5</p></div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">Skills</h3>
          <div className="space-y-4">
            <div><div className="flex justify-between mb-2"><span className="font-semibold">Problem Solving</span><span>92%</span></div><div className="bg-slate-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{width:'92%'}}></div></div></div>
            <div><div className="flex justify-between mb-2"><span className="font-semibold">Communication</span><span>85%</span></div><div className="bg-slate-200 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{width:'85%'}}></div></div></div>
          </div>
        </div>
        <button onClick={onStartOver} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg">Start Again</button>
      </div>
    </div>
  );
}
RESULT

# Update CandidateDashboard
cat > components/candidate/CandidateDashboard.tsx << 'DASH'
'use client';
import React, { useState } from 'react';
import { LandingPage } from './LandingPage';
import { ResumeUpload } from './ResumeUpload';
import { InterviewChat } from './InterviewChat';
import { ResultsPage } from './ResultsPage';
type DashboardPage = 'landing' | 'upload' | 'interview' | 'results';
export function CandidateDashboard() {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('landing');
  return (
    <div>
      {currentPage === 'landing' && <LandingPage onStartInterview={() => setCurrentPage('upload')} />}
      {currentPage === 'upload' && <ResumeUpload onResumeUpload={() => setCurrentPage('interview')} />}
      {currentPage === 'interview' && <InterviewChat onInterviewComplete={() => setCurrentPage('results')} />}
      {currentPage === 'results' && <ResultsPage onStartOver={() => setCurrentPage('landing')} />}
    </div>
  );
}
DASH

echo "✅ All components updated!"
