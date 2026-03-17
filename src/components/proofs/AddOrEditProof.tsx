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
import { formOptions, useForm } from "@tanstack/react-form";
import z from "zod";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useThoughtStore } from "@/store/thoughtStore";
import { useProofStore } from "@/store/proofStore";
import { addProof, updateProof } from "@/data/proof_queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface AddOrEditProofProps {
  className?: string;
}

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(1000, "Максимум 1000 символов"),
  proof_type: z.string().refine((v) => Number(v) > 0 && Number(v) < 4, {
    message: "Должно быть от 1 до 4",
  }),
});

type TAdd = z.infer<typeof formSchema>;
const defaultValues: TAdd = { name: "", proof_type: "1" };

const formOpts = formOptions({ defaultValues }); 

const AddOrEditProof: React.FC<AddOrEditProofProps> = ({
  className,
}) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const mode = useProofStore((state) => state.mode);
  const closeDialog = useProofStore((state) => state.clearMode);
  const currentProof = useProofStore((state) => state.currentProof);
  const situation_id = useThoughtStore((state) => state.situationId);
  const thought_id = useProofStore((state) => state.thoughtId);

  // mutations
  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: addProof,
  });
  const changeMutation = useMutation({
    mutationFn: updateProof,
  });

  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      //console.log(value);
      // adding data
      if (mode == "add" && situation_id && thought_id) {
        addMutation.mutate(
          {
            name: value.name,
            proof_type: Number(value.proof_type),
            situation_id,
            thought_id,
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({ queryKey: ["proofs"] });
              closeDialog();
              form.reset();
            },
            onError: (error) => {
              toast.error(error.message);
            },
          },
        );
      }
      // changing data
      if (mode == "edit" && currentProof) {
        changeMutation.mutate(
          {
            id: currentProof?.id,
            name: value.name,
            proof_type: Number(value.proof_type),
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({ queryKey: ["proofs"] });
              closeDialog();
              form.reset();
            },
            onError: (error) => {
              toast.error(error.message);
            },
          },
        );
      }
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  useEffect(() => {
    // set fields for edit
    if(mode == 'edit' && currentProof) {
      form.setFieldValue('name', currentProof.name);
      form.setFieldValue('proof_type', String(currentProof.proof_type));
    }

    /* if(mode == null) {
      form.reset();
    } */
  }, [mode, currentProof]);

  return (
    <Dialog
      open={mode == "add" || mode == "edit"}
      onOpenChange={(open) => (!open ? closeDialog() : null)}
    >
      <form
        id="proof-form"
        className={` ${classNameValue}`}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {mode == "add" ? "Добавить запись" : "Редактировать запись"}
            </DialogTitle>
            <DialogDescription>
              {mode == "add"
                ? "Внесите подтверждение"
                : "Измените подтверждение"}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Описание</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Подтверждение"
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {`${field.state.value.length}/1000 символ${field.state.value.length > 1 ? "ов" : ""}`}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="proof_type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="responsive" data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="proof-form-select-type">
                        Тип потверждения
                      </FieldLabel>
                      <FieldDescription>
                        Выберите один из типов
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        id="proof-form-select-type"
                        aria-invalid={isInvalid}
                        className="min-w-30"
                      >
                        <SelectValue placeholder="Выбрать" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectItem value="1">За</SelectItem>
                        <SelectItem value="2">Против</SelectItem>
                        <SelectItem value="3">Рациональные мысли</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button type="submit" form="proof-form">
              {mode == "add" ? "Сохранить" : "Изменить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddOrEditProof;
