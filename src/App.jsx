import Header from './components/Header/Header';
import HeroSection from './components/HeroSection/HeroSection';
import NewsSection from './components/NewsSection/NewsSection';
import ThreeDSection from './components/3DSection/3DSection';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <HeroSection />
      <NewsSection />
      <ThreeDSection />
      <Footer />
    </div>
  );
}

export default App;
