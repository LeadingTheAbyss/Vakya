import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Report from './pages/Report';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_API_KEY';
  return (
    <AppProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Upload />} />
            <Route path="repository" element={<Dashboard />} />
            <Route path="analysis/:id" element={<Analysis />} />
            <Route path="report/:id" element={<Report />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      </GoogleOAuthProvider>
    </AppProvider>
  );
}

export default App;
