# 💼 سیستم مدیریت معاملات (Transaction PWA)

یک اپلیکیشن Progressive Web App برای مدیریت معاملات روزانه با قابلیت‌های پیشرفته و رابط کاربری فارسی.

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6.2-3178c6.svg)
![Supabase](https://img.shields.io/badge/supabase-latest-3ecf8e.svg)

---

## 📋 فهرست مطالب

- [ویژگی‌های اصلی](#ویژگی‌های-اصلی)
- [تکنولوژی‌های استفاده شده](#تکنولوژی‌های-استفاده-شده)
- [پیش‌نیازها](#پیشنیازها)
- [نصب و راه‌اندازی](#نصب-و-راهاندازی)
- [تنظیمات Supabase](#تنظیمات-supabase)
- [استفاده](#استفاده)
- [ساختار پروژه](#ساختار-پروژه)
- [دیپلوی](#دیپلوی)
- [نقشه راه توسعه](#نقشه-راه-توسعه)
- [مشارکت](#مشارکت)

---

## ✨ ویژگی‌های اصلی

### نسخه 0.2 (فعلی)

#### 🏦 مدیریت معاملات
- ✅ ثبت معاملات خرید و فروش
- ✅ ردیابی وضعیت (تحویل کالا / دریافت پول)
- ✅ محاسبه خودکار مانده و کل مبلغ
- ✅ جزئیات کامل هر معامله
- ✅ ویرایش و حذف معاملات

#### 👥 مدیریت مشتریان
- ✅ افزودن و ویرایش مشتریان
- ✅ ذخیره اطلاعات تماس و یادداشت‌ها
- ✅ مشاهده تاریخچه کامل معاملات هر مشتری
- ✅ آمار جامع (کل معاملات، دریافتی، مانده)

#### 💰 سیستم پرداخت‌های متعدد
- ✅ ثبت چندین پرداخت برای هر معامله
- ✅ انواع روش پرداخت:
  - 💵 نقد
  - 💳 کارت به کارت
  - 📱 کارتخوان (POS)
- ✅ تاریخچه کامل پرداخت‌ها
- ✅ محاسبه خودکار مانده با هر پرداخت

#### 📅 تقویم شمسی
- ✅ نمایش تقویم جلالی
- ✅ مشاهده معاملات هر روز
- ✅ نشانه‌گذاری روزهای دارای معامله
- ✅ آمار روزانه (کل، دریافتی، مانده)

#### 📊 داشبورد و گزارشات
- ✅ آمار کلی معاملات
- ✅ فیلتر بر اساس وضعیت (تکمیل شده، در جریان، ناقص)
- ✅ جستجو در معاملات و مشتریان
- ✅ نمایش رنگی وضعیت‌ها

#### 🔐 امنیت و احراز هویت
- ✅ سیستم لاگین و ثبت‌نام
- ✅ Row Level Security در دیتابیس
- ✅ جداسازی داده‌های کاربران

#### 📱 PWA Features
- ✅ قابلیت نصب روی موبایل و دسکتاپ
- ✅ کار آفلاین (با محدودیت)
- ✅ رابط کاربری ریسپانسیو
- ✅ طراحی Mobile-First

---

## 🛠 تکنولوژی‌های استفاده شده

### Frontend
- **React 18** - کتابخانه UI
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Zustand** - State Management
- **date-fns-jalali** - تاریخ شمسی
- **Lucide React** - Icons

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security
  - Realtime Subscriptions

### PWA
- **Vite PWA Plugin** - Service Worker
- **Workbox** - Caching Strategy

---

## 📦 پیش‌نیازها

- Node.js >= 18.0.0
- npm >= 9.0.0
- حساب کاربری Supabase (رایگان)

---

## 🚀 نصب و راه‌اندازی

### 1. Clone کردن پروژه
```bash
git clone https://github.com/yourusername/transaction-pwa.git
cd transaction-pwa
```

### 2. نصب dependencies
```bash
npm install
```

### 3. ایجاد فایل `.env`
```bash
cp .env.example .env
```

محتوای `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. اجرای پروژه
```bash
npm run dev
```

پروژه در آدرس `http://localhost:5173` اجرا می‌شود.

---

## 🗄️ تنظیمات Supabase

### 1. ایجاد پروژه

1. برو به [supabase.com](https://supabase.com)
2. یک پروژه جدید بساز
3. از Settings > API کلیدها رو کپی کن

### 2. اجرای SQL Schema

در SQL Editor این کد رو اجرا کن:
```sql
-- جدول مشتریان
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL
);

-- جدول معاملات
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  transaction_date TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  total_value NUMERIC GENERATED ALWAYS AS (amount * rate) STORED,
  goods_delivered BOOLEAN DEFAULT false,
  payment_received BOOLEAN DEFAULT false,
  amount_received NUMERIC DEFAULT 0,
  amount_remaining NUMERIC GENERATED ALWAYS AS ((amount * rate) - COALESCE(amount_received, 0)) STORED,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- جدول پرداخت‌ها
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card_to_card', 'pos')),
  payment_date TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- جدول تاریخچه تغییرات
CREATE TABLE transaction_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index ها
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_customers_user ON customers(user_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_updates ENABLE ROW LEVEL SECURITY;

-- Policies (به فایل SQL کامل مراجعه کنید)
```

فایل کامل SQL در `database/schema.sql` موجود است.

---

## 📖 استفاده

### ثبت‌نام و ورود

1. صفحه لاگین را باز کنید
2. با ایمیل و رمز عبور ثبت‌نام کنید
3. ایمیل خود را تایید کنید

### ایجاد معامله

1. روی دکمه **+** کلیک کنید
2. مشتری را انتخاب یا اضافه کنید
3. اطلاعات معامله را وارد کنید
4. ذخیره کنید

### ثبت پرداخت

1. وارد جزئیات معامله شوید
2. در بخش پرداخت‌ها روی **افزودن پرداخت** کلیک کنید
3. مبلغ و روش پرداخت را وارد کنید
4. ثبت کنید

### مشاهده در تقویم

1. از منوی پایین **تقویم** را انتخاب کنید
2. روی هر روز کلیک کنید
3. معاملات آن روز نمایش داده می‌شود

---

## 📁 ساختار پروژه
```
transaction-pwa/
├── database/
│   ├── 1.sql
│   └── 2.sql
├── public/
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── components/
│   │   ├── CustomerSelect.tsx
│   │   ├── JalaliCalendar.tsx
│   │   ├── Layout.tsx
│   │   ├── PaymentsList.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── TransactionCard.tsx
│   │   └── TransactionForm.tsx
│   ├── pages/
│   │   ├── Calendar.tsx
│   │   ├── CustomerDetail.tsx
│   │   ├── Customers.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── TransactionDetail.tsx
│   ├── store/
│   │   └── useStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── dateHelpers.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── database/
│   └── schema.sql
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🚢 دیپلوی

### با GitHub Pages
```bash
# Build کردن
npm run build

# Deploy (اگر از subtree استفاده می‌کنید)
git subtree push --prefix dist origin gh-pages
```

### با Vercel
```bash
vercel deploy
```

### با Netlify
```bash
netlify deploy --prod
```

**نکته:** فراموش نکنید environment variables رو در پلتفرم دیپلوی تنظیم کنید.

---

## 🗺️ نقشه راه توسعه

### نسخه 0.3 (برنامه‌ریزی شده)

- [ ] **گزارشات پیشرفته**
  - نمودار درآمد ماهانه
  - نمودار پای انواع ارز
  - گزارش بدهکاران
  - Export به Excel/PDF

- [ ] **یادآوری‌ها و نوتیفیکیشن**
  - یادآوری برای معاملات ناقص
  - نوتیفیکیشن سررسید
  - Web Push Notifications

- [ ] **تنظیمات کاربر**
  - انتخاب تم (روشن/تاریک)
  - تنظیم ارزهای پیش‌فرض
  - سفارشی‌سازی نمایش

- [ ] **بک‌آپ و Import**
  - Export داده‌ها به JSON
  - Import از Excel
  - بک‌آپ خودکار

### نسخه 0.4 (آینده)

- [ ] **همکاری تیمی**
  - اضافه کردن کاربران به تیم
  - سطوح دسترسی
  - لاگ تغییرات

- [ ] **یکپارچه‌سازی**
  - اتصال به سیستم‌های بانکی
  - API برای اپ‌های دیگر
  - Webhook ها

- [ ] **گزارش‌های مالیاتی**
  - محاسبه مالیات
  - گزارش سالانه
  - فرم‌های مالیاتی

---

## 🐛 گزارش باگ

اگر باگی پیدا کردید:

1. Issue جدید باز کنید
2. عنوان واضح انتخاب کنید
3. مراحل بازتولید باگ را شرح دهید
4. اسکرین‌شات اضافه کنید (در صورت نیاز)

---

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/AmazingFeature`)
3. تغییرات را commit کنید (`git commit -m 'Add some AmazingFeature'`)
4. Push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request باز کنید

---

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

---

## 👨‍💻 توسعه‌دهندگان

- **Your Name** - توسعه‌دهنده اصلی
- **Claude (Anthropic)** - کمک در توسعه

---

## 🙏 تشکرات

- [Supabase](https://supabase.com) - Backend as a Service
- [Vite](https://vitejs.dev) - Build Tool
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework
- [date-fns-jalali](https://github.com/date-fns-jalali/date-fns-jalali) - تقویم شمسی

---

## 📞 تماس

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

**ساخته شده با ❤️ برای مدیریت بهتر معاملات**