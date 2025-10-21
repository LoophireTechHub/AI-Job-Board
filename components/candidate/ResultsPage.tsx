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
