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
    } 
    // else if (
    //   !userData.username ||
    //   userData.username.length < 6 ||
    //   userData.username.length > 20
    // ) {
    //   setError("帳號長度應為6-20個字符");
    // } else if (!/^[A-Za-z0-9]+$/.test(userData.username)) {
    //   setError("帳號只能包含字母、數字");
    // } else if (!/^[A-Za-z]/.test(userData.username)) {
    //   setError("帳號必須以字母開頭");
    // } else if (!userData.password || userData.password.length < 8) {
    //   setError("密碼長度至少為8個字符");
    // } else if (
    //   !/\d/.test(userData.password) ||
    //   !/[A-Z]/i.test(userData.password) ||
    //   !/[^A-Za-z0-9]/.test(userData.password)
    // ) {
    //   setError("密碼必須包含字母、數字及特殊字符");
    // } else {
    //   setError("");
    // }
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
      <img src="/images/nlt_logo.png" className="absolute w-4 left-2 top-4" />
          <h3 className="absolute left-8 top-3 font-bold text-teal-900">
            國立中央大學 網路學習科技研究所
          </h3>
      <div className="hidden bg-[#AFCACC] w-full md:w-1/2 xl:w-1/2 h-screen md:flex md:items-center md:justify-center">
        <div className="flex flex-col -m-56">
          <h1 className=" md:mx-auto md:text-2xl xl:text-5xl xl:font-semibold mx-auto text-gray-200  mb-2">
            <span className=" text-teal-900">Design Thinking</span> <br />
            System
          </h1>

          <Lottie
            className="xl:w-72 2xl:w-96 mx-auto mt-10"
            animationData={login1}
          />
        </div>
      </div>

      {/* -------------------------------- */}

      <div className=" bg-[#FCFAF8] w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/2 h-screen px-6 lg:px-20 xl:px-28 flex items-center justify-center rounded-l-lg">
        <div className="w-full h-100">
          <h1 className="text-3xl font-bold mb-12">註冊</h1>
          <form className="mt-6">
            <div>
              <input
                type="text"
                name="username"
                placeholder="帳號"
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
                placeholder="密碼"
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
                placeholder="確認密碼"
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
                placeholder="暱稱"
                minLength="6"
                onChange={handleChange}
                className="text-base w-full px-4 py-4 bg-transparent border-b border-gray-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <select
                name="role"
                onChange={handleChange}
                value={userData.role}
                className="w-full px-4 py-4 bg-transparent border-b border-gray-500 focus:outline-none text-base"
                required
              >
                <option value="student">學生</option>
                <option value="teacher">教師</option>
              </select>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full block bg-[#8AB3B6] hover:bg-[#578082] focus:bg-[#8AB3B6] text-white font-semibold rounded-lgpx-4 py-3 mt-6 text-base rounded-lg"
            >
              創建
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
