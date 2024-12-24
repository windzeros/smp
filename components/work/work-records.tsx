'use client'

import { useEffect, useState } from 'react'
import { format, parse } from 'date-fns'
import { ko } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type WorkRecord = {
  id: string
  date: string
  name: string
  company: string
  location: string
  start_time: string
  end_time: string
  day_hours: number
  night_hours: number
  late_night_hours: number
  extra_amount: number
  memo: string
  created_at: string
}

export function WorkRecords() {
  const [records, setRecords] = useState<WorkRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<WorkRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>("_all")
  const [selectedName, setSelectedName] = useState<string>("_all")
  const [selectedCompany, setSelectedCompany] = useState<string>("_all")
  const [months, setMonths] = useState<string[]>([])
  const [names, setNames] = useState<string[]>([])
  const [companies, setCompanies] = useState<string[]>([])

  useEffect(() => {
    async function fetchRecords() {
      try {
        const { data, error } = await supabase
          .from('work_records')
          .select('*')
          .order('date', { ascending: false })

        if (error) {
          throw error
        }

        setRecords(data || [])
        
        // 월별, 이름, 업체 목록 추출
        const uniqueMonths = Array.from(new Set(data?.map(record => 
          format(new Date(record.date), 'yyyy년 MM월', { locale: ko })
        ))).sort().reverse()
        
        const uniqueNames = Array.from(new Set(data?.map(record => record.name))).sort()
        const uniqueCompanies = Array.from(new Set(data?.map(record => record.company))).sort()

        setMonths(uniqueMonths)
        setNames(uniqueNames)
        setCompanies(uniqueCompanies)
        setFilteredRecords(data || [])
      } catch (error) {
        console.error('Error fetching records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [])

  useEffect(() => {
    let filtered = [...records]

    if (selectedMonth && selectedMonth !== "_all") {
      filtered = filtered.filter(record => 
        format(new Date(record.date), 'yyyy년 MM월', { locale: ko }) === selectedMonth
      )
    }

    if (selectedName && selectedName !== "_all") {
      filtered = filtered.filter(record => record.name === selectedName)
    }

    if (selectedCompany && selectedCompany !== "_all") {
      filtered = filtered.filter(record => record.company === selectedCompany)
    }

    setFilteredRecords(filtered)
  }, [records, selectedMonth, selectedName, selectedCompany])

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200">
              <SelectValue placeholder="월 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">전체</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={selectedName}
            onValueChange={setSelectedName}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200">
              <SelectValue placeholder="이름 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">전체</SelectItem>
              {names.map(name => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={selectedCompany}
            onValueChange={setSelectedCompany}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200">
              <SelectValue placeholder="업체 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">전체</SelectItem>
              {companies.map(company => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">날짜</TableHead>
              <TableHead className="font-semibold">이름</TableHead>
              <TableHead className="font-semibold">업체</TableHead>
              <TableHead className="font-semibold">장소</TableHead>
              <TableHead className="font-semibold">시작</TableHead>
              <TableHead className="font-semibold">종료</TableHead>
              <TableHead className="font-semibold">주간</TableHead>
              <TableHead className="font-semibold">야간</TableHead>
              <TableHead className="font-semibold">심야</TableHead>
              <TableHead className="font-semibold">추가금액</TableHead>
              <TableHead className="font-semibold">메모</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{format(new Date(record.date), 'yyyy년 MM월 dd일', { locale: ko })}</TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.company}</TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>{record.start_time}</TableCell>
                <TableCell>{record.end_time}</TableCell>
                <TableCell>{record.day_hours}</TableCell>
                <TableCell>{record.night_hours || '-'}</TableCell>
                <TableCell>{record.late_night_hours || '-'}</TableCell>
                <TableCell>{record.extra_amount ? `${record.extra_amount.toLocaleString()}원` : '-'}</TableCell>
                <TableCell className="max-w-xs truncate">{record.memo || '-'}</TableCell>
              </TableRow>
            ))}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="h-32 text-center text-gray-500">
                  등록된 작업이 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
