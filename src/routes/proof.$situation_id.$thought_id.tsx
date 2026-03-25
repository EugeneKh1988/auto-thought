import Container from '@/components/Container';
import Proofs from '@/components/proofs/Proofs';
import { isAuth } from '@/lib/utils';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute("/proof/$situation_id/$thought_id")({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async () => {
    //const session = await authClient.getSession();
    const logged = await isAuth();

    if (!logged) {
      throw redirect({ to: "/login" });
    }
  },
  server: {
    middleware: [/* authMiddleware */],
  },
});

function RouteComponent() {
  return (
    <Container className='pt-2.5'>
      <Proofs />
    </Container>
  );
}
