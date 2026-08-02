import { RouterProvider } from "react-router";
import { createAppRouter } from "@/app/router/createAppRouter";

export function AppRouter() {
  return <RouterProvider router={createAppRouter()} />;
}