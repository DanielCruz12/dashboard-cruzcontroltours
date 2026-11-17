"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const storedUser = {
    email: "fesapsv@yahoo.com",
    hashedPassword: bcrypt.hashSync(process.env.NEXT_PUBLIC_PASSWORD ?? "", 10),
  };
  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 2 seconds timeout
    const isMatch = await bcrypt.compare(
      values.password,
      storedUser.hashedPassword
    );

    if (values.email === storedUser.email && isMatch) {
      document.cookie = `auth_token=fake_token; path=/; max-age=${
        60 * 60 * 24
      }; Secure; SameSite=Strict`;
      router.push("/panel/eventos");
    } else {
      alert("Credenciales incorrectas");
    }
    setIsLoading(false);
  };
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={LoginSchema}
      onSubmit={(values, { setSubmitting }) => {
        handleLogin(values);
        setSubmitting(false);
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="w-full max-w-md space-y-6 mx-auto px-4">
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Usuario
            </Label>
            <Field
              as={Input}
              id="email"
              name="email"
              type="email"
              placeholder="Nombre de usuario"
              className={`mt-1 ${
                errors.email && touched.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && touched.email && (
              <div className="text-red-500 text-xs mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Contraseña
            </Label>
            <div className="relative mt-1">
              <Field
                as={Input}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingrese la contraseña"
                className={
                  errors.password && touched.password ? "border-red-500" : ""
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <div className="text-red-500 text-xs mt-1">{errors.password}</div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || isLoading}
          >
            {isLoading ? "Cargando..." : "Iniciar sesión"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
