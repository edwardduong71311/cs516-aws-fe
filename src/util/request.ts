import axios from "axios";

const requestIns = axios.create();
requestIns.interceptors.request.use(
  function (config) {
    config.baseURL = process.env.NEXT_PUBLIC_BE;
    config.headers["Authorization"] = `Bearer ${window.localStorage.getItem(
      "token"
    )}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

requestIns.interceptors.response.use(
  function (response) {
    if (response.status == 200 && response.data === null) {
      window.localStorage.setItem("token", "");
      window.location.reload();
    }
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export { requestIns };
