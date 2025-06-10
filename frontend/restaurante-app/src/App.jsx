import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import MobileMenuForm from "./pages/MobileMenuForm";

function App() {
  return (
    <Router>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <Link to="/">Inicio</Link>
        <Link to="/menu">Menú</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/mobile/menu" element={<MobileMenuForm />} />
      </Routes>
    </Router>
  );
}

export default App;
