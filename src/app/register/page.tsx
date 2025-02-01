"use client";
import "./styles.css";

import { Form } from "radix-ui";
import { Button } from "@radix-ui/themes";
import { ChangeEvent, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { requestIns } from "@/util/request";
import axios from "axios";

export default function Home() {
  const router = useRouter();

  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  const [info, setInfo] = useState<{ [key: string]: string | boolean }>({
    email: "",
    name: "",
    password: "",
    loading: false,
  });
  const [file, setFile] = useState<File | null>(null);

  const requestUploadImage = (
    name: string,
    type: string
  ): Promise<{ error: string; url: string }> => {
    return new Promise((resovle) => {
      requestIns
        .post("/image", {
          name,
          type,
        })
        .then((response) => {
          resovle(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  const uploadImage = async (url: string, file: File) => {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  };

  const onRegister = (event: React.FormEvent) => {
    event.preventDefault();

    setInfo((prev) => ({ ...prev, loading: true }));
    requestIns
      .put("/user", {
        email: info.email,
        password: info.password,
        name: info.name,
      })
      .then(async (response) => {
        if (!response.data.token) {
          alert(response.data.error);
          throw new Error("Register error");
        }

        window.localStorage.setItem("token", response.data.token);
        if (file) {
          const { name, type } = file;
          const data = await requestUploadImage(name, type);
          if (data.url) {
            await uploadImage(data.url, file);
          }
        }

        setTimeout(() => {
          router.push("/info");
        }, 3000);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleClick = () => {
    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  useLayoutEffect(() => {
    if (window.localStorage.getItem("token")) {
      router.push("/info");
    }
  }, []);

  return (
    <div className="h-full flex justify-center">
      <div className="flex flex-col justify-center">
        <Form.Root className="FormRoot" onSubmit={(event) => onRegister(event)}>
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

          <Form.Field className="FormField" name="name">
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <Form.Label className="FormLabel">Name</Form.Label>
              <Form.Message className="FormMessage" match="valueMissing">
                Please enter name
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                className="Input"
                id="name"
                type="text"
                required
                value={info.name as string}
                onChange={(event) =>
                  setInfo((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </Form.Control>
          </Form.Field>

          <Form.Field className="FormField" name="password">
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

          <Form.Field className="FormField" name="file">
            <Form.Control asChild>
              <input
                id="file"
                type="file"
                className="Input"
                ref={hiddenFileInput}
                required
                style={{ display: "none" }}
                onChange={handleChange}
                accept="image/png, image/jpeg, image/jpg"
              />
            </Form.Control>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <Button color="cyan" variant="surface" onClick={handleClick}>
                Upload Photo
              </Button>
              <Form.Message className="FormMessage" match="valueMissing">
                Please pick your avatar
              </Form.Message>
              <Form.Label
                className={`text-sm truncate w-[${file ? "140px" : "0px"}]`}
              >
                {file?.name}
              </Form.Label>
            </div>
          </Form.Field>

          <Form.Submit asChild>
            <Button
              role="login"
              className="Button"
              style={{ marginTop: 10 }}
              loading={info.loading as boolean | undefined}
            >
              Register
            </Button>
          </Form.Submit>
        </Form.Root>
        <Button
          role="login"
          className="Button"
          style={{ marginTop: 10 }}
          onClick={() => router.push("/")}
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}
