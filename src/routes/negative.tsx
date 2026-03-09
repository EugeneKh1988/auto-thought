import { authClient } from '@/lib/auth-client';
import { authMiddleware } from '@/middleware/auth'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute("/negative")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }
  },
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  return <div>Hello "/negative"!</div>;
}
