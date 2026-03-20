import { useSituationStore } from "@/store/situationStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSituation } from "@/data/situation_queries";
import { toast } from "sonner";

interface DeleteSituationProps {
  className?: string;
}

const DeleteSituation: React.FC<DeleteSituationProps> = ({
  className,
}) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const mode = useSituationStore((state) => state.mode);
  const closeDialog = useSituationStore((state) => state.clearMode);
  const currentSituation = useSituationStore((state) => state.currentSituation);
  const clearSituation = useSituationStore((state) => state.clearSituation);

  // mutations
  const queryClient = useQueryClient();
  const delMutation = useMutation({
    mutationFn: deleteSituation,
  });

  const onDelete = () => {
    if (mode == "delete" && currentSituation) {
        delMutation.mutate({ id: currentSituation?.id}, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["situations"] });
            closeDialog();
            clearSituation();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        });
      }
  };

  return (
    <Dialog
      open={mode == "delete"}
      onOpenChange={(open) => (!open ? closeDialog() : null)}
    >
      <DialogContent className={`sm:max-w-sm ${classNameValue}`}>
        <DialogHeader>
          <DialogTitle>
            Удалить запись
          </DialogTitle>
          <DialogDescription>
            Удаление всех данных о ситуации
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button onClick={() => onDelete()}>
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSituation;
