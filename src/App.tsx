import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Report from './pages/Report';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Upload />} />
          <Route path="repository" element={<Dashboard />} />
          <Route path="analysis/:id" element={<Analysis />} />
          <Route path="report/:id" element={<Report />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
