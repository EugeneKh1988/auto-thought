import { IProof } from "@/utils/interfaces";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProofStore } from "@/store/proofStore";

interface ProofItemProps {
    item: IProof,
    className?: string,
}


const ProofItem: React.FC<ProofItemProps> = ({ className, item }) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const setMode = useProofStore((state) => state.setMode);
  const setCurrentProof = useProofStore((state) => state.setProof);

  const onEdit = () => {
    setCurrentProof(item);
    // open
    setMode("edit");
  };

  const onDelete = () => {
    setCurrentProof(item);
    // open
    setMode("delete");
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 ${classNameValue}`}
    >
      <p>{item.name}</p>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="cursor-pointer"
              onClick={() => onEdit()}
            >
              <FilePenLine />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Редактировать</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="cursor-pointer"
              onClick={() => onDelete()}
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Удалить</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ProofItem;