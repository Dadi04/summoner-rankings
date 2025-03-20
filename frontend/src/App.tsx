import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Races from './pages/Races';
import Leaderboard from './pages/Leaderboard';
import Streamers from './pages/Streamers';
import SignIn from './pages/SignIn';

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/races" element={<Races />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/streamers" element={<Streamers />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  )
}

export default App;
