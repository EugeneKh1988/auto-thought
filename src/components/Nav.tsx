import { Link, linkOptions, useLocation, useRouter, } from "@tanstack/react-router";
import Container from "./Container";
import { Home, LogIn, MoveLeft, SquareArrowRightExit } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface NavProps {
    className?: string,
}

const links = linkOptions([
  {
    to: "/",
    icon: Home,
  },
  /* {
    to: "/negative",
    icon: BookA,
  }, */
]);

const Nav: React.FC<NavProps> = ({className, }) => {
  const classNameValue = className ? `${className}` : "";

  // session
  const { data } = useSession();

  const router = useRouter();
  const loc = useLocation();

  //console.log(loc.pathname);

  return (
    <div className={`border-b py-1.5 ${classNameValue}`}>
      <Container className="flex justify-between items-center gap-2.5">
        <div>
          {loc.pathname != "/" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={() => router.history.back()}
                  className="cursor-pointer"
                >
                  <MoveLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Назад</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <div className="flex gap-2.5">
          {links.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.to}
                activeProps={{
                  className: "text-blue-500",
                }}
              >
                <Icon className="size-8 md:size-12" />
              </Link>
            );
          })}
        </div>
        <div>
          {data?.user && data?.user.id ? (
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="cursor-pointer size-8 md:size-12"
            >
              <SquareArrowRightExit className="size-8 md:size-12" />
            </Button>
          ) : (
            <Link
              to="/login"
              activeProps={{
                className: "text-blue-500",
              }}
            >
              <LogIn className="size-8 md:size-12" />
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Nav;