import React, { useState, useContext } from "react";
import { TypeAnimation } from "react-type-animation";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/AuthContext";
import { useMutation } from "react-query";
import { userLogin } from "../../api/users";
import Swal from "sweetalert2";
import Lottie from "lottie-react";
import owlAnimation from "../../assets/owlAnimation.json";
import login1 from "../../assets/login1.json";
import signup from "../../assets/signup.json";
export default function Login() {
  const [userContext, setUserContext] = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const userLoginMutation = useMutation(userLogin, {
    onSuccess: (res) => {
      console.log(res);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("id", res.data.id);
      setUserContext((prev) => ({
        ...prev,
        username: res.data.username,
        id: res.data.id,
        accessToken: res.data.accessToken,
      }));
      navigate("/lobypage");
      // 成功登錄時彈出 SweetAlert 提示
      Swal.fire({
        icon: "success",
        title: "登錄成功！",
        text: "歡迎回來！",
        confirmButtonText: "確定",
      });
    },
    onError: (err) => {
      console.log(err);
      setError("帳號或密碼錯誤");
      // 失敗登錄時彈出 SweetAlert 提示
      Swal.fire({
        icon: "error",
        title: "登錄失敗",
        text: "請檢查您的帳號或密碼！",
        confirmButtonText: "確定",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    userLoginMutation.mutate(userData);
  };

  return (
    <section className="flex flex-col md:flex-row h-screen items-center">
      <div className="hidden bg-[#8AB3B6] w-full md:w-1/2 xl:w-1/2 h-screen md:flex md:items-center md:justify-center">
        <div className="flex flex-col -m-56">
          <h1 className=" md:mx-auto md:text-2xl xl:text-5xl xl:font-semibold mx-auto text-gray-200  mb-2">
            {/* 
              Network Learning <br/>Technology
              <br/> */}
            <span className=" text-teal-900">Design Thinking</span> <br />
            System
          </h1>
          {/* <TypeAnimation
            className='text-white text-2xl font-press-start mt-2'
            sequence={[
              'Network Learning Technology', 
              2000,
              '',
              2000, 
              'NCU Wulab',
              2000,
            ]}
            speed={40}
            wrapper="span"
            cursor={true}
            repeat={Infinity}
            style={{ fontSize: '2em', display: 'inline-block' }}
          />      */}

          <Lottie
            className="xl:w-72 2xl:w-96 mx-auto mt-10"
            animationData={signup}
          />
          {/* <img src="/images/design-thinking_2.png"className="w-48 mx-auto mt-10"  /> */}
        </div>
      </div>

      {/* --------------------------------------------------------------- */}

      {/* <div className=" bg-customgray w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center rounded-l-lg"> */}
      <div className="  bg-[#FCFAF8] w-full md:mx-auto md:w-1/2 xl:w-1/2 h-screen px-6 lg:px-16 xl:px-28 flex items-center justify-center rounded-l-lg ">
        <div className="w-full h-100">
          <h1 className="text-3xl font-bold mb-12">Sign-in</h1>
          {/* <button type="button" className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border-2 border-customgreen">
              <div className="flex items-center justify-center">
                  <span className="ml-4 ">Login with Wulab</span>
              </div>
            </button> */}
          {/* <hr className="my-6 border-gray-300 w-full" /> */}
          <form className="mt-6">
            <div>
              <label className="block text-gray-700 text-base"></label>
              <input
                type="text"
                name="username"
                placeholder="Email"
                onChange={handleChange}
                className="text-base w-full px-4 py-3 bg-transparent border-b border-gray-500 focus:outline-none"
                autoFocus
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-base"></label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                minLength="6"
                onChange={handleChange}
                className="text-base w-full px-4 py-3 bg-transparent border-b border-gray-500 focus:outline-none"
                required
              />
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full block bg-[#8AB3B6] hover:bg-[#578082] focus:bg-[#8AB3B6] text-white font-semibold rounded-lg px-4 py-3 mt-6 text-base"
            >
              login
            </button>
          </form>
          <div className="text-center mt-8">
            <p>Don’t have an account?</p>
            <p className="text-blue-500 hover:text-blue-700 font-semibold mt-2">
              <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
