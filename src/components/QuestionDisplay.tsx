import { useState } from "react";
import { Lightbulb, CheckCircle, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { Tooltip } from "react-tooltip";
import type { Challenge } from "../data/challenges";
import HintModal from "./HintModal";
import ConfirmModal from "./ConfirmModal";
import DifficultyTag from "./DifficultyTag";
import {
  getChallengeDifficulty,
  findNextChallenge,
  findPrevChallenge,
} from "../utils/challengeUtils";

interface QuestionDisplayProps {
  challenge: Challenge;
  isCompleted: boolean;
  isDarkMode: boolean;
  onChallengeSelect: (challenge: Challenge) => void;
  onResetProgress: (challengeId: string) => void;
}

export default function QuestionDisplay({
  challenge,
  isCompleted,
  isDarkMode,
  onChallengeSelect,
  onResetProgress,
}: QuestionDisplayProps) {
  const [showHint, setShowHint] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const difficulty = getChallengeDifficulty(challenge);
  const nextChallenge = findNextChallenge(challenge);
  const prevChallenge = findPrevChallenge(challenge);

  const handleNextChallenge = () => {
    if (nextChallenge) {
      onChallengeSelect(nextChallenge);
    }
  };

  const handlePrevChallenge = () => {
    if (prevChallenge) {
      onChallengeSelect(prevChallenge);
    }
  };

  const handleResetProgress = () => {
    onResetProgress(challenge.id);
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
            <h1
              className={`text-xl lg:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {challenge.title}
            </h1>
            <div className="flex items-center space-x-2">
              {difficulty && (
                <DifficultyTag level={difficulty} isDarkMode={isDarkMode} />
              )}
              {isCompleted && (
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" />
              )}
            </div>
          </div>
          <p
            className={`text-base lg:text-lg leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {challenge.description}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHint(true)}
            data-tooltip-id="hint-tooltip"
            data-tooltip-content="Get a helpful hint for this challenge"
            className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors self-start sm:self-auto ${
              isDarkMode
                ? "bg-yellow-900/20 hover:bg-yellow-900/30 text-yellow-400 border border-yellow-700"
                : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium"> Hint</span>
          </button>
          {isCompleted && (
            <button
              onClick={() => setShowResetConfirm(true)}
              data-tooltip-id="reset-tooltip"
              data-tooltip-content="Reset progress for this challenge"
              className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors self-start sm:self-auto ${
                isDarkMode
                  ? "bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-700"
                  : "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300"
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Test Cases Preview */}
      <div className="space-y-3">
        <h3
          className={`font-semibold ${
            isDarkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Example Test Cases
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {challenge.testCases.slice(0, 2).map((testCase, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300 shadow-sm"
              }`}
            >
              <div className="space-y-2">
                <div className="text-sm">
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Input:
                  </span>
                  <code
                    className={`ml-2 font-mono ${
                      isDarkMode ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    {testCase.input}
                  </code>
                </div>
                <div className="text-sm">
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Expected:
                  </span>
                  <code
                    className={`ml-2 font-mono ${
                      isDarkMode ? "text-green-400" : "text-green-700"
                    }`}
                  >
                    {JSON.stringify(testCase.expected)}
                  </code>
                </div>
                {testCase.description && (
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {testCase.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {challenge.testCases.length > 2 && (
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            + {challenge.testCases.length - 2} more test cases will be evaluated
          </p>
        )}
      </div>

      {/* Navigation buttons at the bottom */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-300 dark:border-gray-700">
        {prevChallenge ? (
          <>
            <button
              onClick={handlePrevChallenge}
              data-tooltip-id="prev-challenge-tooltip"
              data-tooltip-content={`Previous: ${prevChallenge.title}`}
              className={`flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 border border-blue-700"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Previous</span>
            </button>
          </>
        ) : (
          <div></div>
        )}

        {nextChallenge ? (
          <>
            <button
              onClick={handleNextChallenge}
              data-tooltip-id="next-challenge-tooltip"
              data-tooltip-content={`Next: ${nextChallenge.title}`}
              className={`flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 border border-blue-700"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300"
              }`}
            >
              <span className="text-sm font-medium">Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div></div>
        )}
      </div>

      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        hint={challenge.hint}
        isDarkMode={isDarkMode}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetProgress}
        title="Reset Challenge Progress"
        message={`Are you sure you want to reset your progress for "${challenge.title}" challenge? This action cannot be undone.`}
        confirmText="Reset"
        cancelText="Cancel"
        isDarkMode={isDarkMode}
        variant="danger"
      />

      {/* Tooltips */}
      <Tooltip
        id="hint-tooltip"
        place="bottom"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
          zIndex: 10000,
          marginTop: 5,
        }}
      />
      <Tooltip
        id="reset-tooltip"
        place="bottom"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
          zIndex: 10000,
          marginTop: 5,
        }}
      />
      <Tooltip
        id="prev-challenge-tooltip"
        place="bottom-start"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "14px",
          borderRadius: "6px",
          padding: "8px 16px",
          zIndex: 10000,
          marginTop: 5,
        }}
      />
      <Tooltip
        id="next-challenge-tooltip"
        place="bottom-end"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "14px",
          borderRadius: "6px",
          padding: "8px 16px",
          zIndex: 10000,
          marginTop: 5,
        }}
      />
    </div>
  );
}
