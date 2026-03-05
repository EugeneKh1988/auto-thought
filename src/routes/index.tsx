import { createFileRoute, Link } from "@tanstack/react-router";
import Container from "@/components/Container";
import { BookA } from 'lucide-react';

export const Home: React.FC = () => {

  return (
    <Container>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link to="/negative" className="flex flex-col items-center">
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
});
