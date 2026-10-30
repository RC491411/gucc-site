import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old address of the Founders page. */
export const Route = createFileRoute("/team")({
  beforeLoad: () => {
    throw redirect({ to: "/founders", replace: true });
  },
});
