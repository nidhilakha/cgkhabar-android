import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/onboarding/onboard";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  Fontisto,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { commonStyles } from "@/styles/common/common.styles";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";


export default function SignUpScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name:"",
    email: "",
    password: "",
  });

  const [error, setError] = useState({
    password: "",
  });

  const [required, setRequired] = useState("");

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handlePasswordValidation = (value: string) => {
    const password = value;
    const passwordSpecialCharacter = /(?=.*[!@#$&*])/;
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordSixValue = /(?=.{6,})/;

    if (!passwordSpecialCharacter.test(password)) {
      setError({
        ...error,
        password: "Write at least one special character.",
      });
    } else if (!passwordOneNumber.test(password)) {
      setError({
        ...error,
        password: "Write at least one number.",
      });
    } else if (!passwordSixValue.test(password)) {
      setError({
        ...error,
        password: "Write at least 6 characters.",
      });
    } else {
      setError({
        ...error,
        password: "", // Clear the error message when password is valid
      });
    }

    // Always update userInfo.password regardless of validation result
    setUserInfo({ ...userInfo, password: password });
  };

  const handleSignIn = async () => {
    setButtonSpinner(true);

    await axios.post(`${SERVER_URI}/registration`,{
      
name:userInfo.name,
email:userInfo.email,
password:userInfo.password,

}).then(async(res)=>{
  await AsyncStorage.setItem(
    "activation_token",
    res.data.activationToken
  );
  Toast.show(res.data.message, {
    type: "success",
  });
 setUserInfo({
    name:"",
    email: "",
    password: "",
  });
  setButtonSpinner(false);

     router.push("/(routes)/verifyAccount")

}).catch((error)=>{
  setButtonSpinner(false);

  Toast.show("Email already exist",{
    type: "danger", 
  });

  });
};
  // handleSignIn();
  return (
    <LinearGradient colors={["#A6121F", "#A60303"]} style={{ flex: 1, paddingTop: 10 }}>
      <ScrollView>
      <Text style={styles.welcomeText}>
        Welcome to
      </Text>
      <Image
        source={require("@/assets/logo.png")}
        style={styles.signInImage}
      />
       <Text style={[styles.learningText, { fontFamily: "Nunito_400Regular" }]}>
      सच कहने का साहस
      </Text>
      <Text style={[styles.logintext, { fontFamily: "Nunito_400Regular" }]}>
      Create an account!
      </Text>

       
        <View style={styles.inputContainer}>
          <View>
          <TextInput
              style={styles.input}
              keyboardType="default"
              value={userInfo.name}
              placeholder="Enter Name"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, name: value })
              }
            />
              <AntDesign
              style={{ position: "absolute", left: 25, top: 17 }}
              name="user"
              size={20}
              color={"#D98B91"}

            ></AntDesign> 
          </View>
          <View>
           
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              value={userInfo.email}
              placeholder="Enter Email"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, email: value })
              }
            />
            <Fontisto
              style={{ position: "absolute", left: 25, top: 17 }}
              name="email"
              size={20}
              color={"#D98B91"}
              ></Fontisto>
            {required && (
              <View style={styles.errorContainer}>
                <Entypo name="cross" size={18} color={"red"}></Entypo>
              </View>
            )}
          </View>
          <View>
            <TextInput
              style={styles.input}
              keyboardType="default"
              secureTextEntry={!isPasswordVisible}
              defaultValue=""
              placeholder="Enter Password"
              onChangeText={(value) => {
                setUserInfo({ ...userInfo, password: value });
                handlePasswordValidation(value); // Trigger password validation
              }}
            />

            <TouchableOpacity
              style={styles.visibleIcon2}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? (
                <Ionicons
                  name="eye-off-outline"
                  size={23}
                  color={"#D98B91"}
                ></Ionicons>
              ) : (
                <Ionicons
                  name="eye-outline"
                  size={23}
                  color={"#D98B91"}                ></Ionicons>
              )}
            </TouchableOpacity>
            <SimpleLineIcons
              style={{ position: "absolute", left: 25, top: 18 }}
              name="lock"
              size={20}
              color={"#D98B91"}

            ></SimpleLineIcons>
            {/* <View>
              <Text>
              {error.password}
              </Text>
           
            </View> */}
            {error.password && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Entypo name="cross" size={18} color={"red"} />
                <Text style={{ color: "red", fontSize: 14, marginTop: -1 }}>
                  {error.password}
                </Text>
              </View>
            )}
          </View>
          

          <TouchableOpacity
            onPress={handleSignIn}
            style={{
              padding: 16,
              borderRadius: 8,
              marginHorizontal: 16,
              backgroundColor: "white",
              marginTop: 20,
            }}
          >
            {buttonSpinner ? (
              <ActivityIndicator
                size="small"
                color={"white"}
              ></ActivityIndicator>
            ) : (
              <Text
              style={{
                color: "#A60303",
                textAlign: "center",
                fontSize: 22,
                fontFamily: "Raleway_700Bold",
              }}
              >
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

{/* <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:20,gap:10}}>
  <TouchableOpacity>
  <FontAwesome name="google" size={24} color={"white"}></FontAwesome>
  </TouchableOpacity>
  
  <TouchableOpacity>
  <FontAwesome name="github" size={24} color={"white"}></FontAwesome>
  </TouchableOpacity>
 

</View> */}


          <View
            style={[
              styles.signUpRedirect,
              { flexDirection: "row", alignItems: "center", marginTop: 20 },
            ]}
          >
            <Text style={{ fontSize: 18, color: "#D98B91", fontFamily: "Nunito_600SemiBold" }}>
              Alredy have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(routes)/login")}>
              <Text
               style={{
                fontSize: 18,
                fontFamily: "Nunito_600SemiBold",
                color: "#fff",
                marginLeft: 5,
              }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
