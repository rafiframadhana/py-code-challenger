import { useState, useEffect } from 'react';

export function useSound() {
  const [isSoundOn, setIsSoundOn] = useState(() => {
    const stored = localStorage.getItem('soundEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(isSoundOn));
  }, [isSoundOn]);

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

  return {
    isSoundOn,
    toggleSound,
  };
}
