'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WorkFilterProps {
  onFilterChange: (filters: {
    startDate: string
    endDate: string
    name: string
    company: string
  }) => void
}

export function WorkFilter({ onFilterChange }: WorkFilterProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [names, setNames] = useState<string[]>([])
  const [companies, setCompanies] = useState<string[]>([])

  useEffect(() => {
    // 작업자 이름과 업체명 목록을 가져옵니다
    const fetchOptions = async () => {
      const { data: namesData } = await supabase
        .from('work_records')
        .select('name')
        .order('name')

      const { data: companiesData } = await supabase
        .from('work_records')
        .select('company')
        .order('company')

      if (namesData) {
        const uniqueNames = Array.from(
          new Set(namesData.map((item) => item.name))
        )
        setNames(uniqueNames)
      }

      if (companiesData) {
        const uniqueCompanies = Array.from(
          new Set(companiesData.map((item) => item.company))
        )
        setCompanies(uniqueCompanies)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    onFilterChange({
      startDate,
      endDate,
      name,
      company,
    })
  }, [startDate, endDate, name, company, onFilterChange])

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>시작 날짜</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>종료 날짜</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>작업자</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          >
            <option value="">전체</option>
            {names.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>업체</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          >
            <option value="">전체</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            setStartDate('')
            setEndDate('')
            setName('')
            setCompany('')
          }}
        >
          초기화
        </Button>
      </div>
    </div>
  )
}
