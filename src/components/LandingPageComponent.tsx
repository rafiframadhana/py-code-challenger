import { Code, Target, Trophy, Zap, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  isDarkMode: boolean;
  onGetStarted: () => void;
}

export default function LandingPageComponent({ isDarkMode, onGetStarted }: LandingPageProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Main Content */}
          <div className="text-center lg:text-left space-y-6">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="flex justify-center lg:justify-start">
                <img src="/logo.png" alt="PyCodeChallenger Logo" className="w-20 h-20" />
              </div>
              <div>
                <h1 className={`text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  PyCodeChallenger
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                  Learn. Solve. Repeat.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className={`text-2xl lg:text-3xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Master Python Fundamentals
              </h2>
              <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Practice Python through 100+ interactive coding challenges. Build your skills with lists, 
                loops, functions, and algorithms with instant feedback and progressive difficulty.
              </p>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button
                onClick={onGetStarted}
                className={`group relative overflow-hidden inline-flex items-center space-x-2 px-3 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform ${
                  isDarkMode
                    ? 'bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 border-2 border-blue-700 hover:border-blue-500 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 hover:border-blue-400 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20'
                } hover:scale-105 hover:-translate-y-0.5`}
              >
                {/* Subtle background animation */}
                <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-800/10 to-indigo-800/10' 
                    : 'bg-gradient-to-r from-blue-100/50 to-indigo-100/50'
                }`}></div>
                
                {/* Content */}
                <div className="relative flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-blue-800/30 group-hover:bg-blue-700/40' 
                      : 'bg-blue-200/50 group-hover:bg-blue-300/60'
                  }`}>
                    <Code className="w-5 h-5 group-hover:rotate-6 transition-transform duration-200" />
                  </div>
                  <span className="font-bold">Start Coding Challenges</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
                
                {/* Subtle accent */}
                <div className={`absolute top-0 left-0 w-full h-0.5 transition-all duration-300 ${
                  isDarkMode 
                    ? ' from-blue-500 to-indigo-500 group-hover:h-1' 
                    : ' from-blue-400 to-indigo-400 group-hover:h-1'
                }`}></div>
              </button>
              
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                No signup required • Free to use • Start immediately
              </p>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Why Choose PyCodeChallenger?
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} flex-shrink-0`}>
                  <Target className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Structured Learning
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Progress through carefully crafted challenges from beginner to advanced levels
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} flex-shrink-0`}>
                  <Zap className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Instant Feedback
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get immediate results with comprehensive test cases and detailed explanations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} flex-shrink-0`}>
                  <Trophy className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Track Progress
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Monitor your improvement and celebrate completed challenges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
