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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useThoughtStore } from "@/store/thoughtStore";
import { addThought, updateThought } from "@/data/thought_queries";

interface AddOrEditThoughtProps {
  className?: string;
}

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(1000, "Максимум 1000 символов"),
  strength: z.number().min(0, "Минимум 0").max(100, "Максимум 100"),
});

type TAdd = z.infer<typeof formSchema>;
const defaultValues: TAdd = { name: "", strength: 0 };

const formOpts = formOptions({ defaultValues }); 

const AddOrEditThought: React.FC<AddOrEditThoughtProps> = ({
  className,
}) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const mode = useThoughtStore((state) => state.mode);
  const closeDialog = useThoughtStore((state) => state.clearMode);
  const currentThought = useThoughtStore((state) => state.currentThought);
  const situationId = useThoughtStore((state) => state.situationId);

  // mutations
  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: addThought,
  });
  const changeMutation = useMutation({
    mutationFn: updateThought,
  });

  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      //console.log(value);
      // adding data
      if (mode == "add" && situationId) {
        addMutation.mutate({ ...value, situation_id: situationId }, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["thoughts"] });
            closeDialog();
            form.reset();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        });
      }
      // changing data
      if (mode == "edit" && currentThought) {
        changeMutation.mutate({id: currentThought?.id, ...value}, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["thoughts"] });
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
    if(mode == 'edit' && currentThought) {
      form.setFieldValue('name', currentThought.name);
      form.setFieldValue('strength', currentThought.strength || 0);
    }

    /* if(mode == null) {
      form.reset();
    } */
  }, [mode, currentThought]);

  return (
    <Dialog
      open={mode == "add" || mode == "edit"}
      onOpenChange={(open) => (!open ? closeDialog() : null)}
    >
      <form
        id="thought-form"
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
                ? "Внесите автоматическую мысль"
                : "Измените автоматическую мысль"}
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
                        placeholder="Описание ситуации"
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
              name="strength"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Сила убеждения</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      aria-invalid={isInvalid}
                      placeholder="Сила убеждения"
                      autoComplete="off"
                    />
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
            <Button type="submit" form="thought-form">
              {mode == "add" ? "Сохранить" : "Изменить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddOrEditThought;
