import { Redirect } from "expo-router";

export default function Index() {
  // Immediately redirect to your dedicated splash screen. 
  // From there, your RouteGuard will take over!
  return <Redirect href="/splash" />;
}