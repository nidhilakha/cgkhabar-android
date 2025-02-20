import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    const subscription = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");
  
      // console.log("Access Token:", accessToken);
      // console.log("Refresh Token:", refreshToken);
  
      if (!accessToken) {
        console.log("No access token found. Redirecting to login...");
        setLoading(false);
        setError("User is not authenticated.");
        return;
      }
  
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  
      try {
        const response = await axios.get(`${SERVER_URI}/me`, {
          headers: {
            "access-token": accessToken,
            "refresh-token": refreshToken,
          },
        });
  
        console.log("User data from /me API:", response.data); // Log the response
        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };
    subscription();
  }, [refetch]);
  

  return { loading, user, error, setRefetch, refetch,setUser };
}
