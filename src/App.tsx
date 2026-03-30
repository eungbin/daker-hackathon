import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { AuthProvider } from './store/AuthContext';
import ToastContainer from './components/ToastContainer';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Hackathons from './pages/Hackathons';
import HackathonDetail from './pages/HackathonDetail';
import Camp from './pages/Camp';
import Rankings from './pages/Rankings';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Navbar />
          <main className="pt-14">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hackathons" element={<Hackathons />} />
              <Route path="/hackathons/:slug" element={<HackathonDetail />} />
              <Route path="/camp" element={<Camp />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <ToastContainer />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
