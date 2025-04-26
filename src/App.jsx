import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import HeroSection from './components/HeroSection/HeroSection';
import NewsSection from './components/NewsSection/NewsSection';
import ThreeDSection from './components/3DSection/3DSection';
import Footer from './components/Footer/Footer';
import ThreeDPage from './components/ThreeDPage/ThreeDPage';
import MotionPage from './components/MotionPage/MotionPage';
import IllustrationPage from './components/IllustrationPage/IllustrationPage';
import InteriorPage from './components/InteriorPage/InteriorPage';
import OtherPage from './components/OtherPage/OtherPage';
import './App.css';

// Компонент для прокрутки к началу страницы
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    console.log('ScrollToTop triggered for pathname:', pathname);
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    console.log('ScrollToTop triggered on mount');

    const handleScroll = () => {
      console.log('Scroll position changed to:', window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);

    // Логируем элемент в фокусе
    const focusedElement = document.activeElement;
    console.log('Focused element on mount:', focusedElement);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <NewsSection />
                <ThreeDSection />
              </>
            }
          />
          <Route path="/3d" element={<ThreeDPage />} />
          <Route path="/motion" element={<MotionPage />} />
          <Route path="/illustration" element={<IllustrationPage />} />
          <Route path="/interior" element={<InteriorPage />} />
          <Route path="/other" element={<OtherPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
