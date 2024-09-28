import ProfileScreen from "@/screens/profile/profile.screen";
import { ThemeProvider } from './../../../utils/ThemeContext';

export default function profile() {
  
  return (
    <ThemeProvider>
      <ProfileScreen />
    
    </ThemeProvider>
  )
}