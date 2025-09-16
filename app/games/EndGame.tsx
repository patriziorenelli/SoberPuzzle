import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameScoreProvider, useGameScore } from './GameScoreContext';
import { renderers } from './endScreenRenders';
import { gamesList } from './gamesList';

type Props = {
  gameName: string;
  nextGameRoute: string;
};

const defaultRenderer = (data: any) => (
  <View>
    {Object.entries(data).map(([key, value]) => (
      <Text key={key}>{key}: {JSON.stringify(value)}</Text>
    ))}
  </View>
);  

const gameNameToTitle = (gameName: string) => {
  switch (gameName) {
    case 'minigame1':
      return 'Simon Says';
    case 'minigame2':
      return 'Keep it Steady';
    case 'minigamegolf':
      return 'Golf it';
    case 'minigamememo':
      return 'Memento Imago';
    case 'minigameTorre':
      return 'Torre di Hanoi';
    case 'minigameShot':
      return 'Shot';
    case 'minigameConta':
      return 'Count it Up';
    case 'minigameLigth':
      return 'Light it Up';
    case 'holdsteady':
      return 'Hold Steady';
    case 'final':
      return 'Final Results';
    case 'speechRecognition':
      return 'Speech Recognition';
    default:
      return gameName.charAt(0).toUpperCase() + gameName.slice(1);
  }
}

//Component responsible of the end screen of each game, showing the score and a button to go to the next game or home
export default function EndScreen(){
  const params = useLocalSearchParams();
  const gameName = typeof params.gameName === 'string' ? params.gameName : '';

  const nextGameRoute = gamesList[gamesList.indexOf(`/games/${gameName}`) + 1] || '/'; //Default home


  const { results } = useGameScore();
  const router = useRouter();

  const data = gameName === "final" ? results : results[gameName];
  const Renderer = renderers[gameName];
  console.log('data:', data);
  //const PressText = nextGameRoute === "final" ? "Fine del gioco" : "Prossimo gioco";
  
  const PressText = nextGameRoute ? nextGameRoute === "final" ? "Final Score" : "Next Game" : "Back to Home";

  return (
  <GameScoreProvider>
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {gameNameToTitle(gameName)}
      </Text>

      <View>
        {data
          ? Renderer
            ? Renderer(data)
            : defaultRenderer(data)
          : <Text style={styles.noDataText}>Nessun dato disponibile.</Text>}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (nextGameRoute === "final") {
            router.push({ pathname: "./EndGame", params: { gameName: "final" } });
          } else if (gameName === "final") {
            router.push('/');
          } else {
            console.log('Navigating to next game:', nextGameRoute);
            try {
              router.push(nextGameRoute as any);
            } catch (error) {
              console.error('Error navigating to next game:', error);
            }
            
          }
        }}
      >
        <Text style={styles.buttonText}>{PressText}</Text>
      </TouchableOpacity>
    </View>
  </GameScoreProvider>
);

};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#84bce8',
    padding: 0,
  },
  headerText: {
    fontSize: 34,
    fontWeight: '400',
    color: '#1c1c1e',
    marginBottom: 30,
    marginTop: 60,
    textAlign: 'center',
  },
  contentBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 30,
  },
  noDataText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#84bce8',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 0,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 3,
    position: 'absolute',
    bottom: 20,
    left: 0,
    marginBottom: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
    height: 80,
    justifyContent: 'center',
    borderEndColor: 'transparent',
    borderStartColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    
    
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
