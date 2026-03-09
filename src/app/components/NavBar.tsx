import { Home, MessageCircle, Lightbulb, BarChart3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { playSound } from "../lib/soundUtils";

interface NavBarProps {
  type: "user" | "family";
}

export function NavBar({ type }: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const userItems = [
    { path: "/user", icon: Home, label: "Home" },
    { path: "/user/messages", icon: MessageCircle, label: "Messages" },
    { path: "/user/novelty-ideas", icon: Lightbulb, label: "Ideas" },
  ];
  
  const familyItems = [
    { path: "/family", icon: Home, label: "Home" },
    { path: "/family/messages", icon: MessageCircle, label: "Messages" },
    { path: "/family/stats", icon: BarChart3, label: "Stats" },
  ];
  
  const items = type === "user" ? userItems : familyItems;

  const handleNav = (path: string) => {
    playSound("navSelect");
    navigate(path);
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div 
        className="flex items-center justify-around h-20 rounded-full px-8"
        style={{
          backgroundColor: 'var(--amber-card)',
          boxShadow: '0px 8px 32px rgba(200, 120, 40, 0.10)',
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNav(item.path)}
              className="flex flex-col items-center gap-1 relative min-h-[56px] justify-center bg-transparent border-none cursor-pointer w-full"
              style={{ padding: 0 }}
              aria-label={item.label}
            >
              <Icon
                size={24}
                style={{
                  color: active ? 'var(--amber-primary)' : 'var(--amber-text-muted)',
                }}
              />
              {active && (
                <div
                  className="w-1.5 h-1.5 rounded-full absolute -bottom-1"
                  style={{ backgroundColor: 'var(--amber-primary)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
