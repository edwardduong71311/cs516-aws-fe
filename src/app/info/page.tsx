"use client";

import {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Text, Box, Card, Flex, Button } from "@radix-ui/themes";
import { UploadIcon } from "@radix-ui/react-icons";
import { requestIns } from "@/util/request";
import axios from "axios";

export default function UserInfo() {
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  const [userInfo, setUserInfo] = useState<{ [key: string]: string | boolean }>(
    {
      email: "",
      name: "",
      image: "",
      loading: false,
    }
  );
  const router = useRouter();

  const getInfo = () => {
    requestIns
      .get("/user")
      .then((response) => {
        setUserInfo((prev) => ({
          ...prev,
          email: response.data.email,
          name: response.data.name,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getImage = () => {
    requestIns
      .get("/image")
      .then((response) => {
        setUserInfo((prev) => ({
          ...prev,
          image: response.data.url,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  };

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

  const handleClick = () => {
    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUserInfo((prev) => ({ ...prev, loading: true }));

      const { name, type } = event.target.files[0];
      const data = await requestUploadImage(name, type);
      if (data.url) {
        await uploadImage(data.url, event.target.files[0]);
      }

      setTimeout(() => {
        getImage();
        setUserInfo((prev) => ({ ...prev, loading: false }));
      }, 3000);

      if (hiddenFileInput && hiddenFileInput.current) {
        hiddenFileInput.current.value = "";
      }
    }
  };

  useEffect(() => {
    getInfo();
    getImage();
  }, []);

  useLayoutEffect(() => {
    if (!window.localStorage.getItem("token")) {
      router.push("/");
    }
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Box maxWidth="240px">
        <Card>
          <Flex gap="3" align="center">
            <Box>
              <Text as="div" size="2" weight="bold">
                Email: {userInfo.email}
              </Text>
              <Text as="div" size="2" color="gray">
                Name: {userInfo.name}
              </Text>
            </Box>
          </Flex>
        </Card>
      </Box>
      <br />
      {userInfo.image && (
        <img
          className="w-auto h-[350px] rounded"
          src={userInfo.image as string}
          alt="User Image"
          style={{
            objectFit: "cover",
          }}
        />
      )}
      <br />
      <input
        type="file"
        ref={hiddenFileInput}
        style={{ display: "none" }}
        onChange={handleChange}
        accept="image/png, image/jpeg, image/jpg"
      />
      <Button
        color="cyan"
        onClick={handleClick}
        loading={userInfo.loading as boolean}
      >
        <UploadIcon /> Update Image
      </Button>
    </div>
  );
}
