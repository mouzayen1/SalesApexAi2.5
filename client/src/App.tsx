import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import RehashOptimizerPage from './pages/RehashOptimizerPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="/rehash-optimizer" element={<RehashOptimizerPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
