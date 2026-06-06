import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{ headerShown: false, title: "Dashboard" }}
      />

      <Tabs.Screen
        name="tasks"
        options={{ headerShown: false, title: "Tasks" }}
      />

      <Tabs.Screen
        name="learninghub"
        options={{ headerShown: false, title: "Learn" }}
      />

      <Tabs.Screen
        name="communitydashboard"
        options={{ headerShown: false, title: "Community" }}
      />
    </Tabs>
  );
}
