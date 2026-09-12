import { useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import AppBar from "./components/AppBar";
import TabBar from "./components/TabBar";
import SosButton from "./components/SosButton";
import HomeScreen from "./screens/HomeScreen";
import CallScreen from "./screens/CallScreen";
import ProtectScreen from "./screens/ProtectScreen";
import HospitalScreen from "./screens/HospitalScreen";
import TriageScreen from "./screens/TriageScreen";

/**
 * Tab state lives here rather than in a router. A router is worth adding in
 * week 2 when the hospital screen needs deep links; right now it would be one
 * more thing to load before first paint.
 *
 * Geolocation is started once at this level and passed down, so moving between
 * tabs never throws away a hard-won GPS fix.
 */
export default function App() {
  const [tab, setTab] = useState("home");
  const [lang, setLang] = useState("en");
  const geo = useGeolocation();

  const back = () => setTab("home");

  return (
    <div className="app">
      <AppBar />

      <main className="screen">
        {tab === "home" && (
          <HomeScreen
            lang={lang}
            setLang={setLang}
            onStart={() => {
              geo.start();
              setTab("call");
            }}
          />
        )}
        {tab === "call" && <CallScreen geo={geo} onBack={back} />}
        {tab === "protect" && <ProtectScreen coords={geo.coords} onBack={back} />}
        {tab === "hospital" && <HospitalScreen geo={geo} onBack={back} />}
        {tab === "triage" && <TriageScreen onBack={back} />}
      </main>

      <SosButton />
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
