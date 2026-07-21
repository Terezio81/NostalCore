import { Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";
import Home from "./pages/Home/Home";
import Library from "./pages/Library/Library";
import Consoles from "./pages/Consoles/Consoles";
import Favorites from "./pages/Favorites/Favorites";
import Settings from "./pages/Settings/Settings";
import GameDetails from "./pages/GameDetails/GameDetails";
import Achievements from "./pages/Achievements/Achievements";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/biblioteca" element={<Library />} />
        <Route path="/consoles" element={<Consoles />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/configuracoes" element={<Settings />} />
      <Route path="/jogo/:gameId" element={<GameDetails />}/>
      <Route path="/conquistas"element={<Achievements />}/>
      </Routes>
    </MainLayout>
  );
}

export default App;