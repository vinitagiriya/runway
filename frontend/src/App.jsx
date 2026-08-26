import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CompanyDetail from "./pages/CompanyDetail";

// Yeh file ab sirf itna decide karti hai: konse URL pe konsa page dikhana hai.
// "/" pe Home dikhega (saari companies ki list).
// "/company/5" jaise kisi bhi URL pe CompanyDetail dikhega, us company ki id ke sath.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/company/:id" element={<CompanyDetail />} />
    </Routes>
  );
}

export default App;
