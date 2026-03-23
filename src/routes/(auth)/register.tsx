import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { signUp } from '@/lib/auth-client';
import { toLocalStorage } from '@/lib/utils';
import { formOptions, useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { sha256 } from 'js-sha256';
import { useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';

export const Route = createFileRoute('/(auth)/register')({
  ssr: false,
  component: RegisterComponent,
})

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(255, "Максимум 255 символов"),
  email: z.email("Неправильный email"),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(255, "Максимум 255 символов"),
  password_confirm: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(255, "Максимум 255 символов"),
});

type TRegister = z.infer<typeof formSchema>;

const defaultValues: TRegister = { name: "" , email: "", password: "", password_confirm: "" };

const formOpts = formOptions({ defaultValues }); 

function RegisterComponent() {
  const [isLoading, setLoading] = useState<boolean>(false);

  // navigate
  const navigate = useNavigate({ from: "/register" });

  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      //console.log(value);
      signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            setLoading(false);
            // set key
            toLocalStorage('key', sha256(value.email + value.password));
            // go to home page
            navigate({ to: "/" });
          },
          onError: (ctx) => {
            setLoading(false);

            toast.error(ctx.error?.message ?? "Ошибка регистрации", {
              position: "bottom-right",
            });
          },
          onRequest: () => {
            setLoading(true);
          },
        },
      );
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <Container className="flex justify-center pt-13 md:pt-25">
      <Card className="w-full sm:max-w-sm">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Нужно зарегистрироваться для использования приложения
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/login">Вход</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            id="register-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Имя</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Имя"
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
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Email"
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
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Пароль</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        type="password"
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Пароль"
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
                name="password_confirm"
                validators={{
                  onChangeListenTo: ["password"],
                  onChange: ({ value, fieldApi }) => {
                    if (value !== fieldApi.form.getFieldValue("password")) {
                      return { message: "Пароли не совпадают" };
                    }
                    return undefined;
                  },
                }}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Подтверждение пароля
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        type="password"
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Повторите пароль"
                        autoComplete="off"
                      />
                      {isInvalid && field.state.meta.errors && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            disabled={isLoading}
            type="submit"
            form="register-form"
            className="px-4 cursor-pointer"
          >
            {isLoading ? <Spinner data-icon="icon-start" /> : null}
            Регистрация
          </Button>
        </CardFooter>
      </Card>
    </Container>
  );
}
