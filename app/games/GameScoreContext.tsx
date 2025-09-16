import React, { createContext, ReactNode, useContext, useState } from 'react';

type GameSpecificData = Record<string, any>; //tipo per i dati specifici del gioco, può essere un oggetto con qualsiasi struttura

//definisce il tipo del contesto per i risultati del gioco
//contiene results, una coppia chiave valore
//chiave è il nome del gioco, valore è un oggetto con i dati specifici del gioco che servono per il punteggio
type GameScoreContextType = {
  results: Record<string, GameSpecificData>; // es: { minigame1: {...}, minigame2: {...} }
  addResult: (gameName: string, data: GameSpecificData) => void;
  resetResults: () => void;
};

const GameScoreContext = createContext<GameScoreContextType | undefined>(undefined);

export const GameScoreProvider = ({ children }: { children: ReactNode }) => {
  const [results, setResults] = useState<Record<string, GameSpecificData>>({});

  const addResult = (gameName: string, data: GameSpecificData) => {
    setResults((prev) => ({ ...prev, [gameName]: data }));
  };

  const resetResults = () => setResults({});

  return (
    <GameScoreContext.Provider value={{ results, addResult, resetResults }}>
      {children}
    </GameScoreContext.Provider>
  );
};

export const useGameScore = () => {
  const context = useContext(GameScoreContext);
  if (!context) throw new Error("useGameScore must be used within GameScoreProvider");
  return context;
};
