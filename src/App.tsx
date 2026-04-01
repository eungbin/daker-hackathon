import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { AuthProvider } from './store/AuthContext';
import ToastContainer from './components/ToastContainer';
import DialogContainer from './components/Dialog';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Hackathons from './pages/Hackathons';
import HackathonDetail from './pages/HackathonDetail';
import Camp from './pages/Camp';
import TeamDetail from './pages/TeamDetail';
import Rankings from './pages/Rankings';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Navbar />
          <main className="pt-14 min-h-screen flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hackathons" element={<Hackathons />} />
              <Route path="/hackathons/:slug" element={<HackathonDetail />} />
              <Route path="/camp" element={<Camp />} />
              <Route path="/camp/teams/:teamCode" element={<TeamDetail />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <ToastContainer />
          <DialogContainer />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
