'use client'

import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
              <p className="mt-4 text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                  회원가입
                </Link>
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
