import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export function Navbar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Button
              variant="ghost"
              className="text-xl font-bold text-gray-900"
              onClick={() => router.push('/')}
            >
              SMP 관리 시스템
            </Button>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/work')}
                className="text-gray-900 text-sm font-medium"
              >
                작업 관리
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/tax')}
                className="text-gray-900 text-sm font-medium"
              >
                세무 관리
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-900"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
