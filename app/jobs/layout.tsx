import type { ReactNode } from 'react';

export const metadata = {
    title: 'Find Your Next Opportunity | AI Job Board',
    description: 'Browse and apply to jobs with AI-powered candidate screening',
};

export default function JobsLayout({
    children,
}: {
    children: ReactNode;
}) {
    return children;
}
