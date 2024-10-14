// hooks/auth/useUser.ts
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";

interface User {
  id: string;
  name: string;
  avatar?: {
    url: string;
  };
}

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null); // Updated to null to indicate it's loading

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      const firstVisit = await AsyncStorage.getItem("first_visit");

      try {
           // Check if it's the user's first visit
        // const firstVisit = await AsyncStorage.getItem("first_visit");
        console.log("code in useuser npm Stored value of first_visit :", firstVisit);
        if (firstVisit === null || firstVisit === undefined||firstVisit==="") {
          // First visit
          console.log(firstVisit);
          setIsFirstVisit(true);
          await AsyncStorage.setItem("first_visit", "false");
        } else {
          // Not the first visit
          setIsFirstVisit(false);
        }

        const res = await axios.get(`${SERVER_URI}/me`, {
          headers: {
            "access-token": accessToken || "",
            "refresh-token": refreshToken || "",
          },
        });
        setUser(res.data.user);

     
      } catch (error: any) {
        console.error("Error fetching user or checking first visit:", firstVisit); // Log the error

        setError(error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [refetch]);

  return { loading, user, error, setUser, setRefetch, refetch, isFirstVisit };
}
