import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding:12, borderBottom:"1px solid #ddd" }}>
        <Link to="/">Store</Link>{" | "}
        <Link to="/cart">Cart</Link>
      </nav>
      <main style={{ padding:12 }}>
        <Routes>
          <Route path="/" element={<Catalog/>}/>
          <Route path="/product/:id" element={<Product/>}/>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/checkout" element={<Checkout/>}/>
          <Route path="/order/:id" element={<Confirmation/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  );
}
