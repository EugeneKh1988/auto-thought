import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import z from 'zod';
import { formOptions, useForm } from '@tanstack/react-form';
import Container from '@/components/Container';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { toLocalStorage } from '@/lib/utils';
import { sha256 } from 'js-sha256';
import { invoke } from '@tauri-apps/api/core';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/(auth)/login')({
  ssr: false,
  component: LoginComponent,
});

const formSchema = z.object({
  email: z.email("Неправильный email"),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(255, "Максимум 255 символов"),
});

type TLogin = z.infer<typeof formSchema>;

const defaultValues: TLogin = { email: "", password: "" };

const formOpts = formOptions({ defaultValues }); 

function LoginComponent() {
  const [isLoading, setLoading] = useState<boolean>(false);

  const setLogged = useAuthStore((state) => state.setLogged);

  // navigate
  const navigate = useNavigate({ from: "/login" });

  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      //console.log(value);
      try {
        // start loading
        setLoading(true);
        // login
        const token = await invoke<string>("login", {
          email: value.email,
          password: value.password,
        });
        // set key
        toLocalStorage("key", sha256(value.email + value.password));
        // set token
        toLocalStorage("token", token);
        // set login status
        setLogged(true);
        // go to home page
        navigate({ to: "/" });
      } catch {
        toast.error("Ошибка входа", {
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
            
      /* signIn.email(
        {
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
      ); */
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <Container className="flex justify-center pt-13 md:pt-25">
      <Card className="w-full sm:max-w-sm">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>
            Нужно войти в систему перед использованием приложения
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/register">Регистрация</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
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
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="px-4 cursor-pointer"
            form="login-form"
          >
            {isLoading ? <Spinner data-icon="icon-start" /> : null}
            Вход
          </Button>
        </CardFooter>
      </Card>
    </Container>
  );
}
