//componente che codifica una carta con animazione di flip

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

//definizione di un tipo per le props del componente
type Props = {
    isFlipped: boolean; //stato di rivelazione della carta
    onPress: () => void; //funzione chiamata quando la carta viene premuta
    index: number; //indice della carta
};

const FlipCard: React.FC<Props> = ({ isFlipped, onPress, index }) => {

    //hook di reanimated che permette di creare un valore condiviso tra i componenti
    //0 è il valore iniziale della rotazione
    const rotation = useSharedValue(0);

    //effetto che viene eseguito quando lo stato di rivelazione della carta cambia
    //quando la carta viene rivelata, il valore di rotazione passa da 0 a 180 gradi
    useEffect(() => {
        rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 300 });
    }, [isFlipped]);

    //stile animato per la parte frontale della carta
    //quando la rotazione è 0, la parte frontale è visibile
    //quando la rotazione è 180, la parte frontale è nascosta
    const frontStyle = useAnimatedStyle(() => {
        const rotateY = `${interpolate(rotation.value, [0, 180], [0, 180])}deg`;
        return {
        transform: [{ rotateY }],
        backfaceVisibility: 'hidden',
        };
    });

    //stile animato per la parte posteriore della carta
    const backStyle = useAnimatedStyle(() => {
        const rotateY = `${interpolate(rotation.value, [0, 180], [180, 360])}deg`;
        return {
        transform: [{ rotateY }],
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: 0,
        };
    });

    return (
        <Pressable onPress={onPress} style={styles.container}>
        <Animated.View style={[styles.card, styles.front, frontStyle]}>
            <Text style={styles.text}>?</Text>
        </Animated.View>

        <Animated.View style={[styles.card, styles.back, backStyle]}>
            <Text style={styles.text}>🎯</Text>
        </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 60,
        margin: 5,
    },
    card: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden',
    },
    front: {
        backgroundColor: '#ccc',
    },
    back: {
        backgroundColor: '#4caf50',
        position: 'absolute',
    },
    text: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default FlipCard;
