import { useSituationStore } from "@/store/situationStore";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { formOptions, useForm } from "@tanstack/react-form";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "./ui/input-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSituation, updateSituation } from "@/data/situation_queries";
import { useEffect } from "react";
import { toast } from "sonner";

interface AddOrEditSituationProps {
  className?: string;
}

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(255, "Максимум 255 символов"),
  description: z.string().max(255, "Максимум 1000 символов"),
});

type TAdd = z.infer<typeof formSchema>;
const defaultValues: TAdd = { name: "", description: "" };

const formOpts = formOptions({ defaultValues }); 

const AddOrEditSituation: React.FC<AddOrEditSituationProps> = ({
  className,
}) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const mode = useSituationStore((state) => state.mode);
  const closeDialog = useSituationStore((state) => state.clearMode);
  const currentSituation = useSituationStore((state) => state.currentSituation);

  // mutations
  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: addSituation,
  });
  const changeMutation = useMutation({
    mutationFn: updateSituation,
  });

  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      //console.log(value);
      // adding data
      if (mode == "add") {
        addMutation.mutate(value, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["situations"] });
            closeDialog();
            form.reset();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        });
      }
      // changing data
      if (mode == "edit" && currentSituation) {
        changeMutation.mutate({id: currentSituation?.id, ...value}, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["situations"] });
            closeDialog();
            form.reset();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        });
      }
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  useEffect(() => {
    // set fields for edit
    if(mode == 'edit' && currentSituation) {
      form.setFieldValue('name', currentSituation.name);
      form.setFieldValue('description', currentSituation.description || '');
    }

    /* if(mode == null) {
      form.reset();
    } */
  }, [mode, currentSituation]);

  return (
    <Dialog
      open={mode == "add" || mode == "edit"}
      onOpenChange={(open) => (!open ? closeDialog() : null)}
    >
      <form
        id="situation-form"
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
                ? "Внесите данные о ситуации"
                : "Измените данные о ситуации"}
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
                    <FieldLabel htmlFor={field.name}>Название</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Название"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="description"
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
                        placeholder="Описание ситуации"
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {`${field.state.value.length}/1000 символ${field.state.value.length > 1 ? 'ов': ''}`}
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
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button type="submit" form="situation-form">
              {mode == "add" ? "Сохранить" : "Изменить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddOrEditSituation;
