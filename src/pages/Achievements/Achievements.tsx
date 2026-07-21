import {
  Award,
  Boxes,
  Compass,
  Gamepad2,
  Heart,
  Timer,
  Trophy,
} from "lucide-react";

import "./Achievements.css";

import {
  useMemo,
} from "react";

import { useLibrary } from "../../hooks/useLibrary";

import {
  AchievementService,
} from "../../brain/achievements/AchievementService";


const rarityLabels = {
  common: "Comum",
  rare: "Rara",
  epic: "Épica",
  legendary: "Lendária",
} as const;

const achievementIcons = {
  boot: Gamepad2,
  collection: Boxes,
  explorer: Compass,
  marathon: Timer,
  veteran: Award,
  loyalty: Heart,
} as const;

export default function Achievements() {
  const {
    games,
    isLoading,
    error,
  } = useLibrary();

  const achievements = useMemo(
    () => AchievementService.build(games),
    [games],
  );

  const unlockedCount =
    achievements.filter(
      (achievement) =>
        achievement.unlocked,
    ).length;

  if (isLoading) {
    return (
      <main className="achievements-page">
        <p>Carregando conquistas...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="achievements-page">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="achievements-page">
        
      <header className="achievements-header">
        <div>
          <span className="achievements-eyebrow">
            Sua jornada
          </span>

          <h1>Conquistas</h1>

          <p>
            Complete objetivos enquanto
            explora sua biblioteca.
          </p>
        </div>

        <div className="achievements-summary">
          <Trophy size={24} />

          <strong>
            {unlockedCount} de{" "}
            {achievements.length}
          </strong>

          <span>desbloqueadas</span>
        </div>
      </header>

      <section className="achievements-grid">
        {achievements.map(
          (achievement) => {
            const AchievementIcon =
             achievementIcons[achievement.icon];
            const progressPercentage =
              Math.min(
                100,
                Math.round(
                  (
                    achievement.progress /
                    achievement.target
                  ) * 100,
                ),
              );

            return (
              <article
                key={achievement.id}
                className={[
  "achievement-card",
  achievement.unlocked
    ? "achievement-card--unlocked"
    : "achievement-card--locked",
  `achievement-card--${achievement.rarity}`,
].join(" ")}
              >
                <div className="achievement-icon">
  <AchievementIcon size={26} />
</div>

                <div className="achievement-content">
                  <div className="achievement-meta">
  <span
    className={[
      "achievement-rarity",
      `achievement-rarity--${achievement.rarity}`,
    ].join(" ")}
  >
    {rarityLabels[achievement.rarity]}
  </span>

  <span className="achievement-unlock-status">
    {achievement.unlocked
      ? "Desbloqueada"
      : "Em progresso"}
  </span>
</div>

                  <h2>
                    {achievement.title}
                  </h2>

                  <p>
                    {
                      achievement.description
                    }
                  </p>

                  <div className="achievement-progress">
                    <div className="achievement-progress__info">
                        <span>
                            {achievement.progressLabel}
                        </span>

                        <span>
                            {progressPercentage}%
                        </span>
                    </div>

                    <div className="achievement-progress__track">
                      <div
                        className="achievement-progress__fill"
                        style={{
                          width: `${progressPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          },
        )}
      </section>
    </main>
  );
}