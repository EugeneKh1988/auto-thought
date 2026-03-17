import Container from '@/components/Container';
import Proofs from '@/components/proofs/Proofs';
import { authClient } from '@/lib/auth-client';
import { authMiddleware } from '@/middleware/auth';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute("/proof/$situation_id/$thought_id")({
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
  return (
    <Container className='pt-2.5'>
      <Proofs />
    </Container>
  );
}
