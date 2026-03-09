import { useEffect, useState, useCallback } from 'react';

interface SoundMap {
  tap: HTMLAudioElement | null;
  success: HTMLAudioElement | null;
  transition: HTMLAudioElement | null;
  chime: HTMLAudioElement | null;
}

const sounds: SoundMap = {
  tap: null,
  success: null,
  transition: null,
  chime: null,
};

let soundsLoaded = false;
let soundsEnabled = true;

async function loadSounds() {
  if (soundsLoaded) return;
  
  try {
    // Use Mixkit fallback URLs — always available, no API key
    sounds.tap = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    sounds.tap.volume = 0.4;

    sounds.success = new Audio('https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3');
    sounds.success.volume = 0.5;

    sounds.transition = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    sounds.transition.volume = 0.2;

    sounds.chime = new Audio('https://assets.mixkit.co/active_storage/sfx/1000/1000-preview.mp3');
    sounds.chime.volume = 0.4;

    soundsLoaded = true;
  } catch (error) {
    console.error('Failed to load sounds:', error);
  }
}

export function useSounds() {
  const [isLoaded, setIsLoaded] = useState(soundsLoaded);

  useEffect(() => {
    loadSounds().then(() => setIsLoaded(true));
  }, []);

  const playSound = useCallback((name: keyof SoundMap) => {
    if (!soundsEnabled) return;
    const sound = sounds[name];
    if (!sound) return;
    
    sound.currentTime = 0;
    sound.play().catch(() => {}); // silent fail if blocked
  }, []);

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    soundsEnabled = enabled;
  }, []);

  return {
    playSound,
    setSoundsEnabled,
    isLoaded,
  };
}
