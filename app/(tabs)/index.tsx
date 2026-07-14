import React, { useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function HomePage() {

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.spring(scaleAnim,{
      toValue:1,
      useNativeDriver:true
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim,{
        toValue:1,
        duration:20000,
        easing:Easing.linear,
        useNativeDriver:true
      })
    ).start();

    // Animated.loop(
    //   Animated.sequence([
    //     Animated.timing(floatAnim,{
    //       toValue:-10,
    //       duration:3000,
    //       useNativeDriver:true
    //     }),
    //     Animated.timing(floatAnim,{
    //       toValue:0,
    //       duration:3000,
    //       useNativeDriver:true
    //     })
    //   ])
    // ).start();

    Animated.loop(
  Animated.sequence([
    Animated.timing(floatAnim,{
      toValue:-12,
      duration:1800,
      easing:Easing.inOut(Easing.ease),
      useNativeDriver:true,
    }),
    Animated.timing(floatAnim,{
      toValue:0,
      duration:1800,
      easing:Easing.inOut(Easing.ease),
      useNativeDriver:true,
    }),
  ])
).start();

  },[]);

  const rotate = rotateAnim.interpolate({
    inputRange:[0,1],
    outputRange:["0deg","360deg"]
  });

  return (

  <SafeAreaView style={styles.container}>

  <LinearGradient
    colors={["#090909","#101010","#05291d"]}
    style={StyleSheet.absoluteFillObject}
  />

  <View style={styles.glowTop}/>
  <View style={styles.glowBottom}/>

  {/* <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  > */}

    <View style={styles.hero}>

        

        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform:[
                {scale:scaleAnim},
                
              ]
            }
          ]}
        >

          <Animated.View
            style={[
              styles.rotateRing,
              {
                transform:[{rotate}]
              }
            ]}
          />

          <TouchableOpacity activeOpacity={0.9}>

            <LinearGradient
              colors={["#1d1d1d","#133b2d"]}
              style={styles.logoCircle}
            >
{/* 
              <Image
                source={require("../../assets/images/guru-consistency.png")}
                style={styles.logo}
                resizeMode="contain"
              /> */}

              <Animated.Image
  source={require("../../assets/images/guru-consistency.png")}
  style={[
    styles.logo,
    {
      transform: [
        {
          translateY: floatAnim,
        },
      ],
    },
  ]}
  resizeMode="contain"
/>

              

            </LinearGradient>

          </TouchableOpacity>

        </Animated.View>
        <Animated.View
  style={[
    styles.content,
    {
      opacity: scaleAnim,
    },
  ]}
>
  {/* Badge */}


  {/* Heading */}
  <Text style={styles.title}>
    <Text style={styles.greenText}>Stay Consistent</Text>
    {"\n"}
    <Text style={styles.whiteText}>Become</Text>
    {"\n"}
    <Text style={styles.greenText}>Unstoppable</Text>
  </Text>


  {/* Create Habit */}
  <TouchableOpacity
  style={styles.primaryButton}
  onPress={() => router.push("/createhabit")}
>
    <LinearGradient
      colors={["#34d399", "#10b981"]}
      style={styles.primaryGradient}
    >
    <View style={styles.buttonRow}>
<Text style={styles.primaryButtonText}>
Create Habit
</Text>

<Ionicons
name="chevron-forward"
size={22}
color="#000"
/>

</View>
    </LinearGradient>
  </TouchableOpacity>

  {/* View Tracker */}
  <TouchableOpacity
  style={styles.secondaryButton}
  onPress={() => router.push("/tracker")}
>
   <View style={styles.buttonRow}>

<Ionicons
name="time-outline"
size={20}
color="#fff"
/>

<Text style={styles.secondaryButtonText}>
View Tracker
</Text>

</View>
  </TouchableOpacity>

</Animated.View>

</View>

{/* </ScrollView> */}

</SafeAreaView>




  );

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#090909"
},

hero:{
flex:1,
justifyContent:"center",
alignItems:"center"

},

logoWrapper:{
width:280,
height:280,
justifyContent:"center",
alignItems:"center"
},

rotateRing:{
position:"absolute",
width:300,
height:300,
borderRadius:200,
borderWidth:2,
borderColor:"rgba(52,211,153,0.2)",
borderTopColor:"#34d399"
},

logoCircle:{
width:280,
height:280,
borderRadius:150,
justifyContent:"center",
alignItems:"center",
borderWidth:2,
borderColor:"rgba(52,211,153,0.2)"
},

logo:{
width:"90%",
height:"90%"
},

glowTop:{
position:"absolute",
top:-120,
right:-120,
width:300,
height:300,
borderRadius:150,
backgroundColor:"#34d399",
opacity:.08
},

glowBottom:{
position:"absolute",
bottom:-120,
left:-120,
width:300,
height:300,
borderRadius:150,
backgroundColor:"#34d399",
opacity:.05
},

content: {
  marginTop: 20,
  alignItems: "center",
  paddingHorizontal: 25,
},


title: {
  fontSize: 30,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom:10
},

greenText: {
  color: "#34d399",
},

whiteText: {
  color: "#ffffff",
},

primaryButton: {
  width: 320,
  borderRadius: 18,
  overflow: "hidden",
},

primaryGradient: {
  paddingVertical: 16,
  alignItems: "center",
},

primaryButtonText: {
  color: "black",
  fontSize: 18,
  fontWeight: "700",
},

secondaryButton: {
  width: 320,
  marginTop: 15,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  borderRadius: 18,
  paddingVertical: 16,
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.03)",
},

secondaryButtonText: {
  color: "#fff",
  fontSize: 17,
  fontWeight: "600",
},

scrollContent: {
  flexGrow: 1,
  justifyContent: "center",
  paddingVertical: 40,
},
buttonRow:{
flexDirection:"row",
justifyContent:"center",
alignItems:"center",
gap:10
},




});

