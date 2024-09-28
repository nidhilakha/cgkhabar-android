import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp,heightPercentageToDP as hp } from "react-native-responsive-screen";
import {responsiveHeight, responsiveWidth} from "react-native-responsive-dimensions"
export const commonStyles=StyleSheet.create({
container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center",
},
buttonContainer:{
    backgroundColor:"black",
    width: responsiveWidth(88),
    height:responsiveHeight(3.5),
    borderRadius:5,
    marginHorizontal:5,
   

},
dotStyle:{
    backgroundColor:"#C6C7CC",
    width: responsiveWidth(2.5),
    height:responsiveWidth(2.5),
    borderRadius:5,
    marginHorizontal:5,

},
activeDotStyle:{
    backgroundColor:"#2467EC",
    width: responsiveWidth(2.5),
    height:responsiveWidth(2.5),
    borderRadius:5,
    marginHorizontal:5,   
},

title:{
    fontSize:hp("3.5%"),
    textAlign:"center",
},
description:{
    fontSize:hp("2.5%"),
    textAlign:"center",
    color:"#575757",
},
shortdescription:{
    fontSize:hp("2.5%"),
    textAlign:"center",
    color:"#575757",
},

welcomeButtonStyle:{
    backgroundColor:"#2467EC",
    width: responsiveWidth(88),
    height:responsiveHeight(4.5),
    borderRadius:5,


},
})