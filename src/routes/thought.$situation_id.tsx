import Container from '@/components/Container';
import Thoughts from '@/components/thoughts/Thoughts';
import { isAuth } from '@/lib/utils';
import { IThoughtProperties } from '@/utils/interfaces';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute("/thought/$situation_id")({
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
  validateSearch: (search: Record<string, unknown>): IThoughtProperties => {
    return {
      name: (search?.name as string) || undefined,
      creation_date: (search?.creation_date as string) || undefined,
    };
  },
});

function RouteComponent() {
  return (
    <Container className='pt-2.5'>
      <Thoughts />
    </Container>
  );
}
