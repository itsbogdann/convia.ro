import { redirect } from "next/navigation";

export default function RootPage() {
  // Middleware already redirects unauthenticated users to /auth/login;
  // signed-in users land here from the / URL and bounce to the dashboard.
  redirect("/dashboard");
}
