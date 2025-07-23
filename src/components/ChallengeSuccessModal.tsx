import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Trophy, X } from 'lucide-react';
import type { Challenge } from '../data/challenges';

interface ChallengeSuccessModalProps {
  isOpen: boolean;
  challenge: Challenge;
  onClose: () => void;
  onContinue: () => void;
  isDarkMode: boolean;
  hasNextChallenge: boolean;
}

export default function ChallengeSuccessModal({
  isOpen,
  challenge,
  onClose,
  onContinue,
  isDarkMode,
  hasNextChallenge
}: ChallengeSuccessModalProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow for smooth animation
      const timer = setTimeout(() => setShowModal(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    setShowModal(false);
    setTimeout(() => {
      onContinue();
      onClose();
    }, 300);
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out
        ${showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Header */}
        <div className="relative p-6 text-center">
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Challenge Completed! 🎉
            </h2>
            
            <div className="space-y-2">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                "{challenge.title}"
              </h3>
              
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Excellent work! You've successfully solved this challenge.
                {hasNextChallenge 
                  ? " Ready for the next one?" 
                  : " You've completed all available challenges in this section!"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`px-6 py-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Stay Here
            </button>
            
            {hasNextChallenge ? (
              <button
                onClick={handleContinue}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                <span>Browse Challenges</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fun Fact or Encouragement */}
        <div className={`px-6 py-3 rounded-b-xl ${
          isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
        }`}>
          <p className={`text-xs text-center ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            💡 Great problem-solving skills! Keep up the momentum.
          </p>
        </div>
      </div>
    </div>
  );
}
