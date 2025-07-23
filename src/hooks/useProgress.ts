import { useState, useEffect } from 'react';

export function useProgress() {
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('completed-challenges');
    if (saved) {
      try {
        const completed = JSON.parse(saved);
        setCompletedChallenges(new Set(completed));
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  const markCompleted = (challengeId: string) => {
    const newCompleted = new Set(completedChallenges);
    newCompleted.add(challengeId);
    setCompletedChallenges(newCompleted);
    localStorage.setItem('completed-challenges', JSON.stringify(Array.from(newCompleted)));
  };

  const isCompleted = (challengeId: string) => {
    return completedChallenges.has(challengeId);
  };

  const resetProgress = () => {
    setCompletedChallenges(new Set());
    localStorage.removeItem('completed-challenges');
  };

  const resetChallenge = (challengeId: string) => {
    const newCompleted = new Set(completedChallenges);
    newCompleted.delete(challengeId);
    setCompletedChallenges(newCompleted);
    localStorage.setItem('completed-challenges', JSON.stringify(Array.from(newCompleted)));
  };

  return {
    completedChallenges,
    markCompleted,
    isCompleted,
    resetProgress,
    resetChallenge
  };
}