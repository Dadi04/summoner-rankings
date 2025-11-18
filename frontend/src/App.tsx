import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Summoner from "./pages/Summoner"
import Champions from "./pages/Champions";
import Masteries from "./pages/Masteries";
import LiveGame from "./pages/LiveGame";
import Races from "./pages/Races";
import RacesPrivate from "./pages/RacesPrivate";
import RacesPublic from "./pages/RacesPublic";
import RaceDetail from "./pages/RaceDetail";
import Leaderboard from "./pages/Leaderboard";
import Compare from "./pages/Compare";
import Analyze from "./pages/Analyze";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";
import { GameDataProvider } from "./contexts/GameDataContext";

const App: React.FC = () => {
  return (
    <GameDataProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
          <NavBar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lol/profile/:regionCode/:encodedSummoner" element={<Summoner />} />
              <Route path="/lol/profile/:regionCode/:encodedSummoner/champions" element={<Champions />} />
              <Route path="/lol/profile/:regionCode/:encodedSummoner/mastery" element={<Masteries />} />
              <Route path="/lol/profile/:regionCode/:encodedSummoner/livegame" element={<LiveGame />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/races" element={<Races />}>
                <Route index element={<Navigate to="/races/private" replace />} />
                <Route path="private" element={<RacesPrivate />} />
                <Route path="public" element={<RacesPublic />} />
              </Route>
              <Route path="/races/:type/:raceId" element={<RaceDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/:username" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </GameDataProvider>
  )
}

export default App;
