import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import LandingPageComponent from '../components/LandingPageComponent';
import Footer from '../components/Footer';
import LevelSelectionModal from '../components/LevelSelectionModal';
import { useTheme } from '../hooks/useTheme';
import { useProgress } from '../hooks/useProgress';
import { useSound } from '../hooks/useSound';
import { challengeData } from '../data/challenges';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isCompleted } = useProgress();
  const { isSoundOn, toggleSound } = useSound();
  const [showLevelModal, setShowLevelModal] = useState(false);

  // Find the first uncompleted challenge in a specific level
  const findFirstUncompletedChallenge = (levelName: string) => {
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

  const handleGetStarted = () => {
    setShowLevelModal(true);
  };

  const handleLevelSelect = (levelName: string) => {
    const firstChallenge = findFirstUncompletedChallenge(levelName);
    if (firstChallenge) {
      navigate(`/challenge/${firstChallenge.id}`, { state: { fromLanding: true } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowLevelModal(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        isSoundOn={isSoundOn}
        onSoundToggle={toggleSound}
        showMobileSidebarToggle={false}
        showDesktopSidebarToggle={false}
        showUtilityButtons={false}
      />

      <LandingPageComponent
        isDarkMode={isDarkMode}
        onGetStarted={handleGetStarted}
      />

      <Footer isDarkMode={isDarkMode} />

      {showLevelModal && (
        <LevelSelectionModal
          isOpen={showLevelModal}
          onLevelSelect={handleLevelSelect}
          onClose={() => setShowLevelModal(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
