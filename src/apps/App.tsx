import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Canvas from "../components/Canvas";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Canvas />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
