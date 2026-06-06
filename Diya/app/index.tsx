import { useRouter , Redirect } from "expo-router";
import { useEffect } from "react";
import { Text, View, Image } from "react-native";
import { StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { api } from "../services/api";
import { useState } from "react";



export default function Index() {

  return <Redirect href="/auth" />;
  const router = useRouter();
  const [msg, setMsg] = useState("Not connected");

   const testBackend = async () => {
    try {
      const res = await api.health();
      setMsg(res.message);
    } catch (err) {
      setMsg("Backend not reachable");
      console.log(err);
    }
  };
  



 useEffect(() => {
    const t = setTimeout(() => {
      // replace so user can't go back to this splash/info screen
      router.replace("/language");
    }, 2000); // 2000ms delay, adjust as needed

    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
  api.health()
    .then(res => console.log("Backend connected:", res))
    .catch(err => console.log("Backend error:", err));
}, []);

  return (
    <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={styles.view}>
      <Image style={styles.image} source={require("../assets/images/icon.png")} />
    </LinearGradient>
  );
  
}
const styles = StyleSheet.create({
    view: {
      flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
      width: "90%",
      height: "90%",
      marginBottom: 20,
    }
  });
