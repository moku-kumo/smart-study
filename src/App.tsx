import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/routes/Home'
import MathHome from '@/routes/math/MathHome'
import Addition from '@/routes/math/Addition'
import BlankFill from '@/routes/math/BlankFill'
import Pattern from '@/routes/math/Pattern'
import EnglishHome from '@/routes/english/EnglishHome'
import Alphabet from '@/routes/english/Alphabet'
import PictureWord from '@/routes/english/PictureWord'
import ListenWord from '@/routes/english/ListenWord'
import KoreanHome from '@/routes/korean/KoreanHome'
import Jamo from '@/routes/korean/Jamo'
import ReadWord from '@/routes/korean/ReadWord'
import ReadBatchim from '@/routes/korean/ReadBatchim'
import GameHome from '@/routes/game/GameHome'
import WhackAMole from '@/routes/game/WhackAMole'
import BalloonPop from '@/routes/game/BalloonPop'
import SpotDiff from '@/routes/game/SpotDiff'

function App() {
  return (
    <BrowserRouter basename="/SmartStudy">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/math" element={<MathHome />} />
        <Route path="/math/addition" element={<Addition />} />
        <Route path="/math/blank" element={<BlankFill />} />
        <Route path="/math/pattern" element={<Pattern />} />
        <Route path="/english" element={<EnglishHome />} />
        <Route path="/english/alphabet" element={<Alphabet />} />
        <Route path="/english/picture" element={<PictureWord />} />
        <Route path="/english/listen" element={<ListenWord />} />
        <Route path="/korean" element={<KoreanHome />} />
        <Route path="/korean/jamo" element={<Jamo />} />
        <Route path="/korean/word" element={<ReadWord />} />
        <Route path="/korean/batchim" element={<ReadBatchim />} />
        <Route path="/game" element={<GameHome />} />
        <Route path="/game/whack" element={<WhackAMole />} />
        <Route path="/game/balloon" element={<BalloonPop />} />
        <Route path="/game/spot" element={<SpotDiff />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
