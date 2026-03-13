import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import Container from "@/components/Container";
import { BookA } from 'lucide-react';
import { authMiddleware } from "@/middleware/auth";
import { authClient } from "@/lib/auth-client";

const Home: React.FC = () => {

  return (
    <Container>
      <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link to="/situations" className="flex flex-col items-center">
          <BookA size={64} className="mx-auto" />
          <span className="text-center font-medium">
            Работа с автоматическими мыслями
          </span>
        </Link>
      </div>
    </Container>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
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
