# Critical Missing Arabic Translations

## Priority 1: Page Headers & Navigation
These are the most visible elements that need immediate translation:

### HomePage.tsx
- Line 84: "Dashboard" → t('pages.home.title')
- Line 85: "Welcome to CLIKA Dashboard" → t('pages.home.subtitle')

### UsersPage.tsx  
- Line 107: "User Management" → t('pages.users.title')
- Line 108: "Manage user accounts and permissions" → t('pages.users.subtitle')

### AnalyticsPage.tsx
- Line 109: "Analytics" → t('pages.analytics.title')
- Line 110: "Game performance and user insights" → t('pages.analytics.subtitle')

### CampaignsPage.tsx
- Line 123: "Ad Campaigns" → t('pages.campaigns.title')
- Line 124: "Manage advertising campaigns and creatives" → t('pages.campaigns.subtitle')

### SessionsPage.tsx
- Line 134: "Sessions & Rounds" → t('pages.sessions.title')
- Line 135: "Track game sessions and player activity" → t('pages.sessions.subtitle')

### SettingsPage.tsx
- Line 56: "Settings" → t('pages.settings.title')
- Line 57: "System Configuration" → t('pages.settings.subtitle')

## Priority 2: Form Labels & Buttons
Critical for user interaction:

### Common Buttons
- "Save" → t('common.save')
- "Cancel" → t('common.cancel')
- "Delete" → t('common.delete')
- "Edit" → t('common.edit')
- "Create" → t('common.create')
- "Update" → t('common.update')
- "Search" → t('common.search')
- "Filter" → t('common.filter')
- "Export" → t('common.export')

### Form Labels
- "Email" → t('fields.email')
- "Password" → t('fields.password')
- "Name" → t('fields.name')
- "Role" → t('fields.role')
- "Status" → t('fields.status')
- "Active" → t('fields.active')
- "Created" → t('fields.created')
- "Updated" → t('fields.updated')
- "Actions" → t('fields.actions')

## Priority 3: Table Headers
For data display:

### Common Table Headers
- "ID" → t('table.id')
- "Name" → t('table.name')
- "Email" → t('table.email')
- "Status" → t('table.status')
- "Created At" → t('table.createdAt')
- "Updated At" → t('table.updatedAt')
- "Actions" → t('table.actions')

## Priority 4: Toast Messages
For user feedback:

### Success Messages
- "Successfully created" → t('toast.success.created')
- "Successfully updated" → t('toast.success.updated')
- "Successfully deleted" → t('toast.success.deleted')
- "Successfully saved" → t('toast.success.saved')

### Error Messages
- "Failed to create" → t('toast.error.create')
- "Failed to update" → t('toast.error.update')
- "Failed to delete" → t('toast.error.delete')
- "Failed to save" → t('toast.error.save')

## Priority 5: Status Values
For consistent status display:

### Common Statuses
- "Active" → t('status.active')
- "Inactive" → t('status.inactive')
- "Draft" → t('status.draft')
- "Published" → t('status.published')
- "Pending" → t('status.pending')
- "Approved" → t('status.approved')
- "Rejected" → t('status.rejected')

## Implementation Steps:

1. Add these translations to `/src/i18n/locales/ar.json`
2. Update components to use `t()` function
3. Test all pages in both languages
4. Ensure RTL layout works correctly

## Arabic Translation Template:

```json
{
  "pages": {
    "home": {
      "title": "لوحة التحكم",
      "subtitle": "مرحباً بك في لوحة تحكم كليكا"
    },
    "users": {
      "title": "إدارة المستخدمين",
      "subtitle": "إدارة حسابات المستخدمين والصلاحيات"
    },
    "analytics": {
      "title": "التحليلات",
      "subtitle": "أداء الألعاب ورؤى المستخدمين"
    },
    "campaigns": {
      "title": "الحملات الإعلانية",
      "subtitle": "إدارة الحملات الإعلانية والإبداعات"
    },
    "sessions": {
      "title": "الجلسات والجولات",
      "subtitle": "تتبع جلسات اللعب ونشاط اللاعبين"
    },
    "settings": {
      "title": "الإعدادات",
      "subtitle": "تكوين النظام"
    }
  },
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "create": "إنشاء",
    "update": "تحديث",
    "search": "بحث",
    "filter": "تصفية",
    "export": "تصدير"
  },
  "fields": {
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "name": "الاسم",
    "role": "الدور",
    "status": "الحالة",
    "active": "نشط",
    "created": "تاريخ الإنشاء",
    "updated": "تاريخ التحديث",
    "actions": "الإجراءات"
  },
  "table": {
    "id": "المعرف",
    "name": "الاسم",
    "email": "البريد الإلكتروني",
    "status": "الحالة",
    "createdAt": "تاريخ الإنشاء",
    "updatedAt": "تاريخ التحديث",
    "actions": "الإجراءات"
  },
  "toast": {
    "success": {
      "created": "تم الإنشاء بنجاح",
      "updated": "تم التحديث بنجاح",
      "deleted": "تم الحذف بنجاح",
      "saved": "تم الحفظ بنجاح"
    },
    "error": {
      "create": "فشل الإنشاء",
      "update": "فشل التحديث",
      "delete": "فشل الحذف",
      "save": "فشل الحفظ"
    }
  },
  "status": {
    "active": "نشط",
    "inactive": "غير نشط",
    "draft": "مسودة",
    "published": "منشور",
    "pending": "قيد الانتظار",
    "approved": "موافق عليه",
    "rejected": "مرفوض"
  }
}
```