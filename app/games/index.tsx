import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function GamesHome() {

  const titleScreen = require("../../assets/images/AppTitle.png");

  return (
    
    <View style={styles.container}>
      

      <Image source={titleScreen} style={{ width: "100%", height: 200, marginBottom:200}} />
      

      {/* TEST ENTRY POINT */}
      <Link href="/games/speechRecognition" asChild>
        <Pressable>
          <Text style={styles.takeTestText}>Take the test</Text>
        </Pressable>
      </Link>

      {/* Tutti i pulsanti dei minigiochi sono stati commentati per semplificare l'interfaccia
      <Link href="/games/minigame1" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Dal primo</Text>
        </Pressable>
      </Link>

      <Link href="/games/minigame1" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco 1</Text>
        </Pressable>
      </Link>

      <Link href="/games/minigame2" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco Giroscopio</Text>
        </Pressable>
      </Link>
        
      <Link href="/games/minigamegolf" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco golf</Text>
        </Pressable>
      </Link>

      <Link href="/games/minigamememo" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco memo</Text>
        </Pressable>
      </Link>

      <Link href="/games/minigameTorre" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco Torre</Text>
        </Pressable>
      </Link>

      <Link href="/games/minigameShot" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco Shot</Text>
        </Pressable>
      </Link>

      
      <Link href="/games/minigameLigth" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco Light</Text>
        </Pressable>
      </Link>
      
      <Link href="/games/minigameConta" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco ContaPassanti</Text>
        </Pressable>
      </Link>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "white" 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20 
  },
  button: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: { 
    color: "white", 
    fontSize: 18 
  },

  // Nuovo stile per "Take the test"
  takeTestText: {
    fontSize: 26,
    color: "#2c3e50",
    textDecorationLine: 'underline',
    marginBottom: 250,
  },
});
