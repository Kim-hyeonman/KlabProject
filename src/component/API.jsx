import axios from 'axios';

// const API = axios.create({
//     baseURL: 'http://localhost:3001',
//     timeout: 10000,
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     withCredentials: true
// })

// Axios 인스턴스를 생성합니다. App.jsx

const host = window.location.hostname === "localhost" 
  ? 'http://52.78.72.107:8080'
  : "api";

export const API = axios.create({
  baseURL: host,
  });
  
  // 요청 인터셉터 추가
  API.interceptors.request.use(
    function (config) {
      console.log("요청합니다 !");
      return config;
    },
    function (error) {
      console.log("요청 오류 !");
      return Promise.reject(error);
    }
  );
  
  // 응답 인터셉터 추가
  API.interceptors.response.use(
    function (response) {
      console.log("응답합니다 ! ");
      return response;
    },
    function (error) {
      console.log("응답 실패 !");
      return Promise.reject(error);
    }
  );

export default API;