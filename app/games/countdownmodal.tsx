import { useAudioPlayer } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/*
  A modal component that displays a countdown timer from 10 to 0.
  Executed before starting a game
  Plays a sound each second 
  Calls the onFinish callback when the countdown reaches 0.
*/
export default function CountdownModal({ text, onFinish }: { text: string; onFinish: () => void }) {
  const [countdown, setCountdown] = useState(10);

  const audioSource = require('../../assets/audio/count.mp3');
  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    const modalTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
        clearInterval(modalTimer);
        setTimeout(() => {
            onFinish(); 
        }, 0);
        return 0;
        }
        if (prev <= 5) {
          player.seekTo(0);
          player.play();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(modalTimer);
  }, []);

  return (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{text}</Text>
      <Text style={styles.modalCountdown}>{countdown}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
