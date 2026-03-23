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
import { toast } from "sonner";
import { useProofStore } from "@/store/proofStore";
import { deleteProof } from "@/data/proof";

interface DeleteProofProps {
  className?: string;
}

const DeleteProof: React.FC<DeleteProofProps> = ({
  className,
}) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const mode = useProofStore((state) => state.mode);
  const closeDialog = useProofStore((state) => state.clearMode);
  const currentProof = useProofStore((state) => state.currentProof);
  const clearProof = useProofStore((state) => state.clearProof);

  // mutations
  const queryClient = useQueryClient();
  const delMutation = useMutation({
    mutationFn: deleteProof,
  });

  const onDelete = () => {
    if (mode == "delete" && currentProof) {
        delMutation.mutate( { id: currentProof?.id}, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["proofs"] });
            closeDialog();
            clearProof();
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
            Удаление всех данных о подтверждении
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

export default DeleteProof;
