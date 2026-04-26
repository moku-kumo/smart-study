import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/routes/Home'
import MathHome from '@/routes/math/MathHome'
import EnglishHome from '@/routes/english/EnglishHome'
import KoreanHome from '@/routes/korean/KoreanHome'

function App() {
  return (
    <BrowserRouter basename="/SmartStudy">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/math" element={<MathHome />} />
        <Route path="/english" element={<EnglishHome />} />
        <Route path="/korean" element={<KoreanHome />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
