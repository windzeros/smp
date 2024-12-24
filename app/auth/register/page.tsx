'use client'

import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
              <p className="mt-4 text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  로그인
                </Link>
              </p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
