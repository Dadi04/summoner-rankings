import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Races from './pages/Races';
import Leaderboard from './pages/Leaderboard';
import Clash from './pages/Clash';
import Streamers from './pages/Streamers';
import SignIn from './pages/SignIn';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow overflow-auto overflow-y-scroll">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/races" element={<Races />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/clash" element={<Clash />} />
            <Route path="/streamers" element={<Streamers />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App;
