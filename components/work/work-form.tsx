'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const workFormSchema = z.object({
  date: z.date({
    required_error: "작업 날짜를 선택해주세요.",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "올바른 시간 형식을 입력해주세요. (예: 09:00)",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "올바른 시간 형식을 입력해주세요. (예: 18:00)",
  }),
  description: z.string().min(1, {
    message: "작업 내용을 입력해주세요.",
  }),
})

type WorkFormValues = z.infer<typeof workFormSchema>

const defaultValues: Partial<WorkFormValues> = {
  date: new Date(),
  startTime: "09:00",
  endTime: "18:00",
  description: "",
}

export function WorkForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues,
  })

  async function onSubmit(data: WorkFormValues) {
    setIsLoading(true)

    try {
      const { error } = await supabase.from('works').insert({
        date: format(data.date, 'yyyy-MM-dd'),
        start_time: data.startTime,
        end_time: data.endTime,
        description: data.description,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "작업 등록 실패",
          description: error.message,
        })
      } else {
        form.reset()
        router.refresh()
        toast({
          title: "작업 등록 완료",
          description: "작업이 성공적으로 등록되었습니다.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "작업 등록 실패",
        description: "작업 등록 중 오류가 발생했습니다.",
      })
    }

    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>작업 날짜</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "yyyy년 MM월 dd일")
                      ) : (
                        <span>날짜를 선택하세요</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2000-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작 시간</FormLabel>
                <FormControl>
                  <Input placeholder="09:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>종료 시간</FormLabel>
                <FormControl>
                  <Input placeholder="18:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>작업 내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="작업 내용을 입력하세요"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          작업 등록
        </Button>
      </form>
    </Form>
  )
}
