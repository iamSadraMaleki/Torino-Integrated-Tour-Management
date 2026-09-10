# راهنمای سیستم احراز هویت CEO

## مقدمه
سیستم احراز هویت CEO به شما امکان می‌دهد تا وضعیت احراز هویت کاربران با نقش CEO را مدیریت کنید.

## وضعیت‌های احراز هویت

### 1. NOT_VERIFIED (احراز نشده)
- **توضیح**: کاربر هنوز درخواست احراز هویت ثبت نکرده
- **قابل تغییر**: بله
- **عملکرد**: کاربر می‌تواند درخواست جدید ثبت کند

### 2. PENDING (در انتظار بررسی)
- **توضیح**: درخواست ثبت شده و در انتظار بررسی ادمین
- **قابل تغییر**: بله (فقط توسط کاربر)
- **عملکرد**: کاربر می‌تواند درخواست را ویرایش کند

### 3. VERIFIED (تایید شد)
- **توضیح**: درخواست تایید شده
- **قابل تغییر**: خیر
- **عملکرد**: وضعیت نهایی - کاربر احراز هویت شده

### 4. REJECTED (رد شد)
- **توضیح**: درخواست رد شده
- **قابل تغییر**: خیر
- **عملکرد**: وضعیت نهایی - کاربر باید درخواست جدید ثبت کند

## API های موجود

### برای کاربران CEO

#### 1. ثبت درخواست احراز هویت
```http
POST /api/ceo-verification/submit
Authorization: Bearer {token}
Content-Type: application/json

{
    "agencyName": "نام آژانس",
    "legalName": "نام حقوقی",
    "ceoName": "نام مدیر عامل",
    "registrationNumber": "شماره ثبت",
    "licenseExpiryDate": "2024-12-31",
    "taxNumber": "شماره مالیات",
    "establishmentDate": "2020-01-01",
    "companyEmail": "company@example.com",
    "companyPhone": "02112345678"
}
```

#### 2. دریافت وضعیت احراز هویت
```http
GET /api/ceo-verification/status
Authorization: Bearer {token}
```

**پاسخ:**
```json
{
    "id": 1,
    "userId": 123,
    "username": "ceo_user",
    "agencyName": "نام آژانس",
    "legalName": "نام حقوقی",
    "ceoName": "نام مدیر عامل",
    "registrationNumber": "شماره ثبت",
    "licenseExpiryDate": "2024-12-31",
    "taxNumber": "شماره مالیات",
    "establishmentDate": "2020-01-01",
    "companyEmail": "company@example.com",
    "companyPhone": "02112345678",
    "status": "PENDING",
    "statusPersian": "در انتظار بررسی",
    "message": "شما هنوز درخواست احراز هویت ثبت نکرده‌اید",
    "submittedAt": "2024-01-15T10:30:00",
    "reviewedAt": null,
    "rejectionReason": null
}
```

#### 3. بررسی احراز هویت
```http
GET /api/ceo-verification/is-verified
Authorization: Bearer {token}
```

**پاسخ:**
```json
{
    "verified": true
}
```

### برای ادمین‌ها (SUPERADMIN)

#### 1. دریافت لیست درخواست‌های در انتظار
```http
GET /api/ceo-verification/pending
Authorization: Bearer {admin_token}
```

#### 2. تایید درخواست
```http
PUT /api/ceo-verification/approve/{id}
Authorization: Bearer {admin_token}
```

#### 3. رد درخواست
```http
PUT /api/ceo-verification/reject/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "rejectionReason": "دلیل رد درخواست"
}
```

#### 4. دریافت آمار احراز هویت
```http
GET /api/ceo-verification/statistics
Authorization: Bearer {admin_token}
```

**پاسخ:**
```json
{
    "totalCeoUsers": 100,
    "notVerified": {
        "count": 30,
        "percentage": 30
    },
    "pending": {
        "count": 20,
        "percentage": 20
    },
    "verified": {
        "count": 40,
        "percentage": 40
    },
    "rejected": {
        "count": 10,
        "percentage": 10
    }
}
```

### عمومی

#### دریافت تمام وضعیت‌های موجود
```http
GET /api/ceo-verification/statuses
```

**پاسخ:**
```json
{
    "NOT_VERIFIED": {
        "value": "NOT_VERIFIED",
        "persianName": "احراز نشده",
        "description": "کاربر هنوز درخواست احراز هویت ثبت نکرده"
    },
    "PENDING": {
        "value": "PENDING",
        "persianName": "در انتظار بررسی",
        "description": "درخواست ثبت شده و در انتظار بررسی ادمین"
    },
    "VERIFIED": {
        "value": "VERIFIED",
        "persianName": "تایید شد",
        "description": "درخواست تایید شده"
    },
    "REJECTED": {
        "value": "REJECTED",
        "persianName": "رد شد",
        "description": "درخواست رد شده"
    }
}
```

## جریان کار

### برای کاربر CEO:
1. **احراز نشده**: کاربر وارد سیستم می‌شود و وضعیت NOT_VERIFIED دارد
2. **ثبت درخواست**: کاربر درخواست احراز هویت ثبت می‌کند → وضعیت PENDING
3. **در انتظار**: درخواست در انتظار بررسی ادمین است
4. **نتیجه**: ادمین درخواست را تایید (VERIFIED) یا رد (REJECTED) می‌کند

### برای ادمین:
1. **بررسی درخواست‌ها**: ادمین لیست درخواست‌های PENDING را می‌بیند
2. **تایید یا رد**: ادمین درخواست را بررسی و تصمیم‌گیری می‌کند
3. **آمارگیری**: ادمین می‌تواند آمار کلی احراز هویت را ببیند

## نکات مهم

1. **ویرایش درخواست**: کاربران می‌توانند درخواست‌های PENDING را ویرایش کنند
2. **درخواست مجدد**: کاربران با وضعیت REJECTED می‌توانند درخواست جدید ثبت کنند
3. **وضعیت نهایی**: VERIFIED و REJECTED وضعیت‌های نهایی هستند
4. **لاگ‌گیری**: تمام عملیات در لاگ ثبت می‌شوند
5. **امنیت**: فقط کاربران با نقش مناسب می‌توانند به API ها دسترسی داشته باشند

## مثال استفاده

### ثبت درخواست جدید
```javascript
const submitVerification = async (data) => {
    const response = await fetch('/api/ceo-verification/submit', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
};
```

### بررسی وضعیت
```javascript
const checkStatus = async () => {
    const response = await fetch('/api/ceo-verification/status', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};
```

### تایید درخواست (ادمین)
```javascript
const approveVerification = async (id) => {
    const response = await fetch(`/api/ceo-verification/approve/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    });
    return response.json();
};
```
