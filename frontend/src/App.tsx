import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AnalysisResult from './pages/AnalysisResult';
import WebcamScan from './pages/WebcamScan';
import History from './pages/History';
import SocialScan from './pages/SocialScan';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page — clean top-nav layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Internal app pages — sidebar layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<AnalysisResult />} />
          <Route path="/webcam" element={<WebcamScan />} />
          <Route path="/history" element={<History />} />
          <Route path="/social" element={<SocialScan />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
