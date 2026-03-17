import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Recommend from './pages/Recommend';
import './App.css';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/recommend" element={<Recommend />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}