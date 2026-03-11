import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { situationsOptions } from "@/data/situation_queries";
import { SearchAlert, Trash } from "lucide-react";

interface SituationsProps {
    className?: string,
}


const Situations: React.FC<SituationsProps> = ({ className, }) => {
  const classNameValue = className ? `${className}` : "";

  const route = getRouteApi('/negative');
    const search = route.useSearch();
  
    const [page, setPage] = useState(1);
    const situationsPerPage = 10;
  
    const { data:items, error, isError, isFetching } = useQuery(situationsOptions(page, situationsPerPage, search));
  
    const lastPage = useMemo(() => {
      if (items && items.length) {
        return Math.ceil(items.length / situationsPerPage);
      }
      return 1;
    }, [items]);

    // reset page after search changes
    useEffect(() => {
      if (page && page != 1) {
        setPage(1);
      }
    }, [search]);

    return (
      <div className={`pt-1 ${classNameValue}`}>
        {items && Array.isArray(items.situations) && !isError ? (
          <>
            {items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>
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