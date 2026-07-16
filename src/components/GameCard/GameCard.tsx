import { Heart, Play } from "lucide-react";
import "./GameCard.css";

type GameCardProps = {
  title: string;
  consoleName: string;
  year: number;
  image: string;
  favorite?: boolean;
};

export default function GameCard({
  title,
  consoleName,
  year,
  image,
  favorite = false,
}: GameCardProps) {
  return (
    <article className="game-card">
      <div className="game-card__image-wrapper">
        <img
          className="game-card__image"
          src={image}
          alt={`Capa de ${title}`}
        />

        <button
          className={`game-card__favorite ${
            favorite ? "game-card__favorite--active" : ""
          }`}
          type="button"
          aria-label={`Favoritar ${title}`}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>

        <button
          className="game-card__play"
          type="button"
          aria-label={`Jogar ${title}`}
        >
          <Play size={22} fill="currentColor" />
        </button>
      </div>

      <div className="game-card__information">
        <h3>{title}</h3>

        <p>
          {consoleName} · {year}
        </p>
      </div>
    </article>
  );
}