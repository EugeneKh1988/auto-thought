import Container from '@/components/Container';
import Situations from '@/components/Situations';
import { authClient } from '@/lib/auth-client';
import { authMiddleware } from '@/middleware/auth'
import { ISituationProperties } from '@/utils/interfaces';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute("/negative")({
  component: NegativeComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }
  },
  server: {
    middleware: [authMiddleware],
  },
  validateSearch: (search: Record<string, unknown>): ISituationProperties => {
      return {
        name: (search?.name as string) || undefined,
        creation_date: (search?.creation_date as string) || undefined,
      }
    },
});

function NegativeComponent() {
  return (
    <Container className='pt-2.5'>
      <p className='text-[20px] text-center font-medium'>Список ситуаций</p>
      <Situations />
    </Container>
  );
}
