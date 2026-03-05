import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/negative')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/negative"!</div>
}
