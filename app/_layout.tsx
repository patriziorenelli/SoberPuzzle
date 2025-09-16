import { Slot } from 'expo-router';
import { GameScoreProvider } from './games/GameScoreContext';


export default function RootLayout() {
  return (
    <GameScoreProvider>
      <Slot />
    </GameScoreProvider>
  );
}

