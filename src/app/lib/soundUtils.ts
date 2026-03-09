// Sound effects utility
import negativeToneUrl from '../components/sounds/mixkit-negative-tone-interface-tap-2569.wav';
import correctAnswerUrl from '../components/sounds/mixkit-correct-answer-tone-2870.wav';
import modernTechnologySelectUrl from '../components/sounds/mixkit-modern-technology-select-3124.wav';
import lightSwitchTapUrl from '../components/sounds/mixkit-on-or-off-light-switch-tap-2585.wav';

const SOUND_DEBUG = true; // Set to false to disable sound debug logs
const log = (msg: string, ...args: unknown[]) => {
  if (SOUND_DEBUG) console.log('[AMBER Sound]', msg, ...args);
};

// Only the four local sounds from the sounds folder
export type SoundName = 'pageBackChime' | 'correctAnswer' | 'navSelect' | 'lightSwitch';

let sfx: Record<SoundName, HTMLAudioElement | null> = {
  pageBackChime: null,
  correctAnswer: null,
  navSelect: null,
  lightSwitch: null,
};

let soundsLoaded = false;

export function initSounds() {
  log('initSounds() called', { soundsLoaded });
  if (soundsLoaded) {
    log('initSounds: already loaded, skipping');
    return;
  }

  try {
    sfx.pageBackChime = new Audio(negativeToneUrl);
    sfx.pageBackChime.volume = 0.5;
    log('initSounds: pageBackChime (negative tone) loaded');

    sfx.correctAnswer = new Audio(correctAnswerUrl);
    sfx.correctAnswer.volume = 0.5;
    log('initSounds: correctAnswer loaded');

    sfx.navSelect = new Audio(modernTechnologySelectUrl);
    sfx.navSelect.volume = 0.35;
    log('initSounds: navSelect loaded');

    sfx.lightSwitch = new Audio(lightSwitchTapUrl);
    sfx.lightSwitch.volume = 0.35;
    log('initSounds: lightSwitch loaded');

    soundsLoaded = true;
    log('initSounds: done', { soundsLoaded, soundCount: Object.keys(sfx).length });
  } catch (error) {
    log('initSounds: FAILED', error);
    console.warn('Failed to initialize sounds:', error);
  }
}

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  log('setSoundEnabled()', { previous: soundEnabled, new: enabled });
  soundEnabled = enabled;
}

export function playSound(name: SoundName) {
  log('playSound()', { name, soundEnabled, soundsLoaded, hasSfx: !!sfx[name] });
  if (!soundEnabled) {
    log('playSound: skipped (sound disabled)');
    return;
  }
  const sound = sfx[name];
  if (!sound) {
    log('playSound: skipped (no Audio for)', name);
    return;
  }

  sound.currentTime = 0;
  sound.play()
    .then(() => log('playSound: played', name))
    .catch((err) => log('playSound: play() failed', name, err));
}

// No longer plays — only the four local sounds are used
export function playTapSoundForNavigation() {}

/** Debug: returns current sound state for diagnosis (e.g. in console or React DevTools) */
export function getSoundDebugState() {
  const state = {
    soundEnabled,
    soundsLoaded,
    sfx: Object.fromEntries(
      (Object.entries(sfx) as [SoundName, HTMLAudioElement | null][]).map(([k, v]) => [k, v ? 'loaded' : null])
    ) as Record<SoundName, 'loaded' | null>,
  };
  if (SOUND_DEBUG) console.log('[AMBER Sound] getSoundDebugState()', state);
  return state;
}

if (typeof window !== 'undefined' && SOUND_DEBUG) {
  (window as unknown as { __AMBER_SOUND_DEBUG?: { getState: typeof getSoundDebugState } }).__AMBER_SOUND_DEBUG = {
    getState: getSoundDebugState,
  };
  log('Debug: run __AMBER_SOUND_DEBUG.getState() in console to inspect sound state');
}
