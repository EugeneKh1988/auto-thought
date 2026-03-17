import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchAlert, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThoughtStore } from "@/store/thoughtStore";
import { proofsOptions } from "@/data/proof_queries";
import { useProofStore } from "@/store/proofStore";
import AddOrEditProof from "./AddOrEditProof";
import ProofItem from "./ProofItem";
import DeleteProof from "./DeleteProof";

interface ProofsProps {
    className?: string,
}


const Proofs: React.FC<ProofsProps> = ({ className }) => {
  const classNameValue = className ? `${className}` : "";

  const route = getRouteApi("/proof/$situation_id/$thought_id");
  const params = route.useParams();

  const {
    data: items,
    error,
    isError /* isFetching */,
  } = useQuery(
    proofsOptions(params.thought_id, params.situation_id),
  );

  // store values
  const setMode = useProofStore((state) => state.setMode);
  const setSituationId = useThoughtStore((state) => state.setSituationId);
  const situationId = useThoughtStore((state) => state.situationId);
  const setThoughtId = useProofStore((state) => state.setThoughtId);
  const thoughtId = useProofStore((state) => state.thoughtId);

  // set situationId and thoughtId from params
  useEffect(() => {
    if (situationId != Number(params.situation_id)) {
      setSituationId(Number(params.situation_id));
    }
    if(thoughtId != Number(params.thought_id)) {
      setThoughtId(Number(params.thought_id));
    }
  }, [params]);

  const itemsByType = (type: number) => {
    if (items && items.proofs) {
      return items.proofs.filter((item) => item.proof_type == type);
    }
    return [];
  };

  const approveItems = useMemo(() => {
    return itemsByType(1);
  }, [items]);

  const againstItems = useMemo(() => {
    return itemsByType(2);
  }, [items]);

  const rationalItems = useMemo(() => {
    return itemsByType(3);
  }, [items]);

  return (
    <div className={`pt-1 ${classNameValue}`}>
      <AddOrEditProof />
      <DeleteProof />
      <p className="text-[20px] text-center font-medium">
        Доказательства автоматической мысли &#171;{items?.thought.name}&#187;
      </p>
      {items && Array.isArray(items.proofs) && !isError ? (
        <>
          {items.length > 0 && (
            <>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                <div>
                  <h1 className="text-[24px] font-bold uppercase text-center text-red-400">
                    За
                  </h1>
                  <div className="space-y-2">
                    {approveItems.map((item) => (
                      <ProofItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
                <div>
                  <h1 className="text-[24px] font-bold uppercase text-center text-green-400">
                    Против
                  </h1>
                  <div className="space-y-2">
                    {againstItems.map((item) => (
                      <ProofItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
                <div>
                  <h1 className="text-[24px] font-bold uppercase text-center text-blue-400">
                    Рациональные мысли
                  </h1>
                  <div className="space-y-2">
                    {rationalItems.map((item) => (
                      <ProofItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
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
            Array.isArray(items.proofs) &&
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
              {error?.message || "Ошибка загрузки"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proofs;