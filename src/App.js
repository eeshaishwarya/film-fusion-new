import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Enter from './pages/Enter';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Enter />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
} 
export default App