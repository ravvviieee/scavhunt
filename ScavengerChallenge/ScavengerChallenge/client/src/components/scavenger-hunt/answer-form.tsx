import { useHunt } from "@/contexts/hunt-context";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ImageUploadForm } from "@/components/submissions/image-upload-form"; 

export function AnswerForm() {
  const { 
    gameState, 
    huntData, 
    checkAnswer, 
    requestNextClue, 
    giveUpAndSkip 
  } = useHunt();
  
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  
  if (!huntData || huntData.length === 0) return null;
  
  const currentLocation = huntData[gameState.currentLocationIndex];
  const allCluesRevealed = gameState.visibleClueIndices.length === currentLocation.clues.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError("Please enter an answer");
      return;
    }
    
    // Check if the answer is correct before submitting
    const normalizedUserAnswer = answer.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    const normalizedCorrectAnswer = currentLocation.answer.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    const isCorrect = normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
                     normalizedCorrectAnswer.includes(normalizedUserAnswer);
    
    if (isCorrect && user) {
      // If user is logged in and answer is correct, show upload form
      setShowUploadForm(true);
      setCorrectAnswer(answer);
    } else {
      // Otherwise, proceed with normal answer checking
      checkAnswer(answer);
      setAnswer("");
      setError("");
    }
  };

  const handleClueRequest = () => {
    if (allCluesRevealed) {
      giveUpAndSkip();
    } else {
      requestNextClue();
    }
  };

  const handleUploadSuccess = () => {
    // After successful upload, proceed with the answer checking
    checkAnswer(correctAnswer);
    setAnswer("");
    setError("");
    setShowUploadForm(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      {showUploadForm ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Great! Your answer is correct!</h3>
          <p className="text-neutral-600 mb-4">
            Please upload a photo of the location or something related to prove your answer.
          </p>
          
          <ImageUploadForm 
            locationId={currentLocation.id!} 
            answer={correctAnswer} 
            onSuccess={handleUploadSuccess} 
          />
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                // Skip upload and proceed
                handleUploadSuccess();
              }}
            >
              Skip Photo Upload
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="answer-input" className="block text-sm font-medium text-neutral-700 mb-1">
              What's your guess?
            </label>
            <input 
              type="text" 
              id="answer-input"
              className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-accent' : 'border-neutral-300'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="Enter your answer..."
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (error) setError("");
              }}
            />
            {error && <p className="mt-1 text-sm text-accent">{error}</p>}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition"
            >
              Submit Answer
            </button>
            
            <button 
              type="button" 
              onClick={handleClueRequest}
              className="px-4 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition"
            >
              {allCluesRevealed ? "Give Up & Skip" : "Get Next Clue"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
