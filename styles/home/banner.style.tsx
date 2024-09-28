import { StyleSheet } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    height: hp("55"),
 
  },

  slide: { 
    flex: 1 ,
    
  },

  background: {
    width: "100%",
    height: hp("27"),
    resizeMode: "stretch",
    zIndex: 1,
  },
  title: {
    marginTop: 5,
    marginBottom: 10,
    fontFamily: "Raleway_700Bold",
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    height: 80,
    backgroundColor: "#fff",
    
    padding: 10,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 300,
   
  },
  image: {
    width: "100%",
    height: 300,

  },
  button: {
    position: "absolute",
    right: 10,
    bottom: 20,
    backgroundColor: "#BF0000",
    paddingHorizontal: 16,
    borderRadius: 4,
    paddingVertical: 5,
    
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
  },

  dot: {
    backgroundColor: "#C6C7CC",
    width: 10,
    height: 10,
    borderRadius: 5,
  
         

  },

  activeDot: {
    backgroundColor: "#BF0000",
    width: 10,
    height: 10,
    borderRadius: 5,
  
    
  },

  backgroundView: {
    position: "absolute",
    zIndex: 5,
    paddingHorizontal: 18,
    paddingVertical: 30,
    flexDirection: "row",
    alignItems: "center",
   
  },

  backgroundViewContainer: {
    width: responsiveWidth(45),
    height: responsiveWidth(30),
    marginTop: -50,
  },

  backgroundViewText: {
    color: "white",
    fontSize: hp("2.7%"),
  },

  backgroundViewOffer: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginTop: 5,
  },

  backgroundViewImage: {
    width: wp("38%"),
    height: hp("22%"),
    top: -15,
  },

  backgroundViewButtonContainer: {
    borderWidth: 1.1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    width: 109,
    height: 32,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  backgroundViewButtonText: {
    color: "#FFFF",
  },
});
