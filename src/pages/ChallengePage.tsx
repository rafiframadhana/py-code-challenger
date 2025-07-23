import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import QuestionDisplay from '../components/QuestionDisplay';
import CodeEditor from '../components/CodeEditor';
import Footer from '../components/Footer';
import LevelSelectionModal from '../components/LevelSelectionModal';
import AllChallengesCompleteModal from '../components/AllChallengesCompleteModal';
import { useTheme } from '../hooks/useTheme';
import { useProgress } from '../hooks/useProgress';
import { useSound } from '../hooks/useSound';
import { useDeviceType } from '../hooks/useDeviceType';
import { challengeData } from '../data/challenges';
import { areAllChallengesCompleted } from '../utils/challengeUtils';
import type { Challenge } from '../data/challenges';
import type { PythonTestResult } from '../utils/pythonExecutor';

export default function ChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { completedChallenges, markCompleted, isCompleted, resetChallenge, resetProgress } = useProgress();
  const { isSoundOn, toggleSound } = useSound();
  const isMobile = useDeviceType();
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showAllCompleteModal, setShowAllCompleteModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('desktopSidebarOpen');
    return stored !== null ? JSON.parse(stored) : false;
  });

  // Find challenge by ID
  const findChallengeById = (id: string): Challenge | null => {
    for (const level of Object.values(challengeData.levels)) {
      for (const challenges of Object.values(level)) {
        const challenge = challenges.find(c => c.id === id);
        if (challenge) return challenge;
      }
    }
    return null;
  };

  // Find the first uncompleted challenge in a specific level
  const findFirstUncompletedChallenge = (levelName: string): Challenge | null => {
    const level = challengeData.levels[levelName];
    if (!level) return null;

    for (const topicName in level) {
      const challenges = level[topicName];
      for (const challenge of challenges) {
        if (!isCompleted(challenge.id)) {
          return challenge;
        }
      }
    }

    const firstTopic = Object.keys(level)[0];
    return level[firstTopic]?.[0] || null;
  };

  // Update selected challenge based on URL parameter
  useEffect(() => {
    if (challengeId) {
      const challenge = findChallengeById(challengeId);
      if (challenge) {
        setSelectedChallenge(challenge);
      } else {
        // If challenge not found, redirect to home
        navigate('/');
      }
    } else {
      // If no challenge ID, redirect to home
      navigate('/');
    }
  }, [challengeId, navigate]);

  // Check if all challenges are completed - only show modal if coming from landing page
  useEffect(() => {
    if (selectedChallenge && areAllChallengesCompleted(completedChallenges)) {
      // Only show modal if user came from landing page (state contains fromLanding flag)
      if (location.state?.fromLanding) {
        setShowAllCompleteModal(true);
      }
    }
  }, [selectedChallenge, completedChallenges, location.state]);

  const handleLevelSelect = (levelName: string) => {
    const firstChallenge = findFirstUncompletedChallenge(levelName);
    if (firstChallenge) {
      navigate(`/challenge/${firstChallenge.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowLevelModal(false);
  };

  const handleLogoClick = () => {
    navigate('/');
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleDesktopSidebar = () => {
    const newState = !isDesktopSidebarOpen;
    setIsDesktopSidebarOpen(newState);
    localStorage.setItem('desktopSidebarOpen', JSON.stringify(newState));
  };

  const handleCodeEvaluate = (_code: string, results: PythonTestResult[]) => {
    if (selectedChallenge && results.length > 0 && results.every(r => r.passed)) {
      markCompleted(selectedChallenge.id);
      
      // Check if this was the last challenge and show completion modal
      setTimeout(() => {
        const updatedCompleted = new Set(completedChallenges);
        updatedCompleted.add(selectedChallenge.id);
        if (areAllChallengesCompleted(updatedCompleted)) {
          setShowAllCompleteModal(true);
        }
      }, 500); // Small delay to let the success animation play first
    }
  };

  const handleChallengeSelect = (challenge: Challenge) => {
    navigate(`/challenge/${challenge.id}`);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedChallenge) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        onLogoClick={handleLogoClick}
        isSoundOn={isSoundOn}
        onSoundToggle={toggleSound}
        onMobileSidebarToggle={toggleMobileSidebar}
        onDesktopSidebarToggle={toggleDesktopSidebar}
        showMobileSidebarToggle={isMobile}
        showDesktopSidebarToggle={!isMobile}
        showUtilityButtons={true}
      />

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row relative">
        {/* Main content area - always takes full space */}
        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row min-h-0">
          {/* Question Panel */}
          <div className="w-full lg:w-1/2 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <QuestionDisplay
                challenge={selectedChallenge}
                isDarkMode={isDarkMode}
                isCompleted={isCompleted(selectedChallenge.id)}
                onChallengeSelect={handleChallengeSelect}
                onResetProgress={resetChallenge}
              />
            </div>
          </div>
          
          {/* Code Editor Panel */}
          <div className={`w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto flex-1 min-h-0`}>
            <div className="p-4 sm:p-6 h-full">
              <CodeEditor
                key={selectedChallenge.id}
                challenge={selectedChallenge}
                onCodeEvaluate={handleCodeEvaluate}
                onChallengeSelect={handleChallengeSelect}
                completedChallenges={completedChallenges}
                isDarkMode={isDarkMode}
                isSoundOn={isSoundOn}
              />
            </div>
          </div>
        </div>

        {/* Mobile sidebar - left side overlay */}
        {isMobile && isMobileSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden animate-slide-in-left">
              <Sidebar
                selectedChallenge={selectedChallenge}
                onChallengeSelect={handleChallengeSelect}
                completedChallenges={completedChallenges}
                isDarkMode={isDarkMode}
                isMobileOpen={true}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Desktop sidebar - right side overlay */}
        {!isMobile && isDesktopSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
              onClick={() => {
                setIsDesktopSidebarOpen(false);
                localStorage.setItem('desktopSidebarOpen', JSON.stringify(false));
              }}
            />
            <div className="fixed inset-y-0 right-0 z-50 w-80 animate-slide-in-right">
              <Sidebar
                selectedChallenge={selectedChallenge}
                onChallengeSelect={handleChallengeSelect}
                completedChallenges={completedChallenges}
                isDarkMode={isDarkMode}
                isMobileOpen={false}
                onMobileClose={() => {
                  setIsDesktopSidebarOpen(false);
                  localStorage.setItem('desktopSidebarOpen', JSON.stringify(false));
                }}
              />
            </div>
          </>
        )}
      </div>

      <Footer isDarkMode={isDarkMode} />

      {showLevelModal && (
        <LevelSelectionModal
          isOpen={showLevelModal}
          onLevelSelect={handleLevelSelect}
          onClose={() => setShowLevelModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

      <AllChallengesCompleteModal
        isOpen={showAllCompleteModal}
        onClose={() => setShowAllCompleteModal(false)}
        onResetAll={resetProgress}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
