import ContactScreen from "@/screens/contact/contact.screen";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function index() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <ContactScreen />
    </StripeProvider>
  );
}