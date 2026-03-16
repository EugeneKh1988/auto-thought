import Container from '@/components/Container';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/proof/$situation_id/$thought_id')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Container className='pt-2.5'>
      <p>Доказательства</p>
    </Container>
  );
}
