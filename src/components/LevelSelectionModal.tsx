import { X, Star, Target, Crown } from 'lucide-react';

interface LevelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelSelect: (level: string) => void;
  isDarkMode: boolean;
}

type ColorName = 'green' | 'blue' | 'purple';

interface Level {
  name: string;
  description: string;
  icon: typeof Target;
  color: ColorName;
  features: string[];
}

export default function LevelSelectionModal({ isOpen, onClose, onLevelSelect, isDarkMode }: LevelSelectionModalProps) {
  if (!isOpen) return null;

  const levels: Level[] = [
    {
      name: 'Beginner',
      description: 'Start with fundamental concepts and basic programming skills',
      icon: Target,
      color: 'green' as ColorName,
      features: ['Array Manipulation', 'Basic Loops', 'Simple Functions', 'String Operations']
    },
    {
      name: 'Intermediate',
      description: 'Build on your knowledge with more complex challenges',
      icon: Star,
      color: 'blue' as ColorName,
      features: ['Object Manipulation', 'Advanced Functions', 'Problem Solving', 'Algorithm Basics']
    },
    {
      name: 'Advanced',
      description: 'Master complex algorithms and advanced programming techniques',
      icon: Crown,
      color: 'purple' as ColorName,
      features: ['Complex Algorithms', 'Optimization', 'Data Structures', 'Advanced Patterns']
    }
  ];

  const handleLevelSelect = (levelName: string) => {
    onLevelSelect(levelName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-xl border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Choose Your Challenge Level
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Select a difficulty level to start your coding journey
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level) => {
              const IconComponent = level.icon;
              const colorClasses = {
                green: {
                  bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-50',
                  border: isDarkMode ? 'border-green-700' : 'border-green-200',
                  button: 'bg-green-600 hover:bg-green-700',
                  icon: isDarkMode ? 'text-green-400' : 'text-green-600',
                  iconBg: isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
                },
                blue: {
                  bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
                  border: isDarkMode ? 'border-blue-700' : 'border-blue-200',
                  button: 'bg-blue-600 hover:bg-blue-700',
                  icon: isDarkMode ? 'text-blue-400' : 'text-blue-600',
                  iconBg: isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                },
                purple: {
                  bg: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50',
                  border: isDarkMode ? 'border-purple-700' : 'border-purple-200',
                  button: 'bg-purple-600 hover:bg-purple-700',
                  icon: isDarkMode ? 'text-purple-400' : 'text-purple-600',
                  iconBg: isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'
                }
              }[level.color]!; // Non-null assertion since we know the color exists

              return (
                <div
                  key={level.name}
                  className={`${colorClasses.bg} ${colorClasses.border} border rounded-xl p-6 flex flex-col transition-all duration-200 hover:shadow-lg ${
                    isDarkMode ? 'hover:bg-opacity-50' : ''
                  }`}
                >
                  {/* Icon and Title */}
                  <div className="space-y-3 mb-4">
                    <div className={`${colorClasses.iconBg} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${colorClasses.icon}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {level.name}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {level.description}
                      </p>
                    </div>
                  </div>

                  {/* Features - This will grow to fill available space */}
                  <div className="space-y-2 flex-grow mb-6">
                    <h4 className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      What you'll learn:
                    </h4>
                    <ul className="space-y-1">
                      {level.features.map((feature, index) => (
                        <li
                          key={index}
                          className={`text-xs flex items-center space-x-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${colorClasses.icon}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button - This will always be at the bottom */}
                  <button
                    onClick={() => handleLevelSelect(level.name)}
                    className={`w-full ${colorClasses.button} text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105 mt-auto`}
                  >
                    Start {level.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
        } rounded-b-xl`}>
          <p className={`text-xs text-center ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Don't worry, you can switch between levels anytime during your practice session
          </p>
        </div>
      </div>
    </div>
  );
}
