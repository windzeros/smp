'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format, parse, startOfYear, endOfMonth } from 'date-fns'
import { WorkDialog } from './work-dialog'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  night_hours?: number
  late_night_hours?: number
  extra_amount?: number
  memo?: string
}

type WorkTableProps = {
  records?: WorkRecord[]
  onRecordDeleted?: () => void
}

export function WorkTable({ records = [], onRecordDeleted }: WorkTableProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<WorkRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    startYear: currentYear.toString(),
    endMonth: new Date().getMonth() + 1,
    name: '',
    company: '',
    location: '',
  })
  const router = useRouter()
  const { toast } = useToast()

  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.date)
    const startDate = startOfYear(new Date(parseInt(filters.startYear), 0))
    const endDate = endOfMonth(new Date(parseInt(filters.startYear), filters.endMonth - 1))
    
    const dateMatches = recordDate >= startDate && recordDate <= endDate
    const nameMatches = !filters.name || record.name.toLowerCase().includes(filters.name.toLowerCase())
    const companyMatches = !filters.company || record.company.toLowerCase().includes(filters.company.toLowerCase())
    const locationMatches = !filters.location || record.location.toLowerCase().includes(filters.location.toLowerCase())

    return dateMatches && nameMatches && companyMatches && locationMatches
  })

  const exportToExcel = () => {
    try {
      const exportData = filteredRecords.map((record) => ({
        날짜: format(new Date(record.date), 'yyyy-MM-dd'),
        이름: record.name,
        업체: record.company,
        장소: record.location,
        시작: record.start_time,
        종료: record.end_time,
        주간: record.day_hours,
        야간: record.night_hours || 0,
        심야: record.late_night_hours || 0,
        추가금액: record.extra_amount || 0,
        메모: record.memo || '',
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '작업기록')
      XLSX.writeFile(workbook, '작업기록.xlsx')

      toast({
        title: "엑셀 내보내기 성공",
        description: "작업 기록이 성공적으로 엑셀 파일로 저장되었습니다.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "엑셀 내보내기 실패",
        description: "엑셀 파일 생성 중 오류가 발생했습니다.",
      })
    }
  }

  // 합계 계산
  const totals = filteredRecords.reduce(
    (acc, record) => {
      acc.dayHours += record.day_hours || 0
      acc.nightHours += record.night_hours || 0
      acc.lateNightHours += record.late_night_hours || 0
      return acc
    },
    { dayHours: 0, nightHours: 0, lateNightHours: 0 }
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 flex-1">
          <div className="space-y-2">
            <Label>연도</Label>
            <Select
              value={filters.startYear}
              onValueChange={(value) => setFilters({ ...filters, startYear: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="연도 선택" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>월</Label>
            <Select
              value={filters.endMonth.toString()}
              onValueChange={(value) => setFilters({ ...filters, endMonth: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="월 선택" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {month}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameFilter">이름</Label>
            <Input
              id="nameFilter"
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              placeholder="이름으로 검색"
              className="bg-gray-50 border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyFilter">업체</Label>
            <Input
              id="companyFilter"
              type="text"
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              placeholder="업체명으로 검색"
              className="bg-gray-50 border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationFilter">장소</Label>
            <Input
              id="locationFilter"
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="장소로 검색"
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </div>
        <div className="ml-4 self-end">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            onClick={exportToExcel}
          >
            엑셀로 내보내기
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        총 {filteredRecords.length}개의 기록
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>업체</TableHead>
              <TableHead>장소</TableHead>
              <TableHead>시작</TableHead>
              <TableHead>종료</TableHead>
              <TableHead>주간</TableHead>
              <TableHead>야간</TableHead>
              <TableHead>심야</TableHead>
              <TableHead>추가금액</TableHead>
              <TableHead>메모</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{format(new Date(record.date), 'yyyy-MM-dd')}</TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.company}</TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>{record.start_time}</TableCell>
                <TableCell>{record.end_time}</TableCell>
                <TableCell>{record.day_hours}</TableCell>
                <TableCell>{record.night_hours || '-'}</TableCell>
                <TableCell>{record.late_night_hours || '-'}</TableCell>
                <TableCell>{record.extra_amount ? `${record.extra_amount.toLocaleString()}원` : '-'}</TableCell>
                <TableCell>{record.memo || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRecordClick(record)}
                    >
                      수정
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={isLoading}
                        >
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>작업 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업을 삭제하시겠습니까? 이 작업은 영구적으로 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(record.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                          >
                            {isLoading ? '삭제 중...' : '삭제'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} className="text-right font-medium">
                합계
              </TableCell>
              <TableCell className="font-medium">{totals.dayHours}</TableCell>
              <TableCell className="font-medium">{totals.nightHours}</TableCell>
              <TableCell className="font-medium">{totals.lateNightHours}</TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <WorkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={selectedRecord}
      />
    </div>
  )
}
