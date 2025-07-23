import { Trophy, RotateCcw, X } from "lucide-react";

interface AllChallengesCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAll: () => void;
  isDarkMode: boolean;
}

export default function AllChallengesCompleteModal({
  isOpen,
  onClose,
  onResetAll,
  isDarkMode,
}: AllChallengesCompleteModalProps) {
  if (!isOpen) return null;

  const handleResetAll = () => {
    onResetAll();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-[50] w-full max-w-lg mx-4 p-8 rounded-xl shadow-xl transform ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-md transition-colors ${
            isDarkMode
              ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Trophy icon with animation */}
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="w-20 h-20 text-yellow-500 animate-bounce" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🎉 Congratulations! 🎉
            </h2>
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              You've completed all challenges!
            </p>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <p
              className={`text-base leading-relaxed ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Amazing work! You've successfully solved all 100+ coding challenges. 
              Your dedication and problem-solving skills are truly impressive! 🚀
            </p>
            <p
              className={`text-sm italic ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              (I hope you didn't use ChatGPT to solve all of them! 😉)
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
              }`}
            >
              Keep Progress
            </button>
            <button
              onClick={handleResetAll}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          </div>

          <p
            className={`text-xs ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Ready for another round of challenges?
          </p>
        </div>
      </div>
    </div>
  );
}
