import {
  Trophy,
  X,
} from "lucide-react";

import type {
  Achievement,
} from "../../brain/achievements/AchievementService";

import "./AchievementToast.css";

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementToast({
  achievement,
  onClose,
}: AchievementToastProps) {
  return (
    <aside
      className={[
        "achievement-toast",
        `achievement-toast--${achievement.rarity}`,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="achievement-toast__icon">
        <Trophy size={25} />
      </div>

      <div className="achievement-toast__content">
        <span>Conquista desbloqueada</span>

        <strong>
          {achievement.title}
        </strong>

        <p>
          {achievement.description}
        </p>
      </div>

      <button
        type="button"
        className="achievement-toast__close"
        onClick={onClose}
        aria-label="Fechar notificação"
      >
        <X size={17} />
      </button>
    </aside>
  );
}