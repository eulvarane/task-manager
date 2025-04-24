import { Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from './pages/Home';
import Graph from './pages/Graph';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/graph" element={<ProtectedRoute><Graph /></ProtectedRoute>} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
