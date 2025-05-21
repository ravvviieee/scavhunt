import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';

export default function WelcomePage() {
  const [instructions, setInstructions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const response = await fetch('/api/intro');
        if (response.ok) {
          const data = await response.json();
          setInstructions(data.instructions);
        }
      } catch (error) {
        console.error('Failed to fetch instructions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructions();
  }, []);

  const handleStart = () => {
    if (user) {
      setLocation('/hunt');
    } else {
      setLocation('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-primary">Scavenger Hunt Adventure</CardTitle>
            <CardDescription className="text-lg mt-2">
              Embark on an exciting journey solving clues to find hidden locations!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">How It Works</h3>
                <ul className="space-y-3">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary bg-opacity-20 text-primary text-sm font-medium mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-neutral-700">{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Features</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Progressive clue reveals to help you along</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Submit photos to verify your discoveries</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Save your progress and continue anytime</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Admin feedback on your submissions</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-2 pb-6">
            <Button size="lg" className="w-full md:w-auto px-8" onClick={handleStart}>
              {user ? 'Start the Hunt' : 'Login to Begin'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}