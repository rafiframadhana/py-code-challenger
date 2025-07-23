interface DifficultyTagProps {
  level: string;
  isDarkMode: boolean;
}

export default function DifficultyTag({ level, isDarkMode }: DifficultyTagProps) {
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return {
          bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-200',
          border: isDarkMode ? 'border-green-700' : 'border-green-400',
          text: isDarkMode ? 'text-green-400' : 'text-green-800',
        };
      case 'intermediate':
        return {
          bg: isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-200',
          border: isDarkMode ? 'border-yellow-700' : 'border-yellow-400',
          text: isDarkMode ? 'text-yellow-400' : 'text-yellow-800',
        };
      case 'advanced':
        return {
          bg: isDarkMode ? 'bg-red-900/30' : 'bg-red-200',
          border: isDarkMode ? 'border-red-700' : 'border-red-400',
          text: isDarkMode ? 'text-red-400' : 'text-red-800',
        };
      default:
        return {
          bg: isDarkMode ? 'bg-gray-800' : 'bg-gray-200',
          border: isDarkMode ? 'border-gray-600' : 'border-gray-400',
          text: isDarkMode ? 'text-gray-400' : 'text-gray-700',
        };
    }
  };

  const styles = getDifficultyStyles(level);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.border} ${styles.text}`}
    >
      {level}
    </span>
  );
}
