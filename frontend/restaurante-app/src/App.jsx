import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/pages/Home";
import Menu from "./components/pages/Menu";
import MobileMenuForm from "./components/pages/MobileMenuForm";
import ResgistroUsuario from "./components/pages/RegistroUsuario";
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
        <Route path="/resgistro" element={<ResgistroUsuario />} />
        <Route path="/mobile/menu" element={<MobileMenuForm />} />
      </Routes>
    </Router>
  );
}

export default App;
