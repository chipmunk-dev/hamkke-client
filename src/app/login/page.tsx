'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import { SiNaver, SiKakao } from 'react-icons/si';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { userInfoAtom, UserInfo } from '@/store/userAtom';
import LoadingIndicator from '@/components/LoadingIndicator';

type FormData = {
  email: string;
  password: string;
};

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  info: UserInfo;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUserInfo = useSetAtom(userInfoAtom);

  useEffect(() => {
    // URL에서 로그인 데이터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const loginData = urlParams.get('loginData');
    
    if (loginData) {
      try {
        const data = JSON.parse(decodeURIComponent(loginData));
        handleLoginSuccess(data);
      } catch (error) {
        console.error('Failed to parse login data', error);
        setLoginError('로그인 처리 중 오류가 발생했습니다.');
      }
    }
  }, []);

  const handleLoginSuccess = (data: { accessToken: string; refreshToken: string; info: UserInfo }) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUserInfo(data.info);
    router.push('/');
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
      const host = process.env.NEXT_PUBLIC_API_HOST;
      const url = `${protocol}://${host}/auth/login/email`;

      // 서버로 보낼 데이터 구조 변경
      const serverData = {
        username: data.email,
        password: data.password
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverData),
      });

      if (!response.ok) {
        throw new Error('로그인에 실패했습니다.');
      }

      const result: LoginResponse = await response.json();
      console.log('로그인 성공:', result);
      
      // 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      // 사용자 정보를 Jotai 아톰에 저장
      setUserInfo(result.info);
      
      // 홈으로 이동
      router.push('/');
    } catch (error) {
      console.error('로그인 에러:', error);
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
    const host = process.env.NEXT_PUBLIC_API_HOST;
    const googleAuthUrl = `${protocol}://${host}/auth/google`;
    
    // 현재 페이지에서 구글 로그인 페이지로 이동
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {isLoading && <LoadingIndicator />}
      <div className="m-auto bg-white rounded-lg shadow-md overflow-hidden max-w-4xl w-full">
        <div className="flex">
          {/* 왼쪽 로그인 폼 */}
          <div className="w-1/2 p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">로그인</h2>
            <div className="flex justify-center space-x-4 mb-6">
              <button 
                className="p-2 border rounded-full"
                onClick={handleGoogleLogin}
              >
                <FaGoogle className="w-6 h-6 text-red-500" />
                <span className="sr-only">구글</span>
              </button>
              <button className="p-2 border rounded-full">
                <SiNaver className="w-6 h-6 text-green-500" />
                <span className="sr-only">네이버</span>
              </button>
              <button className="p-2 border rounded-full">
                <SiKakao className="w-6 h-6 text-yellow-400" />
                <span className="sr-only">카카오</span>
              </button>
              <button className="p-2 border rounded-full">
                <FaFacebook className="w-6 h-6 text-blue-600" />
                <span className="sr-only">페이스북</span>
              </button>
            </div>
            <p className="text-center text-sm mb-6 text-gray-600">or use your account</p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full p-2 border rounded text-gray-800 ${errors.email ? 'border-red-500' : ''}`}
                  {...register('email', {
                    required: '이메일을 입력해주세요',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: '올바른 이메일 형식이 아닙니다',
                    },
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`w-full p-2 border rounded text-gray-800 ${errors.password ? 'border-red-500' : ''}`}
                  {...register('password', {
                    required: '비밀번호를 입력해주세요',
                    minLength: {
                      value: 6,
                      message: '비밀번호는 최소 6자 이상이어야 합니다',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                      message: '비밀번호는 대문자 1글자와 특수문자 1글자 이상을 포함해야 합니다',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:underline">
                Forgot your password?
              </Link>
              <button type="submit" className="w-full bg-red-500 text-white p-2 rounded mt-6">
                로그인
              </button>
            </form>
          </div>
          
          {/* 오른쪽 회원가입 안내 */}
          <div className="w-1/2 bg-red-500 text-white p-8 flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-4">Hamkke Study</h2>
            <p className="text-xl mb-8">당신의 소중한 동료를 모집해보세요!</p>
            <Link href="/signup" className="border-2 border-white text-white px-6 py-2 rounded-full hover:bg-white hover:text-red-500 transition duration-300">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}