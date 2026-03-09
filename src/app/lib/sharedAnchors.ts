// Shared ref for temporary activity anchors between Novelty Ideas and Time Landscape screens
// This allows activity chips to temporarily appear in Time Landscape during the same session

interface TempAnchor {
  label: string;
  icon: string;
}

// Module-level mutable array (acts like a ref)
export let tempActivityAnchors: TempAnchor[] = [];

// Subscriber pattern for reactive updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function addTempAnchor(anchor: TempAnchor) {
  tempActivityAnchors.push(anchor);
  notifyListeners();
}

export function clearTempAnchors() {
  tempActivityAnchors = [];
  notifyListeners();
}

export function getTempAnchors(): TempAnchor[] {
  return [...tempActivityAnchors];
}

// Daily default anchors - 3 per day, rotate by day of week
export const dailyAnchors = {
  0: [ // Sunday
    { label: 'Called Todd this morning', icon: 'phone' },
    { label: 'Listened to Sinatra after lunch', icon: 'headphones' },
    { label: 'Sat in the garden with tea', icon: 'coffee' }
  ],
  1: [ // Monday
    { label: 'Walked to the end of the lane', icon: 'person-simple-walk' },
    { label: 'Read two chapters of my book', icon: 'book-open' },
    { label: 'Watched the robin at the feeder', icon: 'bird' }
  ],
  2: [ // Tuesday
    { label: 'Tea by the window at 8am', icon: 'coffee' },
    { label: 'Wrote a card to Eva', icon: 'pencil-line' },
    { label: 'Heard that song from 1962', icon: 'music-note' }
  ],
  3: [ // Wednesday
    { label: 'Morning stretch in the living room', icon: 'person-simple-walk' },
    { label: 'Long call with Mary', icon: 'phone' },
    { label: 'Roses are coming up beautifully', icon: 'flower' }
  ],
  4: [ // Thursday
    { label: 'Dave stopped by for an hour', icon: 'users' },
    { label: 'Made grandmother\'s shortbread recipe', icon: 'fork-knife' },
    { label: 'Found old photos of the cottage', icon: 'image' }
  ],
  5: [ // Friday
    { label: 'First coffee on the back step', icon: 'coffee' },
    { label: 'Tidied the sitting room', icon: 'house' },
    { label: 'Listened to the Friday concert on radio', icon: 'headphones' }
  ],
  6: [ // Saturday
    { label: 'Slow morning, tea in bed', icon: 'coffee' },
    { label: 'Todd called from the city', icon: 'phone' },
    { label: 'Light through the kitchen was golden', icon: 'sun' }
  ]
} as const;
