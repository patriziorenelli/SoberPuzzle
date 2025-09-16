import { useAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import * as Speech from "expo-speech";
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    Vibration,
    View
} from 'react-native';
import CountdownModal from './countdownmodal';
import FlipCard from './flipcard';
import { useGameScore } from "./GameScoreContext";

//definizione di un tipo per i dati delle carte
//in questo caso, ogni carta ha un id, uno stato di rivelazione e uno stato di selezione
type CardData = {
  id: number;
  revealed: boolean;
  selected: boolean;
};
//grandezza della gliglia
const GRID_SIZE = 5;
const CARD_COUNT = GRID_SIZE * GRID_SIZE;
const router = useRouter();
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 5;
const CARD_SIZE = (SCREEN_WIDTH - CARD_MARGIN * 2 * GRID_SIZE - 40) / GRID_SIZE; //grandezza della carta

//funzione principale del gioco	 
const GameScreen = () => {

    const addResult = useGameScore();

    //stato del gioco
    //cards: array di carte definito sul tipo CardData
    //round: numero del round corrente
    //targetIndices: array di indici delle carte che l'utente deve ricordare
    //isShowing: booleano che indica se le carte da ricordare sono visibili o meno
    const [cards, setCards] = useState<CardData[]>([]);
    const [round, setRound] = useState(1);
    const [targetIndices, setTargetIndices] = useState<number[]>([]);
    const [isShowing, setIsShowing] = useState(true);
    const [forceReset, setForceReset] = useState(0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    const [showModal, setShowModal] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);


    const [timeLeft, setTimeLeft] = useState(20); //tempo limite in secondi
    const [maxRound, setMaxRound] = useState(1); //tracker del numero massimo di round raggiunto

    const audioSource = require('../../assets/audio/tictaclungo.mp3');
    const player = useAudioPlayer(audioSource);

    const audioGiusto = require('../../assets/audio/correct.mp3');
    const audioSbagliato = require('../../assets/audio/wrong.mp3');
    const playerGiusto = useAudioPlayer(audioGiusto);
    const playerSbagliato = useAudioPlayer(audioSbagliato);


    const introduction = () => {
        const thingToSay = 'Memorize and select the cards that will be shown';
            Speech.speak(thingToSay, {
                language: 'en-US'
            });
    };

    useEffect(() => {
        if (showModal) {
        introduction();
        }
    }, [showModal]);

    //effetto per il countdown globale
    //viene eseguito ogni secondo e decrementa il tempo rimasto
    //allo scadere del tempo rilascia un alert e dá l'opzione di ricominciare
    //2 useeffect diversi in quanto il primo serve per il countdown e il secondo per l'alert
    //se non fosse cosí il round massimo non verrebbe aggiornato
    useEffect(() => {
        if (!gameStarted) return; // aggiunto

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted]); // cambiata la dipendenza


    // 2) alert quando timeLeft arriva a zero
    useEffect(() => {


        if (timeLeft === 0) {
            
            player.pause();
            
            //salva il risultato del gioco
            const result = {
                name: "Minigame Memo",
                maxRound: maxRound,
            };
            addResult.addResult("minigamememo", result);
            router.push({ pathname: '/games/EndGame', params: { gameName: 'minigamememo' } });

        }

    }, [timeLeft, maxRound]);


    //effetto che viene eseguito quando il componente viene montato o quando il round cambia
    useEffect(() => {
        if (!gameStarted) return; // aggiunto

        if (!isAudioPlaying) {
            player.seekTo(0);
            player.play();
            setIsAudioPlaying(true);
        }

        startNewRound();
    }, [gameStarted, round, forceReset]); // aggiunto gameStarted


    //funzione chiamata all'inizio di un nuovo round dalla useEffect cui sopra
    const startNewRound = () => {

        //reset dello stato delle carte
        //creazione di un array di carte con id, stato di rivelazione e stato di selezione
        //l'array è lungo CARD_COUNT e ogni carta ha un id che va da 0 a CARD_COUNT-1
        //inizialmente tutte le carte sono coperte e non selezionate
        const newCards: CardData[] = Array.from({ length: CARD_COUNT }, (_, i) => ({
        id: i,
        revealed: false,
        selected: false,
        }));

        //generazione di un numero casuale di carte da rivelare
        //il numero di carte da rivelare aumenta con il numero di round
        const numberToReveal = Math.min(3 + round, 15); 
        
        //genera gli indici casuali delle carte da rivelare
        const indices = generateRandomIndices(CARD_COUNT, numberToReveal);


        //rivelazione delle carte selezionate
        indices.forEach((i) => {
        newCards[i].revealed = true;
        });

        //impostazione del nuovo stato delle carte e degli indici
        setCards(newCards);
        setTargetIndices(indices);
        setIsShowing(true);

        //timeout di 1 secondo al cui termine vengono nascoste le carte
        setTimeout(() => {
            setCards((prev) => prev.map((c) => ({ ...c, revealed: false })));
            setIsShowing(false);
        }, Math.max(1000 - round * 100, 400)); //il tempo per memorizare diminuisce con il numero di round fino ad un minimo di 400ms
    };

    //funzione chiamata quando l'utente preme su una carta
    //se la carta sta venendo mostrata non fa un cazzo
    //altrimenti cambia lo stato di selezione della carta
    const handleCardPress = (index: number) => {
        if (isShowing) return;

        //Calcola come sarà lo stato aggiornato
        const updatedCards = cards.map((c, i) =>
            i === index ? { ...c, selected: !c.selected } : c
        );

        setCards(updatedCards); // 2. Applica lo stato aggiornato

        //Verifica se ha selezionato una carta sbagliata
        if (!targetIndices.includes(index)) {
            Vibration.vibrate(300);
            playerSbagliato.seekTo(0);
            playerSbagliato.play();
            setTimeout(() => {
                setRound(1);
                setForceReset((prev) => prev + 1);
            }, 200); //reset del round dopo un breve ritardo
            return; //altrimenti fa il panico
        }

        // Controlla se tutte le carte giuste sono state selezionate
        const success = updatedCards.every((card, i) => {
            return (
                (targetIndices.includes(i) && card.selected) ||
                (!targetIndices.includes(i) && !card.selected)
            );
        });

        if (success) {
            setMaxRound((prev) => Math.max(prev, round)); //aggiorna il numero massimo di round se necessario
            Vibration.vibrate(80); 
            playerGiusto.seekTo(0);
            playerGiusto.play();
            setTimeout(() => {
                setRound((prev) => prev + 1); 
            }, 200); //passa al round successivo dopo un breve ritardo
        }
    };

    return (
        <View style={styles.container}>
            {showModal && (
                <CountdownModal
                    text="Memorize and select the cards that will be shown"
                    onFinish={() => {
                        setShowModal(false);
                        setGameStarted(true);
                    }}
                />
            )}
            {!showModal && (
                <>
                <Text style={styles.timerText}>Time Left: {timeLeft}s</Text>
                <Text style={styles.roundText}>Round {round}</Text>
                <View style={styles.grid}>
                    {cards.map((card, index) => (
                        <FlipCard
                        key={index}
                        isFlipped={card.revealed || card.selected}
                        onPress={() => handleCardPress(index)}
                        index={index}
                        />
                    ))}
                </View>
                </>
            )}
        </View>
    );
};

//funzione per generare un array di indici casuali
//usa l'algoritmo di Fisher-Yates per mescolare gli indici
//restituisce un array di indici casuali di lunghezza count
const generateRandomIndices = (total: number, count: number): number[] => {
    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, count);
    };

const styles = StyleSheet.create({
    timerText: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 10,
        color: 'red',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    roundText: {
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 70,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    card: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        margin: CARD_MARGIN,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#444',
    },
    covered: {
        backgroundColor: '#ccc',
    },
    revealed: {
        backgroundColor: '#4caf50',
    },
    selected: {
        backgroundColor: '#2196f3',
    },
    button: {
        marginTop: 20,
        alignSelf: 'center',
        backgroundColor: '#000',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default GameScreen;
