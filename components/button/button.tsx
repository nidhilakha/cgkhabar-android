import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { commonStyles } from '@/styles/common/common.styles'

interface ButtonProps {
  title: string;
  onPress?: () => void; // Define onPress as optional
}

export default function Button({ title, onPress = () => {} }: ButtonProps) {
    const {width}=Dimensions.get("window");
  return (
    <TouchableOpacity style={[commonStyles.buttonContainer,{width:width-1*150,height:38,justifyContent:"center",alignItems:"center",flexDirection:"row"}]} onPress={()=>onPress()}>
      <Text style={{fontSize:20,color:"white"}}>{title}</Text>
    </TouchableOpacity>
  );
}
