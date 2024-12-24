'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WorkTable } from '@/components/work/work-table'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { Navbar } from '@/components/layout/navbar'

export default function WorkPage() {
  const [records, setRecords] = useState([])
  const { toast } = useToast()
  const channelRef = useRef(null)

  const fetchRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('work_records')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching records:', error)
        return
      }

      if (data) {
        setRecords(data)
      }
    } catch (error) {
      console.error('Error in fetchRecords:', error)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  useEffect(() => {
    // 이전 구독이 있다면 정리
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    // 새로운 구독 설정
    const channel = supabase.channel('any')
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_records'
        },
        () => {
          fetchRecords()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to changes')
        }
      })

    // 현재 채널 저장
    channelRef.current = channel

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [fetchRecords])

  const exportToExcel = () => {
    try {
      const exportData = records.map((record) => ({
        날짜: format(new Date(record.date), 'yyyy-MM-dd'),
        이름: record.name,
        업체: record.company,
        장소: record.location,
        시작시간: record.start_time,
        종료시간: record.end_time,
        주간작업시간: record.day_hours,
        야간작업시간: record.night_hours || 0,
        심야작업시간: record.late_night_hours || 0,
        추가금액: record.extra_amount || 0,
        메모: record.memo || '',
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '작업기록')

      const fileName = `작업기록_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast({
        title: '엑셀 내보내기 완료',
        description: '작업 기록이 엑셀 파일로 저장되었습니다.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '엑셀 내보내기 실패',
        description: '파일 생성 중 오류가 발생했습니다.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl space-y-8">
          <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">작업 관리</h1>
            <div className="flex gap-4">
              <Link href="/work/input">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  작업 등록
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <WorkTable 
              records={records} 
              onRecordDeleted={fetchRecords} 
              exportToExcel={exportToExcel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
