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
import { useThoughtStore } from "@/store/thoughtStore";
import { deleteThought } from "@/data/thought_queries";

interface DeleteThoughtProps {
  className?: string;
}

const DeleteThought: React.FC<DeleteThoughtProps> = ({
  className,
}) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const mode = useThoughtStore((state) => state.mode);
  const closeDialog = useThoughtStore((state) => state.clearMode);
  const currentThought = useThoughtStore((state) => state.currentThought);
  const clearThought = useThoughtStore((state) => state.clearThought);

  // mutations
  const queryClient = useQueryClient();
  const delMutation = useMutation({
    mutationFn: deleteThought,
  });

  const onDelete = () => {
    if (mode == "delete" && currentThought) {
        delMutation.mutate( { id: currentThought?.id}, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["thoughts"] });
            closeDialog();
            clearThought();
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
            Удаление всех данных о мысли
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

export default DeleteThought;
