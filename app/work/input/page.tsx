'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

export default function WorkInputPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      const workRecord = {
        user_id: user.id,
        date: formData.get('date'),
        name: formData.get('name'),
        company: formData.get('company'),
        location: formData.get('location'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
        day_hours: parseInt(formData.get('day_hours') as string) || 0,
        night_hours: formData.get('night_hours') ? parseInt(formData.get('night_hours') as string) : null,
        late_night_hours: formData.get('late_night_hours') ? parseInt(formData.get('late_night_hours') as string) : null,
        extra_amount: formData.get('extra_amount') ? parseInt(formData.get('extra_amount') as string) : null,
        memo: formData.get('memo') || null,
      }

      const { error } = await supabase
        .from('work_records')
        .insert([workRecord])

      if (error) {
        console.error('Error details:', error)
        throw error
      }

      toast({
        title: '작업 등록 완료',
        description: '작업이 성공적으로 등록되었습니다.',
      })

      router.push('/work')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: 'destructive',
        title: '작업 등록 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">작업 등록</h1>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-700">날짜</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">이름</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    disabled={isLoading}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-700">업체</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    disabled={isLoading}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700">장소</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    disabled={isLoading}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-gray-700">시작 시간</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="time"
                    defaultValue="08:30"
                    disabled={isLoading}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time" className="text-gray-700">종료 시간</Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="time"
                    defaultValue="17:30"
                    disabled={isLoading}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="day_hours" className="text-gray-700">주간 작업시간</Label>
                  <Input
                    id="day_hours"
                    name="day_hours"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="예) 8"
                    disabled={isLoading}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="night_hours" className="text-gray-700">야간 작업시간</Label>
                  <Input
                    id="night_hours"
                    name="night_hours"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="예) 2"
                    disabled={isLoading}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late_night_hours" className="text-gray-700">심야 작업시간</Label>
                  <Input
                    id="late_night_hours"
                    name="late_night_hours"
                    type="number"
                    step="1"
                    min="0"
                    disabled={isLoading}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extra_amount" className="text-gray-700">추가 금액</Label>
                <Input
                  id="extra_amount"
                  name="extra_amount"
                  type="number"
                  min="0"
                  disabled={isLoading}
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo" className="text-gray-700">메모</Label>
                <Textarea
                  id="memo"
                  name="memo"
                  disabled={isLoading}
                  rows={3}
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/work')}
                  disabled={isLoading}
                  size="lg"
                  className="px-8 border-gray-200 hover:bg-gray-50"
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  size="lg" 
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? '등록 중...' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
