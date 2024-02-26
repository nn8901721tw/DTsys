import React, {useState, useContext} from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { userRegister } from '../../api/users';
import { AuthContext } from '../../utils/AuthContext';
import Swal from 'sweetalert2';

export default function Register() {
    const [userData, setUserData] = useState({role:"student"});
    const [userContext, setUserContext] = useContext(AuthContext);
    const [ error, setError ] = useState("");
    const navigate = useNavigate();
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    const handleChange = e =>{
        const { name, value } = e.target
        setUserData( prev => ({
            ...prev,
            [name]:value
        }));
    }

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
            setUserContext(prev => ({
                ...prev,
                username: res.data.username,
                id: res.data.id,
                accessToken: res.data.accessToken,
            }));
            navigate("/");
            // 成功註冊時彈出 SweetAlert 提示
            Swal.fire({
                icon: 'success',
                title: '註冊成功！',
                text: '您已成功註冊！',
                confirmButtonText: '確定'
            });
        },
        onError: (err) => {
            console.log(err);
            if (err.response && err.response.status === 400 && err.response.data && err.response.data.message === '該用戶已存在，請嘗試其他用戶名稱。') {
                // 如果用戶已存在，顯示相應的 SweetAlert 提示
                Swal.fire({
                    icon: 'error',
                    title: '註冊失敗',
                    text: '該用戶已存在，請嘗試其他用戶名稱。',
                    confirmButtonText: '確定'
                });
            } else {
                setError("帳號或密碼錯誤");
                // 其他錯誤情況下，顯示一般的錯誤提示
                Swal.fire({
                    icon: 'error',
                    title: '註冊失敗',
                    text: '請檢查您的帳號或密碼！',
                    confirmButtonText: '確定'
                });
            }
        }
    });

    const handleSubmit = (e) =>{
        e.preventDefault()
        setIsFormSubmitted(true);
        validateInput();
        if (!error) {
            userRegisterMutation.mutate(userData);
        }
    };
    return (
        <section className="flex flex-col md:flex-row h-screen items-center">
           
                <p className="mt-8">
                NICE    
              
                </p>

    </section>
    )
}
