// ====================================================================
// Ye data seedha NexShip website ke actual content (Hero, Services,
// Coverage, Business, Pricing, Contact, Help/FAQ) se liya gaya hai,
// taake chatbot hamesha wahi jawab de jo website par likha hai.
//
// Jab bhi website par koi info change ho (services, coverage, contact,
// FAQ), to yahan bhi update kar dein - bot turant nayi info use karega.
// Live delivery pricing aur tracking status seedha lib/store.ts se
// (real-time) liye jaate hain, is file mein nahi.
// ====================================================================

export const BUSINESS_DETAILS = `
COMPANY: NexShip - Pakistan's Premium Courier & Logistics Platform
WEBSITE TAGLINE: Fast, secure and reliable courier solutions for businesses and individuals.

CURRENT SERVICE AREA (IMPORTANT):
- NexShip currently delivers ONLY within Karachi, Sindh, Pakistan.
- All other cities across Pakistan are "Coming Soon" - NOT live yet.
- Coverage list: Karachi (LIVE). Coming soon: Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Hyderabad, Peshawar, Quetta, Sialkot, Gujranwala, Sukkur.
- If a customer asks about delivery in a city other than Karachi, tell them it's coming soon and we currently only serve Karachi.

STATS:
- 50,000+ deliveries per month
- 99.2% on-time delivery rate
- 8,412 live tracked shipments
- Average delivery time: 5.2 hours
- Damage-free rate: 99.6%

SERVICES:
1. Express Ground Delivery - Same-day and next-day courier network with real-time GPS tracking. LIVE now within Karachi.
2. Smart Package Handling - AI-assisted sorting and damage-proof handling for fragile and high-value goods. LIVE now within Karachi.
3. Air Freight - Priority air cargo for time-critical shipments. COMING SOON (not live yet).
4. Sea & Container Freight - Cost-efficient container shipping for bulk/international consignments. COMING SOON (not live yet).
5. Enterprise Logistics - Dedicated account management, API integrations, custom SLAs. COMING SOON (not live yet).

HOW BOOKING WORKS (Book & Pack -> Smart Routing -> Move & Track -> Deliver & Support):
1. Book & Pack - Customer schedules a pickup through the Booking page (or dashboard/API for business).
2. Smart Routing - The system automatically picks the fastest, most reliable route.
3. Move & Track - Live GPS tracking across the journey.
4. Deliver & Support - Signed delivery confirmation with 24/7 dedicated support.
To book a delivery: customer should go to the Booking page on the website, fill in sender details, receiver details, delivery city, and package info (type, weight, quantity) - the exact price is shown before confirming, and a tracking ID (format NS-XXXXXX) is generated instantly.

PRICING:
- Delivery price is calculated automatically based on: a base fee + a per-kg rate x weight x quantity + an extra fee depending on package type (Documents, Parcel, Fragile, Electronics, Food).
- The exact live rates (base fee, per-kg rate, and extra fee per package type) are provided separately below in the LIVE PRICING RATES section - always use those exact numbers, never guess.
- Documents usually have the lowest extra fee, Electronics the highest extra fee among package types.
- For an exact price quote, the customer should use the Booking page, which calculates and shows the exact price before confirming - or give this chat their weight, quantity and package type and use the live rates below to calculate it.
- Business plan / subscription-style pricing (for reference only, shown on homepage Pricing section):
  1. Starter - Rs 299/shipment - up to 50 shipments/month, standard delivery (2-3 days), basic tracking, email support.
  2. Business (Most Popular) - Rs 249/shipment - up to 1,000 shipments/month, express delivery (same/next day), real-time GPS tracking, priority support.
  3. Enterprise - Custom pricing - unlimited shipments, dedicated fleet & fulfilment, custom SLAs, dedicated account manager, 24/7 phone support. Enterprise requires contacting the sales team for an exact quote.
- Pricing currently applies to deliveries within Karachi only. Rates for other cities will be announced closer to launch there.

TRACKING:
- Every shipment is GPS-tagged from pickup to doorstep with live ETAs, route history and instant delay alerts.
- Tracking IDs follow the format NS-XXXXXX (e.g. NS-7K2F9Q) - 6 letters/numbers after "NS-".
- Customers can track a shipment on the website's Track page, or by giving their tracking ID to this chat.
- Order statuses are: Pending, Picked Up, In Transit, Delivered, or Cancelled.
- Real-time tracking is currently available for Karachi deliveries only.

FOR BUSINESSES:
- Dedicated account manager & priority support
- REST API & webhook integrations
- Custom SLAs and volume-based pricing
- Automated customs & documentation
- Businesses can request this via "Talk to Sales" on the website.

CONTACT DETAILS:
- Phone: +92 312 2347756
- Email: nexship.courier@gmail.com
- Head Office: Shahrah-e-Faisal, Karachi, Pakistan
- The team replies to inquiries within one business hour.
- Customers can also use the Contact form on the homepage, or the Booking page to place an order directly.

FREQUENTLY ASKED QUESTIONS:
Q: How do I track my order?
A: Go to the Track page and enter the tracking ID (starts with NS-) you received after booking. You'll see the live status - Pending, Picked Up, In Transit or Delivered.

Q: How do I book a delivery?
A: Use the Booking page. Fill in sender and receiver details, delivery city and package info, and confirm - you'll instantly get a tracking ID.

Q: What cities do you deliver to?
A: We currently deliver only within Karachi. Other cities across Pakistan are marked "Coming Soon" - you can join the waitlist on the Coverage page.

Q: How is delivery pricing calculated?
A: Pricing is based on a base fee, weight, quantity and package type (Documents, Parcel, Fragile, Electronics, Food). The exact price is shown before confirming your booking.

Q: Can I change my delivery status or cancel an order?
A: Order status is managed by the operations team once booked. To make a change, contact support with the tracking ID.

Q: How do I contact support?
A: Email nexship.courier@gmail.com or call +92 312 2347756. The Contact form on the homepage also works.

NOTE: Cash on Delivery (COD) availability, exact office/pickup timings, and a detailed refund/lost-parcel policy are not published on the website. If a customer asks about these, do NOT guess - use the fallback message.
`;
