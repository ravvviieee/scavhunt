import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/nav/header';

type Submission = {
  id: number;
  locationId: number;
  imageUrl: string;
  answer: string;
  correctAnswer: boolean;
  submittedAt: string;
  adminComment: string | null;
  reviewed: boolean;
};

export default function MySubmissionsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch user submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['/api/submissions/my'],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">My Submissions</h1>
            <p className="text-neutral-600">View all your location submissions and admin feedback</p>
          </div>
          <Button onClick={() => setLocation('/hunt')}>Back to Hunt</Button>
        </div>
        
        {submissions && submissions.length > 0 ? (
          <div className="grid gap-6">
            {submissions.map((submission: Submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <p className="text-neutral-600 mb-5">You haven't made any submissions yet.</p>
              <Button onClick={() => setLocation('/hunt')}>
                Start Hunting
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              Submission #{submission.id}
              {submission.reviewed && (
                <span className="ml-2 text-sm font-normal bg-green-100 text-green-800 py-1 px-2 rounded">
                  Reviewed
                </span>
              )}
            </CardTitle>
            <div className="text-sm text-neutral-500 mt-1">
              Submitted: {formatDate(submission.submittedAt)}
            </div>
          </div>
          <div className={`text-sm font-medium ${submission.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
            {submission.correctAnswer ? 'Correct Answer' : 'Incorrect Answer'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Your Answer</h3>
            <p className="text-neutral-700 bg-neutral-50 p-3 rounded">
              {submission.answer}
            </p>
            
            {submission.reviewed && submission.adminComment && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Admin Feedback</h3>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded text-neutral-700">
                  {submission.adminComment}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Your Photo</h3>
            <div className="border rounded overflow-hidden bg-neutral-50">
              <img 
                src={submission.imageUrl} 
                alt="Your submission" 
                className="w-full h-auto max-h-[300px] object-contain"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}