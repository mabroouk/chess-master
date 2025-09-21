# دليل النشر - Chess Master

هذا الدليل يوضح كيفية نشر موقع **أستاذ الشطرنج** على منصات مختلفة.

## النشر على GitHub Pages

### الطريقة التلقائية (موصى بها)

تم إعداد GitHub Actions للنشر التلقائي. عند رفع أي تغييرات إلى branch `master` أو `main`، سيتم بناء ونشر الموقع تلقائياً.

#### الخطوات:
1. ارفع الكود إلى GitHub
2. انتقل إلى إعدادات المستودع
3. في قسم **Pages**، اختر **GitHub Actions** كمصدر
4. سيتم النشر تلقائياً على `https://username.github.io/chess-master`

### الطريقة اليدوية

```bash
# بناء المشروع
pnpm run build

# نشر إلى gh-pages branch
npx gh-pages -d dist
```

## النشر على Netlify

### النشر المباشر
1. اذهب إلى [Netlify](https://netlify.com)
2. اسحب مجلد `dist` إلى منطقة النشر
3. سيتم نشر الموقع فوراً

### النشر من Git
1. ربط المستودع بـ Netlify
2. إعدادات البناء:
   - **Build command**: `pnpm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

## النشر على Vercel

### من سطر الأوامر
```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel --prod
```

### من الواجهة الويب
1. اذهب إلى [Vercel](https://vercel.com)
2. استورد المستودع من GitHub
3. إعدادات البناء:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`

## النشر على Firebase Hosting

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init hosting

# بناء المشروع
pnpm run build

# النشر
firebase deploy
```

## النشر باستخدام Docker

### إنشاء Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### بناء وتشغيل الحاوية
```bash
# بناء الصورة
docker build -t chess-master .

# تشغيل الحاوية
docker run -p 80:80 chess-master
```

## النشر على خادم شخصي

### باستخدام Apache
```bash
# بناء المشروع
pnpm run build

# نسخ الملفات إلى مجلد الويب
sudo cp -r dist/* /var/www/html/

# إعادة تشغيل Apache
sudo systemctl restart apache2
```

### باستخدام Nginx
```bash
# بناء المشروع
pnpm run build

# نسخ الملفات
sudo cp -r dist/* /var/www/html/

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

## إعدادات إضافية

### ملف nginx.conf للنشر
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### متغيرات البيئة
```bash
# للإنتاج
NODE_ENV=production
VITE_APP_TITLE="أستاذ الشطرنج"
VITE_APP_VERSION="1.0.0"
```

## اختبار النشر

### اختبار محلي
```bash
# بناء الإنتاج
pnpm run build

# معاينة البناء
pnpm run preview

# اختبار على منفذ مختلف
pnpm run preview --port 4173
```

### اختبار الأداء
```bash
# تثبيت أدوات الاختبار
npm install -g lighthouse

# اختبار الأداء
lighthouse http://localhost:4173 --output html --output-path ./lighthouse-report.html
```

## استكشاف الأخطاء

### مشاكل شائعة

#### خطأ 404 عند التنقل
**الحل**: تأكد من إعداد fallback للـ SPA في إعدادات الخادم

#### ملفات CSS/JS لا تحمل
**الحل**: تحقق من مسارات الملفات في `vite.config.js`

#### بطء في التحميل
**الحل**: فعل ضغط gzip في إعدادات الخادم

### فحص الأخطاء
```bash
# فحص بناء الإنتاج
pnpm run build 2>&1 | tee build.log

# فحص حجم الملفات
du -sh dist/*

# فحص الروابط المكسورة
npx broken-link-checker http://localhost:4173
```

## الأمان

### إعدادات الأمان الموصى بها
```nginx
# في ملف nginx.conf
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### شهادة SSL
```bash
# باستخدام Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

## المراقبة والتحليلات

### Google Analytics
أضف معرف Google Analytics في `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### مراقبة الأداء
- استخدم **Google PageSpeed Insights**
- راقب **Core Web Vitals**
- فعل **Service Worker** للتخزين المؤقت

## النسخ الاحتياطي

### نسخ احتياطي للكود
```bash
# إنشاء أرشيف
tar -czf chess-master-backup-$(date +%Y%m%d).tar.gz .

# رفع إلى التخزين السحابي
# (حسب الخدمة المستخدمة)
```

### نسخ احتياطي للبيانات
```bash
# نسخ إعدادات المستخدمين (localStorage)
# يتم حفظها تلقائياً في متصفح المستخدم
```

---

**ملاحظة**: تأكد من اختبار النشر في بيئة تجريبية قبل النشر في الإنتاج.

للمساعدة أو الاستفسارات، افتح Issue في المستودع أو راسلنا على support@chessmaster.com
