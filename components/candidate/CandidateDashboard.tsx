'use client';
import React, { useState } from 'react';
import { LandingPage } from './LandingPage';
import { ResumeUpload } from './ResumeUpload';
import { JobSelection } from './JobSelection';
import { InterviewChat } from './InterviewChat';
import { ResultsPage } from './ResultsPage';

type DashboardPage = 'landing' | 'upload' | 'jobs' | 'interview' | 'results';

export function CandidateDashboard() {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('landing');
  const [resumeData, setResumeData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleResumeUpload = (data: any) => {
    setResumeData(data);
    setCurrentPage('jobs');
  };

  const handleJobSelected = (job: any) => {
    setSelectedJob(job);
    setCurrentPage('interview');
  };

  const handleInterviewComplete = () => {
    setCurrentPage('results');
  };

  const handleStartOver = () => {
    setCurrentPage('landing');
    setResumeData(null);
    setSelectedJob(null);
  };

  return (
    <div>
      {currentPage === 'landing' && (
        <LandingPage onStartInterview={() => setCurrentPage('upload')} />
      )}
      
      {currentPage === 'upload' && (
        <ResumeUpload onResumeUpload={handleResumeUpload} />
      )}
      
      {currentPage === 'jobs' && (
        <JobSelection onJobSelected={handleJobSelected} />
      )}
      
      {currentPage === 'interview' && selectedJob && (
        <InterviewChat job={selectedJob} onInterviewComplete={handleInterviewComplete} />
      )}
      
      {currentPage === 'results' && (
        <ResultsPage onStartOver={handleStartOver} />
      )}
    </div>
  );
}
