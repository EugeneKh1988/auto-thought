import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { situationsOptions } from "@/data/situation_queries";
import { SearchAlert, Trash } from "lucide-react";
import AddOrEditSituation from "./AddOrEditSituation";
import { Button } from "@/components/ui/button";
import { useSituationStore } from "@/store/situationStore";
import SituationItem from "./SituationItem";
import DeleteSituation from "./DeleteSituation";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface SituationsProps {
    className?: string,
}


const Situations: React.FC<SituationsProps> = ({ className, }) => {
  const classNameValue = className ? `${className}` : "";

  const route = getRouteApi('/situations');
    const search = route.useSearch();
  
    const [page, setPage] = useState(1);
    const situationsPerPage = 10;
  
    const { data:items, error, isError, /* isFetching */ } = useQuery(situationsOptions(page, situationsPerPage, search));

    const setMode = useSituationStore((state) => state.setMode);
  
    const lastPage = useMemo(() => {
      if (items && items.length) {
        return Math.ceil(items.length / situationsPerPage);
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

    return (
      <div className={`pt-1 ${classNameValue}`}>
        <AddOrEditSituation />
        <DeleteSituation />
        {items && Array.isArray(items.situations) && !isError ? (
          <>
            {items.length > 0 && (
              <>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
                  {items.situations.map((item, index) => (
                    <SituationItem key={index} item={item} />
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
                    <li className="text-[12px]">{page} из {lastPage}</li>
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
                <Button onClick={() => setMode("add")} className="mt-2">
                  Добавить
                </Button>
              </>
            )}
            {items &&
              Array.isArray(items.situations) &&
              items.length == 0 &&
              !isError && (
                <div className="mt-10 md:mt-12 3xl:mt-14">
                  <div className="flex flex-col justify-center items-center gap-1">
                    <Trash size={64} className="text-center" />
                    <p className="text-[14px] md:text-[16px] 3xl:text-[18px] leading-[150%]">
                      Нет данных
                    </p>
                    <Button onClick={() => setMode("add")}>Добавить</Button>
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

export default Situations;