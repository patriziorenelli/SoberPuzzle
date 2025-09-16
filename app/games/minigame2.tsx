import { useAudioPlayer } from 'expo-audio';
import { useRouter } from "expo-router";
import { Gyroscope, GyroscopeMeasurement } from 'expo-sensors';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, Vibration, View } from "react-native";

import { useGameScore } from "./GameScoreContext";

export default function minigame2() {


  const audioSource = require('../../assets/audio/count.mp3');
  const player = useAudioPlayer(audioSource);

  //stato per i valori del giroscopio
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const router = useRouter();
  const addResult = useGameScore();
  const isBalancedRef = useRef(false);

  //stati per gestire il modale pre-gioco
  const [showModal, setShowModal] = useState(true);
  const [modalCountdown, setModalCountdown] = useState(10);
  const [gameStarted, setGameStarted] = useState(false); // controlla se il gioco è iniziato davvero

  useEffect(() => {
    if (showModal) {
      const modalTimer = setInterval(() => {
        setModalCountdown(prev => {
          if (prev <= 1) {
            clearInterval(modalTimer);
            setShowModal(false);
            setGameStarted(true); 
            return 0;
          }
          if(prev <= 5) {
            player.seekTo(0);
            player.play();
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(modalTimer);
    }
  }, [showModal]);

  const introduction = () => {
    const thingToSay = 'Secure the phone on your head. Get in a safe area. Walk until you hear the single beep';
    Speech.speak(thingToSay, { language: 'en-US' });
  };

  useEffect(() => {
    if (showModal) introduction();
  }, [showModal]);
  


  //sotoscrizione del listener al giroscopio
  const [subscription, setSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);
  Gyroscope.setUpdateInterval(200); //aggiornamento ogni 200ms, quindi ogni 200ms nuovo render

  //crea una sottoscrizione al giroscopio
  //Ogni volta che arrivano nuovi dati aggiorna lo stato con setData
  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener((gyroscopeData: GyroscopeMeasurement) => {
        setData(gyroscopeData);
      })
    );
  };
    
  //cancella la sottoscrizione al giroscopio
  //utile quando si esce dalla schermata
  //per evitare di continuare a ricevere dati
  const _unsubscribe = () => {
    subscription?.remove();
    setSubscription(null);
  };

  //eseguita quando il componente viene montato
  //e quando viene smontato
  //quando viene smontato cancella la sottoscrizione
  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const [timer, setTimer] = useState<number>(20); //timer di 20 secondi
  const [balanceTime, setBalanceTime] = useState<number>(0); //tempo totale in cui è stato stabile
  const [gameOver, setGameOver] = useState<boolean>(false); //se il gioco è finito

  //quando il gioco finisce, salva il risultato
  //e lo aggiunge al contesto dei risultati
  //questo viene eseguito quando il timer arriva a 0 
  //cosí che sia fuori dal rendere e react non si incazzi
  useEffect(() => {
    if (gameOver) {
      player.seekTo(0);
      player.play();
      const result = {
        name: 'Minigame 2',
        balanceTime: truncateTo3Decimals(balanceTime),
      };
      addResult.addResult('minigame2', result);
      setTimeout(() => {
        router.push({ pathname: '/games/EndGame', params: { gameName: 'minigame2' } });
      }, 500);
    }
  }, [gameOver]);


  //aggiorna il timer ogni 200ms, controlla se è stabile e aggiorna balanceTime
  useEffect(() => {
    let balanceInterval: number;
    let timerInterval: number;

    if (gameStarted && !gameOver) { // <-- parte solo se il gioco è iniziato!
      // Timer ogni 1 secondo
      timerInterval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            clearInterval(balanceInterval);
            setGameOver(true);
            _unsubscribe();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Controllo equilibrio ogni 200ms
      balanceInterval = setInterval(() => {
        if (isBalancedRef.current) {
          setBalanceTime(prev => prev + 0.2);
        }
      }, 200);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(balanceInterval);
    };
  }, [gameStarted, gameOver]);



  //controlla che il giroscopio sia pressocché fermo lungo i 3 assi
  //se rimane entro 0.1 0.1 0.1 é considerato fermo
  /*
const checkBalance = (shouldVibrate = true): boolean => {
  const balanced = Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(z) < 0.1;
  if (!balanced && shouldVibrate) {
    Vibration.vibrate(200);
  }
  return balanced;
};*/
  const checkBalance = (shouldVibrate = true): boolean => {
    const angularVelocity = Math.sqrt(x * x + y * y + z * z);
    const balanced = angularVelocity < 0.3; // soglia di equilibrio

    if (!balanced && shouldVibrate && gameStarted && !gameOver) {
      Vibration.vibrate(100);
    }

    return balanced;
  };



  const truncateTo3Decimals = (value: number): number => {
    return Math.trunc(value * 1000) / 1000;
  };

  const [isBalanced, setIsBalanced] = useState(false);

  useEffect(() => {
    isBalancedRef.current = isBalanced;
  }, [isBalanced]);


  useEffect(() => {
    const balanced = checkBalance();
    setIsBalanced(balanced);
  }, [x, y, z]); // ogni volta che i dati del giroscopio cambiano, controlla se è bilanciato


  return(
    <View style={[styles.container, isBalanced ? styles.green : styles.red]}>

      {showModal && (
        <View style={styles.modal}>
          <Text style={styles.modalText}>Secure the phone on your head{'\n'}Get in a safe area{'\n'}Walk until you hear the single beep</Text>
          <Text style={styles.modalCountdown}>{modalCountdown}</Text>
        </View>
      )}

      {!showModal && (
        <>
          <Text style={styles.timer}>Timer: {timer}s</Text>
        </>
      )}

    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  red: { backgroundColor: "red" },
  green: { backgroundColor: "green" },
  text: {
    color: "white",
    fontSize: 18,
    margin: 4,
    fontFamily: 'Courier New',
    textAlign: 'center',
  },
  results: {
    marginTop: 20,
    alignItems: 'center',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCountdown: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 24,
    color: 'white',
    margin: 4,
    fontFamily: 'Courier New',
    textAlign: 'center',
    position: 'absolute',
  }
});
