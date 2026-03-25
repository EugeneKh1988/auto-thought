import { Link, linkOptions, useLocation, useNavigate, useRouter, } from "@tanstack/react-router";
import Container from "./Container";
import { Home, LogIn, MoveLeft, SquareArrowRightExit } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useEffect } from "react";
import { delFromLocalStorage, getUserId, logout } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

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
  //const { data } = useSession();
  const isLogged = useAuthStore(state => state.isLogged);
  const setLoginStatus = useAuthStore(state => state.setLogged);
  const userId = useAuthStore(state => state.user_id);
  const setUserId = useAuthStore(state => state.seUserId);
  const clearUserId = useAuthStore(state => state.clearUserId);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const router = useRouter();
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasHydrated) return;
    (async () => {
      if (!isLogged) {
        const res = await logout();
        if (res) {
          delFromLocalStorage("key");
          delFromLocalStorage("token");
          clearUserId();
          navigate({ to: "/login" });
        }
      }
      if (isLogged) {
        const retUserId = await getUserId();
        if(userId != retUserId) {
          setUserId(retUserId);
        }
      }
    })();
  }, [isLogged, hasHydrated]);

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
          {isLogged ? (
            <Button
              variant="ghost"
              onClick={() => setLoginStatus(false)}
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