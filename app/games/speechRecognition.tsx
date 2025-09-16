import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CountdownModal from "./countdownmodal";
import { useGameScore } from "./GameScoreContext";

const TONGUE_TWISTERS = [
  "Tre tigri contro tre tigri",
  "Due tazze strette in due strette tazze",
  "Sopra quattro rossi sassi quattro grossi gatti rossi",
  "Nove navi nuove navigavano",
  "Il lupo vede un pupo e in un baleno si fa cupo",
  "Forse Pietro potrà proteggerla",
  "Apelle figlio di Apollo fece una palla di pelle di pollo",
  "Sopra la panca la capra campa",
  "Stanno stretti sotto i letti sette spettri a denti stretti",
  "Nove navi nuove navigavano",
];

const MAX_ROUNDS = 3;      
const TOTAL_TIME = 30;      
const THRESHOLD = 0.8;      
const TARGET_SCORE = 80;     

export default function App() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [target, setTarget] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const audioGiusto = require('../../assets/audio/correct.mp3');
  const audioSbagliato = require('../../assets/audio/wrong.mp3');
  const playerGiusto = useAudioPlayer(audioGiusto);
  const playerSbagliato = useAudioPlayer(audioSbagliato);
  const [round, setRound] = useState(1); 
  const [usedIdx, setUsedIdx] = useState<Set<number>>(new Set());

  const [gameEnd, setGameEnd] = useState(false);
  const [success, setSuccess] = useState(false); 
  const [showModal, setShowModal] = useState(true);
  const [timer, setTimer] = useState(TOTAL_TIME);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const countAudio = require("../../assets/audio/count.mp3");
  const player = useAudioPlayer(countAudio);
  const addResult = useGameScore();
  const router = useRouter();

  const introduction = () => {
    const thingToSay =
      "Repeat as many tongue twisters as you can before the time runs out.";
    Speech.speak(thingToSay, { language: "en-US" });
  };


  const pickNextTwisterIndex = () => {
    const available = TONGUE_TWISTERS
      .map((_, i) => i)
      .filter((i) => !usedIdx.has(i));
    if (available.length === 0) return null;
    const idx = available[Math.floor(Math.random() * available.length)];
    return idx;
  };

  const setTargetByIndex = (idx: number) => {
    setTarget(TONGUE_TWISTERS[idx]);
    setUsedIdx((prev) => new Set(prev).add(idx));
  };


  useEffect(() => {
    const idx = pickNextTwisterIndex();
    if (idx !== null) setTargetByIndex(idx);
  }, []);


  useSpeechRecognitionEvent("start", () => setRecognizing(true));

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    
    if (!gameEnd && timer > 0) {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = setTimeout(() => {
        ExpoSpeechRecognitionModule.start({
          lang: "it-IT",
          interimResults: false,
          continuous: true,
        });
      }, 200);
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    const spokenText = event.results[0]?.transcript || "";
    setTranscript(spokenText);
    calculateScore(spokenText);
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });


  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }
    setTranscript("");
    setScore(null);
    await ExpoSpeechRecognitionModule.start({
      lang: "it-IT",
      interimResults: false,
      continuous: true,
    });
  };


  const levenshtein = (a: string, b: string): number => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
      Array(b.length + 1).fill(0)
    );
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] =
          a[i - 1] === b[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + 1
              );
      }
    }
    return matrix[a.length][b.length];
  };


  const wordSimilarity = (a: string, b: string): number => {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    const distance = levenshtein(a, b);
    return 1 - distance / maxLen;
  };

  const calculateScore = (spokenText: string) => {
    const normalize = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();

    const targetWords = normalize(target).split(" ");
    const spokenWords = normalize(spokenText).split(" ");

    let correct = 0;

    for (let i = 0; i < targetWords.length; i++) {
      const spoken = spokenWords[i];
      if (!spoken) continue;
      const similarity = wordSimilarity(targetWords[i], spoken);
      if (similarity >= THRESHOLD) correct++;
    }

    const percentage = Math.round((correct / targetWords.length) * 100);
    setScore(percentage);

    
    if (percentage >= TARGET_SCORE) {
      playerGiusto.seekTo(0);
      playerGiusto.play();

      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = setTimeout(() => {
        advanceRound();
      }, 800);
    }
    else {
      playerSbagliato.seekTo(0);
      playerSbagliato.play();
    }
  };

  const advanceRound = () => {
    if (round >= MAX_ROUNDS) {

      endGame(true);
      return;
    }

    setRound((r) => r + 1);
    setTranscript("");
    setScore(null);


    const idx = pickNextTwisterIndex();
    if (idx !== null) setTargetByIndex(idx);


    ExpoSpeechRecognitionModule.stop();

  };


  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = (completedAll: boolean) => {
    if (gameEnd) return;
    setGameEnd(true);
    setSuccess(completedAll);
    ExpoSpeechRecognitionModule.stop();
    setRecognizing(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
  };


  useEffect(() => {
    if (gameEnd) {
      const result = {
        name: "Tongue Twister",
        remainingTime: timer,
        roundsCompleted: success ? MAX_ROUNDS : round - 1,
        success,
      };
      addResult.addResult("speechRecognition", result);
      router.push({
        pathname: "/games/EndGame",
        params: { gameName: "speechRecognition" },
      });
    }
  }, [gameEnd]);


  useEffect(() => {
    if (showModal) {
      introduction();
    }
  }, [showModal]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      ExpoSpeechRecognitionModule.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      {showModal && (
        <CountdownModal
          text="Repeat as many tongue twisters as you can before the time runs out"
          onFinish={() => {
            setShowModal(false);
            
            setRound(1);
            setUsedIdx(new Set());
            setTimer(TOTAL_TIME);
            setTranscript("");
            setScore(null);
            
            const idx = pickNextTwisterIndex();
            if (idx !== null) setTargetByIndex(idx);

            handleStart();
            startTimer();
          }}
        />
      )}

      {!showModal && (
        <>

          <Text style={styles.timer}>{timer}s</Text>
          <Text style={styles.round}>Round {round}/{MAX_ROUNDS}</Text>
          

          <Text style={styles.twister}>{target}</Text>

          <ScrollView style={styles.resultContainer}>
            <Text style={styles.label}>Hai detto:</Text>
            <Text style={styles.transcript}>{transcript}</Text>
            {score !== null && (
              <Text style={score >= TARGET_SCORE ? styles.scoreGiusto : styles.scoreSbagliato}>
                Accuratezza: {score}% {score >= TARGET_SCORE ? "✓" : "✗"}
              </Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timer:{
    fontSize: 28,
    fontWeight: "bold",
    color: "red",
    marginBottom: 15,
    marginTop: 15
  },
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
  },
  round: {
    fontSize: 16,
    marginVertical: 6,
  },
  prompt: {
    fontSize: 18,
    marginVertical: 10,
  },
  twister: {
    fontSize: 32,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10
  },
  resultContainer: {
    marginTop: 20,
    width: "100%",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  transcript: {
    fontSize: 22,
    marginBottom: 10,
  },
  scoreGiusto: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
  },
  scoreSbagliato: {
    fontSize: 22,
    fontWeight: "bold",
    color: "red",
  },
});
