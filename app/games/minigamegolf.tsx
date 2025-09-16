import { Text } from "@react-navigation/elements";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { Gyroscope } from 'expo-sensors';
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Vibration, View } from "react-native";
import Svg, { Path } from 'react-native-svg';
import { useGameScore } from "./GameScoreContext";
import CountdownModal from "./countdownmodal";

export default function MinigameGolf() {

    const addResult = useGameScore();
    const [showModal, setShowModal] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);


    //Dimensioni dello schermo 
    const SCREEN_WIDTH = Dimensions.get("window").width;
    const SCREEN_HEIGHT = Dimensions.get("window").height;
    const [gyroBias, setGyroBias] = useState({ x: 0, y: 0 });
    const [isCalibrating, setIsCalibrating] = useState(true);
    const [tries, setTries] = useState(2); // Numero di tentativi
    const router = useRouter();

    const introduction = () => {
        const thingToSay = 'Guide the golf ball to the hole by tilting your phone';
        Speech.speak(thingToSay, {
            language: 'en-US'
        });
    };

    useEffect(() => {
        if (showModal) {
        introduction();
        }
    }, [showModal]);

    const calibrateGyroscope = async () => {
        setIsCalibrating(true);

        

        const samples: { x: number; y: number; z: number }[] = [];
        const subscription = Gyroscope.addListener(data => {
            samples.push(data);
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        subscription.remove();

        const average = samples.reduce(
            (acc, val) => ({
                x: acc.x + val.x / samples.length,
                y: acc.y + val.y / samples.length,
                z: acc.z + val.z / samples.length,
            }),
            { x: 0, y: 0, z: 0 }
        );

        setGyroBias({ x: average.x, y: average.y });
        setIsCalibrating(false);
    };

      
    

    //stato del giroscopio
    const [{ x, y }, setGyroData] = useState({ x: 0, y: 0, z: 0 });

    //spostamento orizzontale per centrare il percorso
    const pathOffsetX = SCREEN_WIDTH / 3;

    // Definizione del percorso SVG come stringa 
    const pathData = `
        M${pathOffsetX},50 
        H${pathOffsetX + 100}
        C${pathOffsetX + 200},50 ${pathOffsetX + 200},200 ${pathOffsetX + 100},200
        H${pathOffsetX - 50}
        C${pathOffsetX - 100 },200 ${pathOffsetX - 50 },400 ${pathOffsetX},400
        C${pathOffsetX},400 ${pathOffsetX + 100},400 ${pathOffsetX + 100},350
        C${pathOffsetX + 100},300 ${pathOffsetX + 300},350 ${pathOffsetX + 200},600
        C${pathOffsetX + 200},600 ${pathOffsetX -50 },600 ${pathOffsetX - 50},650
    `;

    

    // Punti di controllo che approssimano la curva
    //Non sará perfetto ma ci sta bene
    //possibile implementare un algoritmo di generazione automatica dei punti
    const curvedPathPoints = [
        { x: pathOffsetX, y:100+ 50 },
        { x: pathOffsetX + 25, y:100+ 50 },
        { x: pathOffsetX + 50, y:100+ 50 },
        { x: pathOffsetX + 75, y:100+ 50 },
        { x: pathOffsetX + 100, y:100+ 50 },
        { x: pathOffsetX + 125, y:100+ 55 },
        { x: pathOffsetX + 140, y:100+ 60 },
        { x: pathOffsetX + 150, y:100+ 70 },
        { x: pathOffsetX + 165, y:100+ 80 },
        { x: pathOffsetX + 175, y:100+ 95 },
        { x: pathOffsetX + 175, y:100+ 110 },
        { x: pathOffsetX + 175, y:100+ 120 },
        { x: pathOffsetX + 175, y:100+ 135 },
        { x: pathOffsetX + 175, y:100+ 150 },
        { x: pathOffsetX + 165, y:100+ 165 },
        { x: pathOffsetX + 150, y:100+ 180 },
        { x: pathOffsetX + 135, y:100+ 190 },
        { x: pathOffsetX + 125, y:100+ 200 },
        { x: pathOffsetX + 100, y:100+ 200 },
        { x: pathOffsetX + 75, y:100+ 200 },
        { x: pathOffsetX + 50, y:100+ 200 },
        { x: pathOffsetX + 25, y:100+ 200 },
        { x: pathOffsetX + 0, y:100+ 200 },
        { x: pathOffsetX - 25, y:100+ 200 },
        { x: pathOffsetX - 50, y:100+ 200 },
        { x: pathOffsetX - 65, y:100+ 220 },
        { x: pathOffsetX - 70, y:100+ 240 },
        { x: pathOffsetX - 70, y:100+ 260 },
        { x: pathOffsetX - 65, y:100+ 280 },
        { x: pathOffsetX - 60, y:100+ 300 },
        { x: pathOffsetX - 60, y:100+ 320 },
        { x: pathOffsetX - 50, y:100+ 340 },
        { x: pathOffsetX - 40, y:100+ 360 },
        { x: pathOffsetX - 30, y:100+ 380 },
        { x: pathOffsetX - 20, y:100+ 395 },
        { x: pathOffsetX - 0, y:100+ 395 },
        { x: pathOffsetX + 20, y:100+ 395 },
        { x: pathOffsetX + 40, y:100+ 395 },
        { x: pathOffsetX + 60, y:100+ 390 },
        { x: pathOffsetX + 80, y:100+ 380 },
        { x: pathOffsetX + 95, y:100+ 360 },
        { x: pathOffsetX + 115, y:100+ 340 },
        { x: pathOffsetX + 130, y:100+ 335 },
        { x: pathOffsetX + 150, y:100+ 340 },
        { x: pathOffsetX + 170, y:100+ 355 },
        { x: pathOffsetX + 190, y:100+ 370 },
        { x: pathOffsetX + 210, y:100+ 390 },
        { x: pathOffsetX + 220, y:100+ 410 },
        { x: pathOffsetX + 225, y:100+ 430 },
        { x: pathOffsetX + 225, y:100+ 450 },
        { x: pathOffsetX + 225, y:100+ 470 },
        { x: pathOffsetX + 225, y:100+ 490 },
        { x: pathOffsetX + 225, y:100+ 510 },
        { x: pathOffsetX + 220, y:100+ 530 },
        { x: pathOffsetX + 215, y:100+ 550 },
        { x: pathOffsetX + 210, y:100+ 570 },
        { x: pathOffsetX + 205, y:100+ 590 },
        { x: pathOffsetX + 200, y:100+ 600 },
        { x: pathOffsetX + 180, y:100+ 600 },
        { x: pathOffsetX + 160, y:100+ 600 },
        { x: pathOffsetX + 140, y:100+ 605 },
        { x: pathOffsetX + 120, y:100+ 605 },
        { x: pathOffsetX + 100, y:100+ 605 },
        { x: pathOffsetX + 80, y:100+ 610 },
        { x: pathOffsetX + 60, y:100+ 610 },
        { x: pathOffsetX + 40, y:100+ 615 },
        { x: pathOffsetX + 20, y:100+ 615 },
        { x: pathOffsetX + 0, y:100+ 615 },
        { x: pathOffsetX - 20, y:100+ 620 },
        { x: pathOffsetX - 40, y:100+ 630 },


    ];


    //stato della pallina
    const [ballPosition, setBallPosition] = useState({
        top: 50 + 100,
        left: pathOffsetX - 12.5,
    });

    //useRef é un hook che permette di refenziare un valore NON NECESSARIO PER IL RENDERING
    //Usarlo non trifggera un rendering
    //Perfetto per memorizzare valori che non devono triggerare un rendering
    //In questo caso lo usiamo per memorizzare la velocità della pallina
    const velocityRef = useRef({ vx: 0, vy: 0 });

    //Sottoscrizione al giroscopio
    const [subscription, setSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);

    //Stato per verificare se il giocatore ha vinto o perso
    const [hasWon, setHasWon] = useState(false);
    const [hasLost, setHasLost] = useState(false);

    //posizione della buca
    const holePosition = {
        top: y + 650 + 100,
        left: pathOffsetX - 50,
        radius: 25,
    };
    Gyroscope.setUpdateInterval(50); // 50ms (20 Hz)

    //Sottoscrizione e rimozione del listener al giroscopio
    useEffect(() => {
        if (!gameStarted) return; // ← aggiunto

        const init = async () => {
            await calibrateGyroscope();
            setSubscription(
                Gyroscope.addListener(data => {
                    setGyroData({
                        x: data.x - gyroBias.x,
                        y: data.y - gyroBias.y,
                        z: data.z
                    });
                })
            );
        };
        init();

        return () => {
            subscription?.remove();
            setSubscription(null);
        };
    }, [gameStarted]); //dipendenza da gameStarted

    // Verifica se la pallina è vicina a uno dei punti che simulano la curva
    function isBallNearPath(ballX: number, ballY: number, tolerance = 20) {
        return curvedPathPoints.some(({ x, y }) => {
            const dx = ballX - x;
            const dy = ballY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= tolerance;
        });
    }

    //Aggiorna la posizione della pallina in base alla velocità e alla posizione corrente
    //X ed Y sono le dipendenze, ogni volta che cambiano viene triggerata la useEffect
    useEffect(() => {
        //setInterval che avviene ogni 16ms (60fps)
        //serve a far muovere la pallina in maniera continua anche quando x ed y si fermano
        //in sostanza esso é il vero motore della pallina
        const interval = setInterval(() => {
            setBallPosition(pos => {
                if (hasWon || hasLost) return pos; // Se ha vinto o perso, ferma la pallina

                const acceleration = 0.5;
                const friction = 0.98;
                const maxSpeed = 20;

                //aggiorna la velocità in base al giroscopio
                velocityRef.current.vx += x * acceleration;
                velocityRef.current.vy += y * acceleration;

                //limita la velocità
                velocityRef.current.vx = Math.max(-maxSpeed, Math.min(maxSpeed, velocityRef.current.vx));
                velocityRef.current.vy = Math.max(-maxSpeed, Math.min(maxSpeed, velocityRef.current.vy));

                //applica attrito
                velocityRef.current.vx *= friction;
                velocityRef.current.vy *= friction;

                //aggiorna posizione
                let newTop = pos.top + velocityRef.current.vx;
                let newLeft = pos.left + velocityRef.current.vy;

                //limiti schermo
                newTop = Math.max(0, Math.min(SCREEN_HEIGHT - 25, newTop));
                newLeft = Math.max(0, Math.min(SCREEN_WIDTH - 25, newLeft));

                // centro della pallina
                const centerX = newLeft + 12.5;
                const centerY = newTop + 12.5;

                //se la pallina è uscita dal percorso, perdi
                if (!isBallNearPath(centerX, centerY)) {
                    Vibration.vibrate(200); //vibrazione se sconfitta
                    if (tries > 0) {
                        setTries(tries - 1); // decrementa i tentativi
                    }
                    if (tries <= 0) {
                        setHasLost(true);
                    } else {
                        // Reset della pallina alla posizione iniziale
                        newTop = 50 + 100;
                        newLeft = pathOffsetX - 12.5;
                        velocityRef.current.vx = 0;
                        velocityRef.current.vy = 0;
                    }

                }

                //Controllo collisione con la buca (distanza tra i centri dei cerchi)
                const dx = centerX - holePosition.left;
                const dy = centerY - holePosition.top;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < holePosition.radius) {
                    setHasWon(true);
                }

                return { top: newTop, left: newLeft };
            });
        }, 16);

        // pulisce l'intervallo quando il componente viene smontato
        //o quando x ed y cambiano
        return () => clearInterval(interval);
    }, [x, y, hasWon, hasLost]);

    useEffect(() => {
        let isVibrating = false;

        const vibrationInterval = setInterval(async () => {
            if (hasWon || hasLost || isVibrating) return;

            const { vx, vy } = velocityRef.current;
            const speed = Math.sqrt(vx * vx + vy * vy);

            const minSpeedThreshold = 0.5;
            const maxSpeed = 20;

            if (speed > minSpeedThreshold) {
                const normalizedSpeed = Math.min(speed / maxSpeed, 1);

                isVibrating = true;

                try {
                    if (normalizedSpeed < 0.1) {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        console.log("Vibrazione leggera");
                    } else if (normalizedSpeed < 0.13) {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        console.log("Vibrazione media");
                    } else {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        console.log("Vibrazione forte");
                    }
                } catch (e) {
                    console.warn("Errore nella vibrazione:", e);
                }

                isVibrating = false;
            }
        }, 200); // ogni 200ms → più realistico

        return () => clearInterval(vibrationInterval);
    }, [hasWon, hasLost]);




    useEffect(() => {
        if (hasWon) {
            const result = {
                name: 'Minigame Golf',
                tries: 3 - tries,
                outcome: 'won',
            };
            addResult.addResult('minigamegolf', result);
            router.push({ pathname: '/games/EndGame', params: { gameName: 'minigamegolf' } });
        }
    }, [hasWon]);

    useEffect(() => {
        if (hasLost) {
            const result = {
                name: 'Minigame Golf',
                tries: 3 - tries,
                outcome: 'lost',
            };
            addResult.addResult('minigamegolf', result);
            router.push({ pathname: '/games/EndGame', params: { gameName: 'minigamegolf' } });
        }
    }, [hasLost]);


    return (
        <View style={[styles.container, { alignItems: 'center' }]} >


            {/* toggle punti di controllo visibili */}
            {/* Punti di controllo per la curva 
            {curvedPathPoints.map((point, index) => (
            <View
                key={`control-${index}`}
                style={{
                position: 'absolute',
                top: point.y - 5, // centriamo il punto (diametro 10)
                left: point.x - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: 'red',
                zIndex: 10,
                }}
            />
            ))} /*}

            
            


            {/* Percorso SVG */}


        {showModal && (
            <CountdownModal
                text="Guide the golf ball to the hole by tilting your phone"
                onFinish={() => {
                    setShowModal(false);
                    setGameStarted(true);
                }}
            />
        )}
        {!showModal && (
            <>
            <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
                <Path
                    d={pathData}
                    fill="none"
                    stroke="#ccc"
                    strokeWidth={50}
                    strokeLinecap="round"
                    transform={`translate(0, 100)`}
                />
            </Svg>

            <View style={[styles.hole, { top: holePosition.top - 25, left: holePosition.left - 25 }]} />

            <View style={[styles.ball, { top: ballPosition.top, left: ballPosition.left }]} />

            {(isCalibrating) && (
                <View style={styles.message}>
                    <Text style={styles.winText}>Calibration...</Text>
                </View>
            )}
            </>
        )}
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
    },
    ball: {
        position: 'absolute',
        width: 25,
        height: 25,
        borderRadius: 25,
        backgroundColor: 'green',
    },
    hole: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'black',
    },
    message: {
        position: 'absolute',
        top: '40%',
        left: '25%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    winText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'green',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      },
      messageBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        width: '60%',           
        maxWidth: 300,          
        alignItems: 'center',
        justifyContent: 'center',
      },
      
});
