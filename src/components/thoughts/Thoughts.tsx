import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchAlert, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { thoughtsOptions } from "@/queries/thought_queries";
import ThoughtItem from "./ThoughtItem";
import { useThoughtStore } from "@/store/thoughtStore";
import AddOrEditThought from "./AddOrEditThought";
import DeleteThought from "./DeleteThought";

interface ThoughtsProps {
    className?: string,
}


const Thoughts: React.FC<ThoughtsProps> = ({ className }) => {
  const classNameValue = className ? `${className}` : "";

  const route = getRouteApi("/thought/$situation_id");
  const search = route.useSearch();
  const params = route.useParams();

  const [page, setPage] = useState(1);
  const thoughtsPerPage = 10;

  const {
    data: items,
    error,
    isError /* isFetching */,
  } = useQuery(
    thoughtsOptions(page, thoughtsPerPage, params.situation_id, search),
  );

  const setMode = useThoughtStore((state) => state.setMode);
  const setSituationId = useThoughtStore((state) => state.setSituationId);
  const situationId = useThoughtStore((state) => state.situationId);

  const lastPage = useMemo(() => {
    if (items && items.length) {
      return Math.ceil(items.length / thoughtsPerPage);
    }
    return 1;
  }, [items]);

  const onNextPage = () => {
    if (items && items.length && page < lastPage) {
      setPage((prev) => prev + 1);
    }
  };

  const onPrevPage = () => {
    if (items && items.length && page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  // reset page after search changes
  useEffect(() => {
    if (page && page != 1) {
      setPage(1);
    }
  }, [search]);

  // set situationId from params
  useEffect(() => {
    if (situationId != Number(params.situation_id)) {
      setSituationId(Number(params.situation_id));
    }
  }, [params]);

  return (
    <div className={`pt-1 ${classNameValue}`}>
      <AddOrEditThought />
      <DeleteThought />
      <p className="text-[20px] text-center font-medium">
        Автоматические мысли о ситуации &#171;{items?.situation?.name}&#187;
      </p>
      {items && Array.isArray(items.thoughts) && !isError ? (
        <>
          {items.length > 0 && (
            <>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
                {items.thoughts.map((item, index) => (
                  <ThoughtItem key={index} item={item} />
                ))}
              </div>
              {/** Pagination */}
              <Pagination className="mx-0 w-auto mt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text="Назад"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPrevPage();
                      }}
                    />
                  </PaginationItem>
                  <li className="text-[12px]">
                    {page} из {lastPage}
                  </li>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text="Вперед"
                      onClick={(e) => {
                        e.preventDefault();
                        onNextPage();
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Button
                onClick={() => {
                  setMode("add");
                }}
                className="mt-2 cursor-pointer"
              >
                Добавить
              </Button>
            </>
          )}
          {items &&
            Array.isArray(items.thoughts) &&
            items.length == 0 &&
            !isError && (
              <div className="mt-10 md:mt-12 3xl:mt-14">
                <div className="flex flex-col justify-center items-center gap-1">
                  <Trash size={64} className="text-center" />
                  <p className="text-[14px] md:text-[16px] 3xl:text-[18px] leading-[150%]">
                    Нет данных
                  </p>
                  <Button
                    onClick={() => {
                      setMode("add");
                    }}
                    className="cursor-pointer"
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            )}
        </>
      ) : (
        <div className="mt-10 md:mt-12 3xl:mt-14">
          {/** Error */}
          <div className="flex flex-col justify-center items-center gap-1">
            <SearchAlert size={64} className="text-center" />
            <p className="text-[14px] md:text-[16px] 3xl:text-[18px] leading-[150%]">
              {error?.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Thoughts;