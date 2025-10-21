'use client';
import React, { useState } from 'react';

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Tech Startup Inc',
    description: 'We are looking for an experienced React developer to join our fast-growing team.',
    requirements: ['5+ years React', '3+ years TypeScript', 'Redux/Context API', 'Testing experience'],
    salary: '$120k - $160k',
    location: 'San Francisco, CA',
    type: 'Full-time'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'Innovation Labs',
    description: 'Build scalable web applications using modern tech stack. Work with Next.js and Node.js.',
    requirements: ['Next.js experience', 'PostgreSQL', 'REST API design', 'DevOps basics'],
    salary: '$100k - $140k',
    location: 'Remote',
    type: 'Full-time'
  },
  {
    id: '3',
    title: 'Python Backend Engineer',
    company: 'Data Systems Co',
    description: 'Develop robust backend systems for data processing and API services.',
    requirements: ['Python 3.9+', 'FastAPI/Django', 'SQL databases', 'Microservices'],
    salary: '$110k - $150k',
    location: 'New York, NY',
    type: 'Full-time'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'Cloud Infrastructure',
    description: 'Design and maintain cloud infrastructure using AWS and Kubernetes.',
    requirements: ['AWS/GCP', 'Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code'],
    salary: '$130k - $170k',
    location: 'Remote',
    type: 'Full-time'
  }
];

interface JobSelectionProps {
  onJobSelected: (job: any) => void;
}

export function JobSelection({ onJobSelected }: JobSelectionProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleSelectJob = (job: any) => {
    setSelectedJobId(job.id);
    setTimeout(() => {
      onJobSelected(job);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Position</h1>
          <p className="text-lg text-slate-600">Select a job opening to apply for and start your interview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_JOBS.map(job => (
            <div
              key={job.id}
              onClick={() => handleSelectJob(job)}
              className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all transform hover:scale-105 ${
                selectedJobId === job.id ? "ring-2 ring-indigo-600 scale-105" : "hover:shadow-xl"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{job.title}</h3>
                  <p className="text-indigo-600 font-semibold">{job.company}</p>
                </div>
                {selectedJobId === job.id && (
                  <div className="text-2xl">✅</div>
                )}
              </div>

              <p className="text-slate-600 mb-4">{job.description}</p>

              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Requirements:</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">SALARY</p>
                  <p className="font-bold text-slate-900">{job.salary}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">LOCATION</p>
                  <p className="font-bold text-slate-900">{job.location}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">TYPE</p>
                  <p className="font-bold text-slate-900">{job.type}</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectJob(job);
                }}
                className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold transition ${
                  selectedJobId === job.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {selectedJobId === job.id ? "Selected ✓" : "Select This Job"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
