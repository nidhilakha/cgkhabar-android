import { Dimensions, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    height: hp("40%"), 
  
    borderRadius: 50,

  },
  slide: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 13,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
  },
  
  overlay: {
    position: "absolute", 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    borderRadius: 10, 
  },
  
  overlayTitle: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    color: "#fff",
    fontFamily: "Raleway_700Bold",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  overlayTitleDark: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    color: "#fff",
    fontFamily: "Raleway_700Bold",
    textAlign: "left",
    paddingHorizontal: 10,
  },
  dot: {
    width: 8, // Smaller width for the dots
    height: 8, // Smaller height for the dots
    borderRadius: 4, // Adjust radius for smaller dots
    backgroundColor: "#C6C7CC",
    marginHorizontal: 2, // Reduced horizontal margin between dots
    marginVertical:10
  },
  activeDot: {
    backgroundColor: "#BF0000",
    width: 10, // Adjusted size for active dot
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2, // Match the margin of `dot`
  },
});


