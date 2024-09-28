import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
export const styles = StyleSheet.create({
  firstContainer: {
    alignItems: "center",
    marginTop: -100,

    paddingTop: 100,
  },
  logo: {
    width: 200,
    height: 100,
  },

  titleWrapper: {
    flexDirection: "row",
  },
  // titleTextShape1:{
  //     position:"absolute",
  //     left:-28,
  //     top:-20,

  // },
  titleText1: {
    fontSize: hp("3%"),
    textAlign: "center",
    marginTop: 20,
  },
  titleText: {
    fontSize: hp("4%"),
    textAlign: "center",
    marginTop: 5,
  },
  // titleTextShape2:{
  //     position:"absolute",
  //     left:-40,
  //     top:-20,
  // },
  titleTextShape3: {
    position: "absolute",
    left: -60,
  },
  dscWrapper: {
    marginTop: 30,
  },
  dscp: {
    textAlign: "center",
    color: "#fff",
    fontSize: hp("2%"),
  },
  buttonWrapper: {
    backgroundColor: "white",
    width: wp("70%"),
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 40,
  },
  buttonText: {
    color: "#A6121F",
    textAlign: "center",
    fontSize: 22,
  },
  onboardingpageoneicon: {
    marginVertical: 80,
    width: 80,
    height: 80,
  },

  // slideImage:{

  // }

  signInImage: {
    width: 200,
    height: 100,
    alignSelf: "center",
    marginTop: 20,
    resizeMode: "contain", // Adjust resizeMode as per your requirement
  },
  welcomeText: {
    marginTop: 80,
    textAlign: "center",
    fontSize: 24,

    fontFamily: "Raleway_700Bold",
    color: "#fff",
  },
  learningText: {
    marginTop: 20,
    backgroundColor: "#D98B91",
    textAlign: "center",
    fontSize: 22,
    color: "#A60303",
  },
  logintext: {
    marginTop: 20,

    textAlign: "center",
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
  },
  inputContainer: {
    marginHorizontal: 16,
    marginTop: 30,
  },
  input: {
    height: 55,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingLeft: 45,
    fontSize: 16,
    backgroundColor: "white",
    color: "#A1A1A1",
    marginBottom: 10,
  },
  errorContainer: {
    borderRadius: 8,

    fontSize: 16,
    backgroundColor: "white",
    color: "#A1A1A1",
  },
  visibleIcon: {
    position: "absolute",
    right: 30,
    top: 25,
  },
  visibleIcon2: {
    position: "absolute",
    right: 30,
    top: 16,
  },
  forgotSection: {
    marginHorizontal: 16,
    textAlign: "right",
    fontSize: 16,
    marginTop: 5,
    color: "#fff",
  },
  signUpRedirect: {
    flexDirection: "row",
    marginHorizontal: 16,
    justifyContent: "center",
    color: "#fff",
  },
});
