'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { userInfoAtom, UserInfo } from '@/store/userAtom';
import LoadingIndicator from '@/components/LoadingIndicator';

type FormData = {
  username: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
};

interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  info: UserInfo;
}

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();
  const [signupError, setSignupError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUserInfo = useSetAtom(userInfoAtom);

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setSignupError(null);
    try {
      const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
      const host = process.env.NEXT_PUBLIC_API_HOST;
      const url = `${protocol}://${host}/auth/signup/email`;

      const { passwordConfirm, ...submitData } = data;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '회원가입에 실패했습니다.');
      }

      console.log('회원가입 성공:', result);
      
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      setUserInfo(result.info);
      router.push('/');
    } catch (error) {
      console.error('회원가입 에러:', error);
      setSignupError(error instanceof Error ? error.message : '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {isLoading && <LoadingIndicator />}
      <div className="m-auto bg-white rounded-lg shadow-md overflow-hidden max-w-4xl w-full">
        <div className="flex">
          {/* 왼쪽 로그인 안내 */}
          <div className="w-1/2 bg-red-500 text-white p-8 flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-4">Hamkke Study</h2>
            <p className="text-xl mb-8">이미 계정이 있으신가요?</p>
            <Link href="/login" className="border-2 border-white text-white px-6 py-2 rounded-full hover:bg-white hover:text-red-500 transition duration-300">
              로그인
            </Link>
          </div>
          
          {/* 오른쪽 회원가입 폼 */}
          <div className="w-1/2 p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">회원가입</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full p-2 border rounded text-gray-800 ${errors.username ? 'border-red-500' : ''}`}
                  {...register('username', {
                    required: '이메일을 입해주세요',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: '올바른 이메일 형식이 아닙니다',
                    },
                  })}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
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
              <div className="mb-4 relative">
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={`w-full p-2 border rounded text-gray-800 ${errors.passwordConfirm ? 'border-red-500' : ''}`}
                  {...register('passwordConfirm', {
                    required: '비밀번호를 다시 입력해주세요',
                    validate: (value) =>
                      value === password || '비밀번호가 일치하지 않습니다',
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm.message}</p>}
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Nickname"
                  className={`w-full p-2 border rounded text-gray-800 ${errors.nickname ? 'border-red-500' : ''}`}
                  {...register('nickname', {
                    required: '닉네임을 입력해주세요',
                    minLength: {
                      value: 2,
                      message: '닉네임은 최소 2글자 이상이어야 합니다',
                    },
                  })}
                />
                {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>}
              </div>
              {signupError && <p className="text-red-500 text-sm mb-4">{signupError}</p>}
              <button type="submit" className="w-full bg-red-500 text-white p-2 rounded mt-6">
                회원가입
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}