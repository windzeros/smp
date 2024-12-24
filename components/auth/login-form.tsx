'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/components/ui/use-toast'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/work')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: 'destructive',
        title: '로그인 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      })
    }

    setIsLoading(false)
  }

  async function onGithubLogin() {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "GitHub 로그인 실패",
          description: error.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "GitHub 로그인 실패",
        description: "로그인 중 오류가 발생했습니다.",
      })
    }

    setIsLoading(false)
  }

  async function onGoogleLogin() {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Google 로그인 실패",
          description: error.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google 로그인 실패",
        description: "로그인 중 오류가 발생했습니다.",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            로그인
          </Button>
        </div>
      </form>
      <div className="text-sm text-muted-foreground text-center">
        계정이 없으신가요?{' '}
        <Link
          href="/auth/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          회원가입
        </Link>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            또는
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={onGoogleLogin}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          Google로 로그인
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={onGithubLogin}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub로 로그인
        </Button>
      </div>
    </div>
  )
}
