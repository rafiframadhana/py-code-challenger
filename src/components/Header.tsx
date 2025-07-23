import { useState } from "react";
import { Moon, Sun, RotateCcw, Menu, Volume2, VolumeX } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useProgress } from "../hooks/useProgress";
import ConfirmModal from "./ConfirmModal";

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isSoundOn: boolean;
  onSoundToggle: () => void;
  onLogoClick?: () => void;
  onMobileSidebarToggle?: () => void;
  onDesktopSidebarToggle?: () => void;
  showMobileSidebarToggle?: boolean;
  showDesktopSidebarToggle?: boolean;
  showUtilityButtons?: boolean; // New prop to control progress/sound buttons
}

export default function Header({
  isDarkMode,
  onThemeToggle,
  isSoundOn,
  onSoundToggle,
  onLogoClick,
  onMobileSidebarToggle,
  onDesktopSidebarToggle,
  showMobileSidebarToggle,
  showDesktopSidebarToggle,
  showUtilityButtons = true, // Default to true for backward compatibility
}: HeaderProps) {
  const { resetProgress } = useProgress();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleResetProgress = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    resetProgress();
    window.location.reload();
  };

  return (
    <>
      <header
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-300 shadow-sm"
        } border-b px-4 sm:px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onLogoClick}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-75 transition-opacity duration-200"
            >
              <img
                src="/logo.png"
                alt="PyCodeChallenger Logo"
                className="w-8 h-8 sm:w-11 sm:h-11"
              />
              <div className="text-left">
                <h1
                  className={`text-sm sm:text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <span className="sm:inline">PyCodeChallenger</span>
                </h1>
                <p
                  className={`text-xs sm:text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Learn. Solve. Repeat.
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Utility buttons - only show when not on landing page */}
            {showUtilityButtons && (
              <>
                <button
                  onClick={handleResetProgress}
                  data-tooltip-id="reset-progress-tooltip"
                  data-tooltip-content="Reset all progress and start over"
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  <RotateCcw className="md:w-4 md:h-4 w-5 h-5" />
                  <span className="text-xs sm:text-sm hidden sm:inline">
                    Reset Progress
                  </span>
                </button>


                <button
                  onClick={onSoundToggle}
                  data-tooltip-id="sound-tooltip"
                  data-tooltip-content={isSoundOn ? "Turn off sounds" : "Turn on sounds"}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {isSoundOn ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
    
              </>
            )}

            <button
              onClick={onThemeToggle}
              data-tooltip-id="theme-tooltip"
              data-tooltip-content={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                  : "bg-gray-200 hover:bg-gray-300 text-orange-600"
              }`}
  
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
  

            {/* Desktop Sidebar Toggle */}
            {showDesktopSidebarToggle && (
              <>
                <button
                  onClick={onDesktopSidebarToggle}
                  data-tooltip-id="desktop-menu-tooltip"
                  data-tooltip-content="Coding Challenges"
                  className={`hidden lg:block p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
    
                >
                  <Menu className="w-5 h-5" />
                </button>
 
              </>
            )}

            {/* Mobile Sidebar Toggle */}
            {showMobileSidebarToggle && (
              <>
                <button
                  onClick={onMobileSidebarToggle}
                  className={`lg:hidden p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="Reset Progress"
        message="Are you sure you want to reset all progress? This action cannot be undone and you will lose all completed challenges."
        confirmText="Reset"
        cancelText="Cancel"
        isDarkMode={isDarkMode}
        variant="danger"
      />

      {/* Tooltips */}
      <Tooltip
        id="reset-progress-tooltip"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
        }}
      />
      <Tooltip
        id="sound-tooltip"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
        }}
      />
      <Tooltip
        id="theme-tooltip"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
        }}
      />
      <Tooltip
        id="desktop-menu-tooltip"
        place="bottom-end"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
        }}
      />
    </>
  );
}
