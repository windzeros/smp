'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      }
    }
    checkUser()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">관리 시스템</h1>
          <p className="text-lg text-gray-600">작업 및 세무 관리를 위한 통합 시스템입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>작업 관리</CardTitle>
              <CardDescription>
                작업 기록을 관리하고 엑셀로 내보낼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/work')}
              >
                작업 관리로 이동
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>세무 관리</CardTitle>
              <CardDescription>
                세무 관련 정보를 관리하고 조회할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => router.push('/tax')}
              >
                세무 관리로 이동
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
