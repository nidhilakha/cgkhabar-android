import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import Button from "@/components/button/button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import { LinearGradient } from "expo-linear-gradient";
import {  Entypo } from "@expo/vector-icons";

export default function VerifyAccountScreen() {
  const [code, setCode] = useState(new Array(4).fill(""));
  const inputs = useRef<any>(
    Array.from({ length: 4 }, () => React.createRef<TextInput>())
  );

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1].current?.focus();
    }

    if (text === "" && index > 0) {
      inputs.current[index - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    const otp = code.join("");
    const activation_token = await AsyncStorage.getItem("activation_token");

    await axios
      .post(`${SERVER_URI}/activate-user`, {
        activation_token,
        activation_code: otp,
      })
      .then((res: any) => {
        Toast.show("Your account activated successfully!", {
          type: "success",
        });
        setCode(new Array(4).fill(""));
        router.push("/(routes)/login");
      })
      .catch((error) => {
        Toast.show("Your OTP is not valid or expired!", {
          type: "danger",
        });
      });
  };
  return (
    <LinearGradient colors={["#A6121F", "#A60303"]} style={styles.container}>
      <Text style={[styles.headerText, { color: "#fff", fontSize: 30 }]}>
        Verification Code
      </Text>
      <Text style={styles.subText}>
        We have sent the verification code to your email address.
      </Text>
      <View style={styles.inputContainer}>
        {code.map((_, index) => (
          <TextInput
            style={styles.inputBox}
            key={index}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleInput(text, index)}
            value={code[index]}
            ref={inputs.current[index]}
            returnKeyType="done"
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          padding: 16,
          borderRadius: 8,
          marginHorizontal: 16,
          backgroundColor: "white",
          marginTop: 20,
        }}
      >
        <Text
          style={{
            color: "#A60303",
            textAlign: "center",
            fontSize: 22,
            fontFamily: "Raleway_700Bold",
          }}
        >
          Submit <Entypo name="login" size={24} color="#A60303" />
        </Text>
      </TouchableOpacity>

      {/* <View
        style={{
          padding: 16,
          borderRadius: 8,
          marginHorizontal: 16,
          backgroundColor: "white",
          marginTop: 20,
        }}
      >
        <Button title={"Submit"} onPress={handleSubmit}></Button>
      </View> */}

      <TouchableOpacity
        onPress={() => router.push("/(routes)/login")}
        style={{ marginTop: 20 }}
      >
        <Text style={{fontSize: 18, color: "#D98B91", fontFamily: "Nunito_600SemiBold"}}>
          Go back to <Text  style={{
                fontSize: 18,
                fontFamily: "Nunito_600SemiBold",
                color: "#fff",
                marginLeft: 5,
              }}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    fontSize: 20,
    color: "#D98B91",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  inputBox: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    marginRight: 10,
    borderRadius: 10,
    fontSize: 20,
  },
});
