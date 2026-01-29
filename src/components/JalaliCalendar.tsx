import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  getDay,
  addMonths,
  subMonths,
  isSameDay
} from 'date-fns-jalali'
import { parseJalaliString, formatJalaliString } from '../utils/dateHelpers'
import { faIR } from 'date-fns-jalali/locale'

interface JalaliCalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  transactionDates: string[]
}

export function JalaliCalendar({ selectedDate, onDateSelect, transactionDates }: JalaliCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => parseJalaliString(selectedDate))

  // شنبه = 0، یکشنبه = 1، ...، جمعه = 6
  const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // تبدیل روز هفته میلادی به شمسی
  // getDay میلادی: 0=یکشنبه، 1=دوشنبه، ..., 6=شنبه
  // ما می‌خوایم: 0=شنبه، 1=یکشنبه، ..., 6=جمعه
  const gregorianDay = getDay(monthStart) // 0-6 (یکشنبه تا شنبه)
  const startDayOfWeek = (gregorianDay + 1) % 7 // تبدیل به شنبه=0

  const calendarDays = []
  
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  daysInMonth.forEach(day => {
    calendarDays.push(day)
  })

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const hasTransaction = (date: Date) => {
    const dateStr = formatJalaliString(date)
    // همچنین چک کنیم با فرمت‌های مختلف
    return transactionDates.some(d => {
      // نرمال کردن فرمت (حذف صفرهای اضافه)
      const normalized1 = dateStr.replace(/\b0+(\d)/g, '$1')
      const normalized2 = d.replace(/\b0+(\d)/g, '$1')
      return normalized1 === normalized2 || dateStr === d
    })
  }

  const isSelected = (date: Date) => {
    const dateStr = formatJalaliString(date)
    const normalized1 = dateStr.replace(/\b0+(\d)/g, '$1')
    const normalized2 = selectedDate.replace(/\b0+(\d)/g, '$1')
    return normalized1 === normalized2 || dateStr === selectedDate
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  return (
    <div className="bg-gray-800 rounded-lg mx-auto shadow-sm p-4 max-w-96">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 text-white">
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
          aria-label="ماه بعد"
        >
          <ChevronRight size={20} />
        </button>
        
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy', {locale: faIR})}
        </h3>
        
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
          aria-label="ماه قبل"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {persianDays.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const hasTransactionFlag = hasTransaction(day)
          const isSelectedFlag = isSelected(day)
          const isTodayFlag = isToday(day)
          const dayNumber = format(day, 'd')

          return (
            <button
              key={index}
              onClick={() => onDateSelect(formatJalaliString(day))}
              className={`
                aspect-square rounded-lg text-sm font-medium transition relative
                flex items-center justify-center
                ${isSelectedFlag 
                  ? 'bg-blue-600 text-gray-900 shadow-md' 
                  : isTodayFlag
                  ? 'bg-blue-100 text-blue-900 border-2 border-blue-600'
                  : 'hover:bg-gray-800 text-gray-100'
                }
              `}
            >
              {dayNumber}
              {hasTransactionFlag && !isSelectedFlag && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
              )}
              {hasTransactionFlag && isSelectedFlag && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span>دارای معامله</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-600 rounded"></div>
          <span>امروز</span>
        </div>
      </div>
    </div>
  )
}