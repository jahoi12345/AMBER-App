interface GreetingHeaderProps {
  name: string;
  subtitle?: string;
}

/* Greeting logic */

function getGreeting(): string {
  const hour = new Date().getHours();

  const morningGreetings = [
    "Good morning",
    "A bright morning to you",
    "Hope your morning is gentle",
    "Good morning and welcome",
  ];

  const afternoonGreetings = [
    "Good afternoon",
    "Hope your afternoon is going well",
    "A calm afternoon to you",
  ];

  const eveningGreetings = [
    "Good evening",
    "Hope your evening is peaceful",
    "A warm evening to you",
  ];

  const nightGreetings = [
    "Good night",
    "Wishing you a restful night",
    "A quiet night to you",
  ];

  let greetings: string[];

  if (hour >= 5 && hour < 12) {
    greetings = morningGreetings;
  } else if (hour >= 12 && hour < 17) {
    greetings = afternoonGreetings;
  } else if (hour >= 17 && hour < 21) {
    greetings = eveningGreetings;
  } else {
    greetings = nightGreetings;
  }

  return greetings[Math.floor(Math.random() * greetings.length)];
}

/* Description database */

function getDescription(): string {
  const descriptions = [
    "Your time companion",
    "A gentle rhythm for your day",
    "A quiet reflection of your time",
    "Moments made visible",
    "Where your days unfold",
    "A companion for meaningful time",
    "Helping your days feel whole",
    "Your life, softly illuminated",
    "A warmer way to see time",
    "Your days, remembered well",
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

export function GreetingHeader({ name, subtitle }: GreetingHeaderProps) {
  const greeting = getGreeting();
  const description = subtitle || getDescription();

  return (
    <div className="text-center mb-6">
      <h1
        className="mb-2 italic"
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: "var(--font-title, 36px)",
          color: "var(--amber-primary)",
        }}
      >
        {greeting}, {name}
      </h1>

      <p
        className="text-base"
        style={{
          fontFamily: "Lato, sans-serif",
          fontSize: "var(--font-body, 16px)",
          color: "var(--amber-text-muted)",
        }}
      >
        {description}
      </p>
    </div>
  );
}