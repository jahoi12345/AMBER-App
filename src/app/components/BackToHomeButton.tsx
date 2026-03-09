import { useNavigate } from "react-router";
import { Home } from "lucide-react";
import { playSound } from "../lib/soundUtils";

export function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        playSound("pageBackChime");
        setTimeout(() => navigate("/"), 120);
      }}
      className="pop-on-press"
      aria-label="Back to home"
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 100,
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "rgba(253,246,236,0.92)",
        backdropFilter: "blur(8px)",
        boxShadow: "0px 2px 10px rgba(160,80,20,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "1px solid rgba(196,96,26,0.12)",
      }}
    >
      <Home size={18} style={{ color: "#8A6A50" }} />
    </button>
  );
}
