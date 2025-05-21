import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type Submission = {
  id: number;
  userId: number;
  locationId: number;
  imageUrl: string;
  answer: string;
  correctAnswer: boolean;
  submittedAt: string;
  adminComment: string | null;
  reviewed: boolean;
};

export default function AdminSubmissionsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page',
        variant: 'destructive',
      });
    }
  }, [user, setLocation, toast]);
  
  // Fetch submissions
  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/submissions'],
    enabled: !!user?.isAdmin,
  });
  
  if (!user || !user.isAdmin) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-100 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Submission Review</h1>
            <p className="text-neutral-600">Review and comment on user location submissions</p>
          </div>
          <Button onClick={() => setLocation('/')}>Back to Hunt</Button>
        </div>
        
        {submissions && submissions.length > 0 ? (
          <div className="grid gap-6">
            {submissions.map((submission: Submission) => (
              <SubmissionCard 
                key={submission.id} 
                submission={submission} 
                onUpdated={refetch}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <p className="text-neutral-600">No submissions to review yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ 
  submission, 
  onUpdated 
}: { 
  submission: Submission; 
  onUpdated: () => void;
}) {
  const [comment, setComment] = useState(submission.adminComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmitReview = async (reviewed: boolean) => {
    if (!comment.trim()) {
      toast({
        title: 'Error',
        description: 'Please add a comment before submitting review',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest('PUT', `/api/admin/submissions/${submission.id}`, {
        adminComment: comment,
        reviewed
      });
      
      toast({
        title: 'Success',
        description: 'Review submitted successfully',
      });
      
      onUpdated();
    } catch (error) {
      console.error('Review error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            <h3 className="font-medium mb-2">User Answer</h3>
            <p className="text-neutral-700 bg-neutral-50 p-3 rounded">
              {submission.answer}
            </p>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Admin Comment</h3>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your feedback for the user..."
                className="min-h-[120px]"
                disabled={submission.reviewed || isSubmitting}
              />
            </div>
            
            {!submission.reviewed && (
              <div className="mt-4 flex space-x-3">
                <Button 
                  onClick={() => handleSubmitReview(true)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Submit Review
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Submitted Image</h3>
            <div className="border rounded overflow-hidden bg-neutral-50">
              <img 
                src={submission.imageUrl} 
                alt="User submission" 
                className="w-full h-auto max-h-[300px] object-contain"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}