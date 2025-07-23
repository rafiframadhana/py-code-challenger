import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChallengePage from './pages/ChallengePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/challenge/:challengeId" element={<ChallengePage />} />
      </Routes>
    </Router>
  );
}