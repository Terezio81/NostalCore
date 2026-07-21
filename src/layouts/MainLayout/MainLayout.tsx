import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Sidebar from "../../components/Sidebar/Sidebar";

import AchievementToast from "../../components/AchievementToast/AchievementToast";

import {
  AchievementService,
  type Achievement,
} from "../../brain/achievements/AchievementService";

import { useLibrary } from "../../hooks/useLibrary";

import "./MainLayout.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  const {
    games,
    isLoading,
  } = useLibrary();

  const [
    unlockedAchievement,
    setUnlockedAchievement,
  ] = useState<Achievement | null>(null);

  const previousAchievementsRef =
    useRef<Achievement[]>([]);

  const achievements = useMemo(
    () => AchievementService.build(games),
    [games],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const previousAchievements =
      previousAchievementsRef.current;

    if (previousAchievements.length === 0) {
      previousAchievementsRef.current =
        achievements;

      return;
    }

    const newlyUnlocked =
      achievements.find((achievement) => {
        const previousAchievement =
          previousAchievements.find(
            (previous) =>
              previous.id === achievement.id,
          );

        return (
          achievement.unlocked &&
          Boolean(previousAchievement) &&
          !previousAchievement?.unlocked
        );
      });

    previousAchievementsRef.current =
      achievements;

    if (newlyUnlocked) {
      setUnlockedAchievement(
        newlyUnlocked,
      );
    }
  }, [achievements, isLoading]);

  useEffect(() => {
    if (!unlockedAchievement) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => {
        setUnlockedAchievement(null);
      },
      5000,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [unlockedAchievement]);

  return (
    <div className="main-layout">
      {unlockedAchievement && (
        <AchievementToast
          achievement={unlockedAchievement}
          onClose={() =>
            setUnlockedAchievement(null)
          }
        />
      )}

      <Sidebar />

      <main className="main-layout__content">
        {children}
      </main>
    </div>
  );
}