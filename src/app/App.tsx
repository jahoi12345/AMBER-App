import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";
import { DebugProvider } from "./lib/debugContext";
import { DebugOverlay } from "./components/DebugOverlay";
import { AppProvider } from "./lib/appContext";
import { useEffect } from "react";
import { initSounds } from "./lib/soundUtils";

function App() {
  useEffect(() => {
    // Initialize sounds on app mount
    initSounds();
  }, []);

  return (
    <DebugProvider>
      <AppProvider>
        <RouterProvider router={router} />
        <DebugOverlay />
        <Toaster />
      </AppProvider>
    </DebugProvider>
  );
}

export default App;