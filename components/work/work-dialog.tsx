'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

type WorkRecord = {
  id: string
  date: string
  name: string
  company: string
  location: string
  start_time: string
  end_time: string
  day_hours: number
  night_hours?: number
  late_night_hours?: number
  extra_amount?: number
  memo?: string
}

interface WorkDialogProps {
  record: WorkRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkDialog({ record, open, onOpenChange }: WorkDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const data = {
        date: formData.get('date') as string,
        name: formData.get('name') as string,
        company: formData.get('company') as string,
        location: formData.get('location') as string,
        start_time: formData.get('start_time') as string,
        end_time: formData.get('end_time') as string,
        day_hours: Number(formData.get('day_hours')) || 0,
        night_hours: Number(formData.get('night_hours')) || 0,
        late_night_hours: Number(formData.get('late_night_hours')) || 0,
        extra_amount: Number(formData.get('extra_amount')) || 0,
        memo: formData.get('memo') as string || '',
      }

      let error
      if (record) {
        const { error: updateError } = await supabase
          .from('work_records')
          .update(data)
          .eq('id', record.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('work_records')
          .insert([data])
        error = insertError
      }

      if (error) {
        toast({
          variant: 'destructive',
          title: record ? '작업 기록 수정 실패' : '작업 기록 추가 실패',
          description: error.message,
        })
      } else {
        toast({
          title: record ? '작업 기록 수정 성공' : '작업 기록 추가 성공',
          description: record
            ? '작업 기록이 성공적으로 수정되었습니다.'
            : '작업 기록이 성공적으로 추가되었습니다.',
        })
        router.refresh()
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: record ? '작업 기록 수정 실패' : '작업 기록 추가 실패',
        description: '오류가 발생했습니다.',
      })
    }

    setIsLoading(false)
  }

  async function onDelete() {
    if (!record) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('work_records')
        .delete()
        .eq('id', record.id)

      if (error) {
        toast({
          variant: 'destructive',
          title: '작업 기록 삭제 실패',
          description: error.message,
        })
      } else {
        toast({
          title: '작업 기록 삭제 성공',
          description: '작업 기록이 성공적으로 삭제되었습니다.',
        })
        router.refresh()
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '작업 기록 삭제 실패',
        description: '오류가 발생했습니다.',
      })
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? '작업 기록 수정' : '작업 기록 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={record?.date}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="name">작업자 이름</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={record?.name}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="company">업체명</Label>
            <Input
              id="company"
              name="company"
              type="text"
              defaultValue={record?.company}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="location">작업 장소</Label>
            <Input
              id="location"
              name="location"
              type="text"
              defaultValue={record?.location}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label htmlFor="start_time">시작 시간</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={record?.start_time}
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="end_time">종료 시간</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={record?.end_time}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1">
              <Label htmlFor="day_hours">주간 작업시간</Label>
              <Input
                id="day_hours"
                name="day_hours"
                type="number"
                step="0.1"
                min="0"
                defaultValue={record?.day_hours}
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="night_hours">야간 작업시간</Label>
              <Input
                id="night_hours"
                name="night_hours"
                type="number"
                step="0.1"
                min="0"
                defaultValue={record?.night_hours}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="late_night_hours">심야 작업시간</Label>
              <Input
                id="late_night_hours"
                name="late_night_hours"
                type="number"
                step="0.1"
                min="0"
                defaultValue={record?.late_night_hours}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="extra_amount">추가 금액</Label>
            <Input
              id="extra_amount"
              name="extra_amount"
              type="number"
              min="0"
              defaultValue={record?.extra_amount}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              name="memo"
              defaultValue={record?.memo}
              disabled={isLoading}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {record ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
