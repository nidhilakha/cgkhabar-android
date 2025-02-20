import ProfileScreen from "@/screens/profile/profile.screen";
import { ThemeProvider } from "@/utils/ThemeContext"; // Import ThemeProvider
import { FontProvider } from "@/utils/FontContext"; // Import ThemeProvider

export default function profile() {
  
  return (
    
    <ThemeProvider>
          <FontProvider>

    <ProfileScreen />

    </FontProvider>
  </ThemeProvider>
    
  )
}