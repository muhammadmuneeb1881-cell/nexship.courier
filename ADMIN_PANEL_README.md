# NexShip Admin Panel — Setup Guide

Ye guide batati hai ke naya admin panel kaise chalayen aur configure karein.

## Kya add hua hai

1. **Booking form** ab har order ko save karta hai — sender/receiver details, pickup/delivery address, package type, **weight (kg)** aur **quantity**, aur automatically price calculate karta hai. Booking confirm hote hi customer ko ek unique **Tracking ID** (jaise `NS-7K2F9Q`) mil jati hai.
2. **Order tracking** — customer `/track` page par ja kar apna tracking ID daal ke apne order ka live status dekh sakta hai (Pending → Picked Up → In Transit → Delivered, ya Cancelled). Homepage ke tracking section aur navbar se bhi seedha is page tak pohanch sakte hain.
3. **Admin login** — `/admin/login`
4. **Admin dashboard** — `/admin`
   - **Orders tab**: har order ka pura data — **Tracking ID**, naam, number, address, weight, quantity, package type, price, status — ek table mein. Status change kar sakte hain (Pending / Picked Up / In Transit / Delivered / Cancelled), search/filter tracking ID se bhi ho sakta hai, delete bhi kar sakte hain.
   - **Inquiries tab**: Pricing plans ke "Get Started"/"Contact Sales" buttons, "Talk to Sales" button, aur homepage ka Contact form — in sab se jo bhi customer apni detail submit karega, wo yahan dikhega (naam, number, email, message, kis plan ke liye). Status track kar sakte hain (New / Contacted / Closed) aur delete bhi kar sakte hain.
   - **Pricing tab**: yahan se aap Base Fee, Rate per KG, aur har package type (Documents/Parcel/Fragile/Electronics/Food) ki extra fee khud set/adjust kar sakte hain. Save karte hi naye orders isi rate se calculate honge.
5. **Email notifications** — jab bhi koi customer koi plan select kare, "Talk to Sales" par click kare, ya Contact form submit kare, uski detail automatically **nexship.courier@gmail.com** par email ho jati hai (agar aap ne SMTP set up kiya ho — neeche dekhein), aur sath hi admin panel ke Inquiries tab mein bhi save ho jati hai — chahe email fail ho jaye, data kabhi miss nahi hota.

Data `data/orders.json`, `data/inquiries.json` aur `data/pricing.json` files mein save hota hai — koi external database setup nahi karna.

> **Note:** Ye file-based storage hai, isliye is app ko ek normal Node.js server (VPS, cPanel Node hosting, Railway, Render, apna PC, etc.) par `npm run build && npm start` se chalayen. Serverless hosting (jaise plain Vercel) par file storage persist nahi karta — agar aap Vercel use karna chahte hain to future mein isay ek real database (Postgres/MySQL) par shift karna hoga.

## Setup Steps

1. Project folder mein `.env.local.example` ko copy karke `.env.local` banayen:
   ```
   cp .env.local.example .env.local
   ```
2. `.env.local` kholein aur ye values apni marzi se change karein:
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=apna-mazboot-password
   ADMIN_SESSION_SECRET=koi-lamba-random-string
   ```
   **Important:** Default password (`changeme123`) zaroor change karein, warna koi bhi login kar sakta hai.
3. Dependencies install karein (already same as pehle):
   ```
   npm install
   ```
4. Local test ke liye:
   ```
   npm run dev
   ```
   Phir browser mein `http://localhost:3000/admin/login` khol kar login karein.
5. Production ke liye:
   ```
   npm run build
   npm start
   ```

## Email par inquiries kaise receive karein (Gmail)

Taake "Get Started", "Contact Sales", "Talk to Sales", aur Contact form ki submissions aap ki email (`nexship.courier@gmail.com`) par pohanchein, ek **Gmail App Password** generate karna hoga (normal Gmail password kaam nahi karega):

1. Us Gmail account mein jayen jahan se emails bhejni hain (ye `nexship.courier@gmail.com` khud ho sakta hai, ya koi bhi doosra Gmail jo sirf sending ke liye use ho).
2. Us account mein **2-Step Verification** on karein (Google Account → Security).
3. Phir [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) par jayen aur ek naya App Password generate karein (16 characters).
4. `.env.local` mein ye values daalein:
   ```
   EMAIL_USER=jis-account-se-bhejni-hai@gmail.com
   EMAIL_PASS=woh-16-character-app-password
   EMAIL_TO=nexship.courier@gmail.com
   ```
5. Server restart karein (`npm run dev` ya `npm start` dobara chalayen).

**Agar EMAIL_USER/EMAIL_PASS set nahi kiya hoga:** koi masla nahi — website phir bhi kaam karegi, sirf email nahi jayegi, lekin har inquiry admin panel ke **Inquiries tab** mein zaroor save hogi, is liye koi data miss nahi hota.

## Kaise kaam karta hai

- Jab koi customer website se booking form submit karta hai, order `POST /api/orders` ko jata hai, price current pricing settings se calculate hoti hai, ek random unique **Tracking ID** (`NS-` + 6 characters) generate hoti hai, aur order `data/orders.json` mein save ho jata hai.
- Customer `/track` page par apni tracking ID daal kar `GET /api/track/[trackingId]` call karta hai (ye endpoint public hai, lekin sirf limited safe info return karta hai — phone numbers nahi dikhaye jate).
- Admin panel (`/admin`) `GET /api/orders` se saray orders fetch karta hai — ye endpoint sirf logged-in admin ke liye kaam karta hai.
- Pricing tab `PUT /api/pricing` call karta hai jo `data/pricing.json` update karta hai — is ke baad har naya order isi hisaab se price hoga.
- Login `POST /api/admin/login` se hota hai jo ek secure httpOnly cookie set karta hai (8 ghante ke liye valid).
- Jab customer koi plan select karta hai, "Talk to Sales" click karta hai, ya Contact form submit karta hai, request `POST /api/inquiries` ko jati hai — ye email bhejne ki koshish karta hai (`lib/mailer.ts` ke zariye) aur chahe email jaye ya na jaye, inquiry hamesha `data/inquiries.json` mein save ho jati hai.
- Admin panel ka Inquiries tab `GET /api/inquiries` se sab inquiries fetch karta hai (sirf logged-in admin ke liye), aur status update `PATCH /api/inquiries/[id]` se hota hai.

## Security notes

- Password aur session secret hamesha `.env.local` mein rakhein, code mein hardcode na karein.
- `.env.local` aur `data/orders.json` / `data/pricing.json` git mein commit na hon — `.gitignore` mein already add hain.
- Production mein HTTPS zaroor use karein taake login cookie secure rahe.
