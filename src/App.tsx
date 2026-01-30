import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/chat" element={<Chat/>}/>
        <Route path="/*" element={<Navigate to="/"/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
