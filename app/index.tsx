import useUser from "@/hooks/auth/useUser";
import Loader from "@/components/loader/loader";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import FrontScreen from "@/screens/auth/Front/Front.screen";
import { Redirect, useRouter } from "expo-router";
import OnBoardingScreen from "@/screens/onboarding/onboarding.screen";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";

export default function TabsIndex() {
  const router = useRouter(); 
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
// console.log(isFirstLaunch);

useEffect(() => {

  // Axios interceptor setup
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        try {
          const { data } = await axios.get(`${SERVER_URI}refreshtoken`, {
            withCredentials: true, // Ensure cookies are sent
          });
          // console.log("Access Token (Refreshed):", data.accessToken);
          // console.log("Refresh Token (Refreshed):", data.refreshToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
          return axios(error.config); // Retry the original request
        } catch (err) {
          console.error("Token refresh failed");
          window.location.href = "/login"; // Redirect to login if token refresh fails
        }
      }
      return Promise.reject(error);
    }
  );

  // Clean up the interceptor when the component unmounts
  return () => {
    axios.interceptors.response.eject(interceptor);
  };
}, []);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setIsFirstLaunch(hasLaunched === null);
      } catch (error) {
        console.error('Error checking launch state', error);
      }
    };
    checkFirstLaunch();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setIsFirstLaunch(false);
      router.push("/(routes)/welcome-intro");
    } catch (error) {
      console.error('Error setting onboarding flag', error);
    }
  };

  if (isFirstLaunch === null) {
    return <Loader />;
  }

  return isFirstLaunch ? (
    <OnBoardingScreen onComplete={completeOnboarding} />
  ) : (
    <Redirect href="/(tabs)" />
  );
}