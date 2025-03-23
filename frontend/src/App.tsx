import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Summoner from './pages/Summoner'
import Races from './pages/Races';
import Leaderboard from './pages/Leaderboard';
import Clash from './pages/Clash';
import SignIn from './pages/SignIn';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow overflow-auto overflow-y-scroll">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/summoner/:encodedSummoner" element={<Summoner />} />
            <Route path="/races" element={<Races />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/clash" element={<Clash />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App;
