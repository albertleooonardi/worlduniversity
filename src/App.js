import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import CountrySearch from "./pages/CountrySearch";
import CountryFilter from "./pages/CountryFilter";
import CountryDetail from "./pages/CountryDetail";
import About from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div id="main-content" className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/searchcountry" element={<CountrySearch />} />
            <Route path="/filtercountry" element={<CountryFilter />} />
            <Route path="/country/:name" element={<CountryDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
