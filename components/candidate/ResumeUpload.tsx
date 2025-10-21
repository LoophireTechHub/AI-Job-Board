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
