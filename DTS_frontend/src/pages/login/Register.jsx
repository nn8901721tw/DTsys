import React, { useState, useContext } from "react";
import { TypeAnimation } from "react-type-animation";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { userRegister } from "../../api/users";
import { AuthContext } from "../../utils/AuthContext";
import Swal from "sweetalert2";
import login1 from "../../assets/login1.json";
import Lottie from "lottie-react";

export default function Register() {
  const [userData, setUserData] = useState({ role: "student" });
  const [userContext, setUserContext] = useContext(AuthContext);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateInput = () => {
    if (isFormSubmitted && !userData.confirmPassword) {
      setError("請確認密碼");
    } else if (userData.confirmPassword !== userData.password) {
      setError("密碼不相符");
    } else {
      setError("");
    }
  };

  const userRegisterMutation = useMutation(userRegister, {
    onSuccess: (res) => {
      console.log(res);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("id", res.data.id);
      localStorage.setItem("nickname", res.data.nickname);
      setUserContext((prev) => ({
        ...prev,
        username: res.data.username,
        id: res.data.id,
        accessToken: res.data.accessToken,
      }));
      navigate("/");
      // 成功註冊時彈出 SweetAlert 提示
      Swal.fire({
        icon: "success",
        title: "註冊成功！",
        text: "您已成功註冊！",
        confirmButtonText: "確定",
      });
    },
    onError: (err) => {
      console.log(err);
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data &&
        err.response.data.message === "該用戶已存在，請嘗試其他用戶名稱。"
      ) {
        // 如果用戶已存在，顯示相應的 SweetAlert 提示
        Swal.fire({
          icon: "error",
          title: "註冊失敗",
          text: "該用戶已存在，請嘗試其他用戶名稱。",
          confirmButtonText: "確定",
        });
      } else {
        setError("帳號或密碼錯誤");
        // 其他錯誤情況下，顯示一般的錯誤提示
        Swal.fire({
          icon: "error",
          title: "註冊失敗",
          text: "請檢查您的帳號或密碼！",
          confirmButtonText: "確定",
        });
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    validateInput();
    if (!error) {
      userRegisterMutation.mutate(userData);
    }
  };
  return (
    <section className="flex flex-col md:flex-row h-screen items-center">
      <div className="hidden bg-[#AFCACC] w-full md:w-1/2 xl:w-1/2 h-screen md:flex md:items-center md:justify-center">
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
          {/* <h1 className='text-white text-2xl font-press-start mt-2'>self-directed Learning</h1> */}

          <Lottie
            className="xl:w-72 2xl:w-96 mx-auto mt-10"
            animationData={login1}
          />
          {/* <img src="/images/design-thinking.png"className="w-48 mx-auto mt-10" /> */}
        </div>
      </div>

      {/* -------------------------------- */}

      <div className=" bg-[#FCFAF8] w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/2 h-screen px-6 lg:px-20 xl:px-28 flex items-center justify-center rounded-l-lg">
        <div className="w-full h-100">
          <h1 className="text-3xl font-bold mb-12">Sign-up</h1>
          {/* <button type="button" className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border-2 border-customgreen">
                    <div className="flex items-center justify-center">
                        <span className="ml-4 ">Google</span>
                    </div>
                    
                </button> */}
          {/* <hr className="my-6 border-gray-300 w-full" /> */}
          <form className="mt-6">
            <div>
              <input
                type="text"
                name="username"
                placeholder="account"
                onChange={handleChange}
                className="text-base w-full px-4 py-4 bg-transparent border-b border-gray-500 focus:outline-none"
                autoFocus
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="password"
                minLength="6"
                onChange={handleChange}
                className="text-base w-full px-4 py-4 bg-transparent border-b border-gray-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="confirm password"
                minLength="6"
                onChange={handleChange}
                onBlur={validateInput}
                className="text-base w-full px-4 py-4 bg-transparent border-b border-gray-500 focus:outline-none"
                required
              />
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
            <div>
              <input
                type="accound"
                name="nickname"
                placeholder="nickname"
                minLength="6"
                onChange={handleChange}
      
                className="text-base w-full px-4 py-4 bg-transparent border-b border-gray-500 focus:outline-none"
                required
              />
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full block bg-[#8AB3B6] hover:bg-[#578082] focus:bg-[#8AB3B6] text-white font-semibold rounded-lgpx-4 py-3 mt-6 text-base rounded-lg"
            >
              Creat
            </button>
          </form>
          <p className="mt-8">
            Already have an account?
            <span className="text-blue-500 hover:text-blue-700 font-semibold">
              <Link to="/"> Login</Link>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
