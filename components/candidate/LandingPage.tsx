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
