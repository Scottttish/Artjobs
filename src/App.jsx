import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './components/HomePage'; // Главная страница
import ArtProfile from './components/ArtProfile/ArtProfile';
import HirerProfile from './components/HirerProfile/HirerProfile';
import ThreeDPage from './components/ThreeDPage';
import MotionPage from './components/MotionPage';
import IllustrationPage from './components/IllustrationPage';
import InteriorPage from './components/InteriorPage';
import OtherPage from './components/OtherPage';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/artist-profile" element={<ArtProfile />} />
        <Route path="/hirer-profile" element={<HirerProfile />} />
        <Route path="/3d" element={<ThreeDPage />} />
        <Route path="/motion" element={<MotionPage />} />
        <Route path="/illustration" element={<IllustrationPage />} />
        <Route path="/interior" element={<InteriorPage />} />
        <Route path="/other" element={<OtherPage />} />
      </Routes>
    </Router>
  );
}

export default App;
