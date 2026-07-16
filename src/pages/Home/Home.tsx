import {
  Clock3,
  Gamepad2,
  Library,
  Play,
  Search,
  Star,
} from "lucide-react";

import ImportGame from "../../components/ImportGame/ImportGame";

import GameCard from "../../components/GameCard/GameCard";

import "./Home.css";



const recentGames = [
  {
    id: 1,
    title: "Crash Adventure",
    consoleName: "PlayStation",
    year: 1996,
    image: "/covers/crash.jpg",
    favorite: true,
  },
  {
    id: 2,
    title: "Kart Legends",
    consoleName: "Nintendo 64",
    year: 1996,
    image: "/covers/mario.jpg",
  },
  {
    id: 3,
    title: "Blue Speed",
    consoleName: "Mega Drive",
    year: 1991,
    image: "/covers/sonic.jpg",
  },
  {
    id: 4,
    title: "Legendary Quest",
    consoleName: "Super Nintendo",
    year: 1991,
    image: "/covers/zelda.jpg",
    favorite: true,
  },
];

export default function Home() {
  return (
    <div className="home">
      <header className="home__header">
        <div>
          <span className="home__eyebrow">Sua coleção retrô</span>

          <h1>Boa noite, Matheus.</h1>

          <p>Pronto para aproveitar mais um clássico?</p>
        </div>

        <label className="home__search">
          <Search size={19} />

          <input
            type="search"
            placeholder="Pesquisar jogos..."
            aria-label="Pesquisar jogos"
          />
        </label>
      </header>
      <ImportGame />

      <section className="continue-playing">
        <div className="continue-playing__overlay" />

        <div className="continue-playing__content">
          <span className="continue-playing__label">
            <Clock3 size={17} />
            Continue jogando
          </span>

          <h2>Crash Adventure</h2>

          <p>
            Sua última sessão foi ontem. O progresso salvo está pronto para
            continuar.
          </p>

          <div className="continue-playing__details">
            <span>PlayStation</span>
            <span>2h 46min jogados</span>
          </div>

          <button type="button">
            <Play size={19} fill="currentColor" />
            Continuar
          </button>
        </div>
      </section>

      <section className="home__statistics">
        <article>
          <Library size={22} />

          <div>
            <strong>24</strong>
            <span>Jogos na biblioteca</span>
          </div>
        </article>

        <article>
          <Gamepad2 size={22} />

          <div>
            <strong>5</strong>
            <span>Consoles cadastrados</span>
          </div>
        </article>

        <article>
          <Star size={22} />

          <div>
            <strong>8</strong>
            <span>Jogos favoritos</span>
          </div>
        </article>
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <div>
            <span>Biblioteca</span>
            <h2>Adicionados recentemente</h2>
          </div>

          <button type="button">Ver todos</button>
        </div>

        <div className="home__games">
          {recentGames.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              consoleName={game.consoleName}
              year={game.year}
              image={game.image}
              favorite={game.favorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
}