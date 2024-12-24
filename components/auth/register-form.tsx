'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'

const formSchema = z.object({
  email: z.string().email({
    message: '유효한 이메일을 입력하세요.',
  }),
  password: z.string().min(6, {
    message: '비밀번호는 최소 6자 이상이어야 합니다.',
  }),
  approvalCode: z.string().min(1, {
    message: '승인 코드를 입력하세요.',
  }),
})

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      approvalCode: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // 승인 코드 확인
      const { data: codeData, error: codeError } = await supabase
        .from('approval_codes')
        .select('*')
        .eq('code', values.approvalCode)
        .eq('is_active', true)
        .is('used_at', null)
        .single()

      if (codeError || !codeData) {
        throw new Error('유효하지 않은 승인 코드입니다.')
      }

      // 회원가입
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (signUpError) {
        throw signUpError
      }

      // 승인 코드 사용 처리
      const { error: updateError } = await supabase
        .from('approval_codes')
        .update({ 
          used_at: new Date().toISOString(),
          is_active: false 
        })
        .eq('id', codeData.id)

      if (updateError) {
        throw updateError
      }

      toast({
        title: '회원가입 완료',
        description: '회원가입이 완료되었습니다. 로그인해주세요.',
      })
      
      router.push('/auth/login')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '회원가입 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      })
    }

    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  placeholder="name@example.com"
                  type="email"
                  className="bg-gray-50 border-gray-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  placeholder="6자 이상 입력하세요"
                  type="password"
                  className="bg-gray-50 border-gray-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approvalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>승인 코드</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  placeholder="관리자에게 받은 승인 코드를 입력하세요"
                  type="text"
                  className="bg-gray-50 border-gray-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '회원가입'}
        </Button>
      </form>
    </Form>
  )
}
