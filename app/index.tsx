// import useUser from "@/hooks/auth/useUser";
// import { Redirect } from "expo-router";
// import Loader from "@/components/loader/loader";

// export default function TabsIndex() {
//   const { loading, user } = useUser();
//   return (
//     <>
//       {loading ? (
//         <Loader />
//       ) : (
//         <Redirect href={!user ? "/(routes)/onboarding" : "/(tabs)"} />
//       )}
//     </>
//   );
// }

import useUser from "@/hooks/auth/useUser";
import { Redirect } from "expo-router";
import Loader from "@/components/loader/loader";

export default function TabsIndex() {
  const { loading,user, isFirstVisit } = useUser();

  if (loading || isFirstVisit == true) {
    return <Loader />;
  }
console.log(isFirstVisit);
  // Redirect based on whether it's the user's first visit
  return (
    <>
      <Redirect href={isFirstVisit? "/(routes)/onboarding" : "/(tabs)"} />
    </>
  );
}
