"use client";
import "./styles.css";

import { Form } from "radix-ui";
import { Button } from "@radix-ui/themes";
import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestIns } from "@/util/request";

export default function Home() {
  const router = useRouter();
  const [info, setInfo] = useState<{ [key: string]: string | boolean }>({
    email: "",
    password: "",
    loading: false,
  });

  const onLogin = (event: React.FormEvent) => {
    event.preventDefault();

    setInfo((prev) => ({ ...prev, loading: true }));
    requestIns
      .post("/user", {
        email: info.email,
        password: info.password,
      })
      .then((response) => {
        if (!response.data.token) {
          alert(response.data.error);
          throw new Error("Login error");
        }

        window.localStorage.setItem("token", response.data.token);
        router.push("/info");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useLayoutEffect(() => {
    if (window.localStorage.getItem("token")) {
      router.push("/info");
    }
  }, []);

  return (
    <div className="h-full flex justify-center">
      <div className="flex flex-col justify-center">
        <Form.Root className="FormRoot" onSubmit={(event) => onLogin(event)}>
          <Form.Field className="FormField" name="email">
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <Form.Label className="FormLabel">Email</Form.Label>
              <Form.Message className="FormMessage" match="valueMissing">
                Please enter your email
              </Form.Message>
              <Form.Message className="FormMessage" match="typeMismatch">
                Please provide a valid email
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                className="Input"
                id="email"
                type="email"
                required
                value={info.email as string}
                onChange={(event) =>
                  setInfo((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </Form.Control>
          </Form.Field>

          <Form.Field className="FormField" name="question">
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <Form.Label className="FormLabel">Password</Form.Label>
              <Form.Message className="FormMessage" match="valueMissing">
                Please enter password
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                className="Input"
                id="password"
                type="password"
                required
                value={info.password as string}
                onChange={(event) =>
                  setInfo((prev) => ({ ...prev, password: event.target.value }))
                }
              />
            </Form.Control>
          </Form.Field>
          <Form.Submit asChild>
            <Button
              role="login"
              className="Button"
              style={{ marginTop: 10 }}
              loading={info.loading as boolean | undefined}
            >
              Login
            </Button>
          </Form.Submit>
        </Form.Root>

        <Button
          role="register"
          className="Button"
          style={{ marginTop: 10 }}
          onClick={() => router.push("/register")}
        >
          Register
        </Button>
      </div>
    </div>
  );
}
