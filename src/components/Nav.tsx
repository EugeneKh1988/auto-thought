import { Link, linkOptions } from "@tanstack/react-router";
import Container from "./Container";
import { BookA, Home } from "lucide-react";

interface NavProps {
    className?: string,
}

const links = linkOptions([
  {
    to: "/",
    icon: Home,
  },
  {
    to: "/negative",
    icon: BookA,
  },
]);

const Nav: React.FC<NavProps> = ({className, }) => {
  const classNameValue = className ? `${className}` : "";
  return (
    <div className={`border-b py-5 ${classNameValue}`}>
      <Container className="flex justify-center gap-10">
        {links.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.to}
              activeProps={{
                className:
                  "text-blue-500",
              }}
            >
              <Icon className="size-32 md:size-48" />
            </Link>
          );
        })}
      </Container>
    </div>
  );
};

export default Nav;