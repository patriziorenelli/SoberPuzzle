//home screen / redirect alla home dei giochi
import { Redirect } from "expo-router";


export default function Home() {

  return <Redirect href="/games" />;
}
