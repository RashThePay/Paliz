import { format, parse } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

/**
 * تبدیل string تاریخ فارسی به Date object
 * مثال: "1404/11/05" -> Date object
 */
export function parseJalaliString(dateStr: string): Date {
    try {
        // نرمال کردن فرمت (اضافه کردن صفرهای اول)
        const parts = dateStr.split('/')
        const normalized = parts.map((p, i) => {
            // سال 4 رقم، ماه و روز 2 رقم
            const len = i === 0 ? 4 : 2
            return p.padStart(len, '0')
        }).join('/')

        return parse(normalized, 'yyyy/MM/dd', new Date())
    } catch {
        return new Date()
    }
}

/**
 * تبدیل Date object به string تاریخ فارسی
 * مثال: Date object -> "1404/11/07"
 */
export function formatJalaliString(date: Date): string {
    return format(date, 'yyyy/MM/dd', { locale: faIR })
}

/**
 * گرفتن تاریخ امروز به فرمت فارسی
 */
export function getTodayJalali(): string {
    return formatJalaliString(new Date())
}

/**
 * نرمال کردن تاریخ (برای مقایسه)
 * "1404/1/5" -> "1404/01/05"
 */
export function normalizeJalaliDate(dateStr: string): string {
    const parts = dateStr.split('/')
    return parts.map((p, i) => {
        const len = i === 0 ? 4 : 2
        return  faToEn(p).padStart(len, '0')
    }).join('/')
}

export function faToEn(dateStr: string): string {
    const latin = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
    return dateStr.replace(/([۰-۹]){1}/g, (str) => {return latin.indexOf(str).toString() })
    
}