// All site copy lives here so it can be edited without touching components.

export const brand = {
  name: 'The Jordans',
  logo: '/img/logo.png',
  email: 'thejordans@support.com',
  whatsapp: '17015815573',
  hours: 'Mon–Fri, 9am to 6pm EST',
  /** Smartsupp live-chat key from the original site. Set to '' to disable live chat. */
  smartsuppKey: '6d6df0255788260cdf313d4406901a3159bb3c67',
}

export interface NavLink {
  label: string
  to: string
}

export const mainNav: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
  { label: 'Tracking', to: '/track' },
]

export const hero = {
  image: '/img/hero-warehouse.jpg',
  title: 'Your Freight. Our Road. On Time.',
  text: 'Ship freight in 3 easy steps. Use our online Quick Track service to book air, ocean or road transport, follow every shipment, and schedule a free pickup.',
}

export const tradeLanes = ['NEW YORK', 'LONDON', 'DUBAI', 'SHANGHAI', 'SINGAPORE']

export interface Feature {
  title: [string, string?]
  text: string
  cta: NavLink
  image: string
  alt: string
}

export const features: Feature[] = [
  {
    title: ['The Standard', 'In Global Freight'],
    text: 'We move freight by air, ocean and road for businesses that need it to arrive on schedule. Every shipment is handled by one team, from booking to final delivery.',
    cta: { label: 'Get In Touch', to: '/contact' },
    image: '/img/img-about-freight.jpg',
    alt: 'The Jordans container operations',
  },
  {
    title: ['Tracking At', 'Your Fingertips'],
    text: 'Always know the status of your freight with real-time tracking on every shipment, from pickup to final delivery.',
    cta: { label: 'Track a Shipment', to: '/track' },
    image: '/img/img-cargo-hero.jpg',
    alt: 'Real-time shipment tracking',
  },
  {
    title: ['Air, Ocean & Road', 'Under One Contract'],
    text: 'Every mode of transport handled by one operator across 120+ countries and every major trade lane worldwide.',
    cta: { label: 'Explore Services', to: '/services' },
    image: '/img/img-svc-ocean.jpg',
    alt: 'Ocean freight services',
  },
  {
    title: ['Insured By Default'],
    text: 'Full coverage is included on every shipment at no extra cost. No add-ons, no fine print — just freight that arrives protected.',
    cta: { label: 'Get a Quote', to: '/contact' },
    image: '/img/img-svc-warehouse.jpg',
    alt: 'Insured warehousing and distribution',
  },
]

export const tickerCities: [string, string][] = [
  ['FRANKFURT', 'Germany'],
  ['NAIROBI', 'Kenya'],
  ['TOKYO', 'Japan'],
  ['SAO PAULO', 'Brazil'],
  ['RIYADH', 'Saudi Arabia'],
  ['CHICAGO', 'USA'],
  ['ACCRA', 'Ghana'],
  ['DUBAI', 'UAE'],
  ['SINGAPORE', 'Singapore'],
  ['LONDON', 'UK'],
  ['SYDNEY', 'Australia'],
  ['MUMBAI', 'India'],
]

export const trustItems = [
  { icon: 'shield', name: 'Licensed Carrier', sub: 'Federally licensed' },
  { icon: 'check', name: 'Fully Bonded', sub: 'Surety bonded' },
  { icon: 'home', name: 'Cargo Insured', sub: 'Full coverage' },
  { icon: 'clock', name: '24/7 Compliant', sub: 'All shipping lanes' },
] as const

export interface Review {
  initials: string
  color: string
  name: string
  /** 0–5 in steps of 0.5 */
  rating: number
  text: string
}

export const reviewSummary = { count: '200+', score: '4.9' }

export const reviews: Review[] = [
  { initials: 'JR', color: '#004B87', name: 'Jason Reed', rating: 5, text: 'The Jordans handled our bulk auto parts shipment from Detroit to LA with zero issues. On time, well packed, and tracking was accurate the whole way.' },
  { initials: 'TW', color: '#1a5fa8', name: 'Tracy Williams', rating: 4.5, text: 'Super reliable service. I ship monthly and The Jordans has become my go-to. One small hiccup with a label but they fixed it fast.' },
  { initials: 'AM', color: '#1a7a4a', name: 'Andrew Mitchell', rating: 5, text: 'Moved our entire warehouse inventory across three states. The Jordans coordinated everything smoothly. Could not have asked for better.' },
  { initials: 'KB', color: '#7c3aed', name: 'Karen Brooks', rating: 4, text: 'Good service overall. Communication was solid and the team was responsive. Delivery was a day late but they kept me updated throughout.' },
  { initials: 'DH', color: '#b45309', name: 'Daniel Harris', rating: 5, text: 'Best freight company I have worked with in 10 years of logistics. The Jordans never misses. Our retail chain depends on them every week.' },
  { initials: 'SC', color: '#0e7490', name: 'Stephanie Clark', rating: 4.5, text: 'Fantastic experience shipping medical equipment from Houston to New York. Temperature control was perfect and all documentation was flawless.' },
  { initials: 'MR', color: '#be123c', name: 'Michael Rogers', rating: 5, text: 'The Jordans delivered 8 pallets of electronics to our Chicago warehouse two days ahead of schedule. Packaging was immaculate.' },
  { initials: 'LG', color: '#166534', name: 'Linda Green', rating: 3.5, text: 'Service was decent. Got my shipment but tracking updates were a bit slow. Customer service was friendly when I called though.' },
  { initials: 'BN', color: '#9d174d', name: 'Brian Nelson', rating: 5, text: 'We have been using The Jordans for our restaurant supply chain for two years. Not a single missed delivery. These guys are the real deal.' },
  { initials: 'CJ', color: '#1d4ed8', name: 'Christine Johnson', rating: 4.5, text: 'Really impressed with how they handled our fragile art shipment from Miami to Seattle. Everything arrived in perfect condition.' },
  { initials: 'EW', color: '#064e3b', name: 'Edward Walsh', rating: 4, text: 'Solid freight company. Rates are competitive and the team is easy to work with. Tracking system could be a bit more detailed.' },
  { initials: 'PK', color: '#92400e', name: 'Patricia King', rating: 5, text: 'The Jordans saved us during peak season when our usual carrier failed. They picked up our entire load same day and delivered on time.' },
  { initials: 'ND', color: '#3730a3', name: 'Nathan Davis', rating: 5, text: 'Exceptional service from quote to delivery. The online tracking is excellent and the driver was professional and on time.' },
  { initials: 'RL', color: '#065f46', name: 'Rachel Lewis', rating: 4.5, text: 'Very happy with The Jordans. Used them for three cross-country shipments this year and all arrived on schedule with no damage.' },
  { initials: 'HF', color: '#1e3a5f', name: 'Henry Foster', rating: 5, text: 'The Jordans moved our construction equipment across four states without a scratch. Their logistics team planned everything perfectly.' },
  { initials: 'TV', color: '#6b21a8', name: 'Tina Vasquez', rating: 3.5, text: 'Decent experience. My shipment arrived safely but took a bit longer than quoted. Would appreciate more proactive communication on delays.' },
  { initials: 'GM', color: '#b91c1c', name: 'Gary Moore', rating: 5, text: 'I run a small e-commerce business and The Jordans has been a game changer. Fast pickups, reliable delivery and great tracking.' },
  { initials: 'WS', color: '#0f766e', name: 'Wendy Scott', rating: 4, text: 'Used The Jordans for a large furniture shipment. The team was professional and careful. Minor paperwork issue was resolved quickly.' },
  { initials: 'KA', color: '#7e22ce', name: 'Kevin Adams', rating: 5, text: 'Outstanding logistics partner. The Jordans handled our seasonal inventory surge without breaking a sweat. Highly recommend.' },
  { initials: 'JM', color: '#15803d', name: 'Jessica Martinez', rating: 4.5, text: 'Shipped pharmaceuticals from Boston to San Diego. The Jordans maintained the cold chain perfectly and delivered ahead of schedule.' },
  { initials: 'SR', color: '#c2410c', name: 'Samuel Robinson', rating: 4, text: 'Good reliable service. I appreciate the transparency in pricing and the easy booking process. Will definitely use again.' },
  { initials: 'DB', color: '#1e40af', name: 'Diana Bell', rating: 5, text: 'The Jordans is simply the best freight company in the US. Three years, hundreds of shipments, and they have never let me down once.' },
]

export const faqs: { q: string; a: string }[] = [
  { q: 'How do I track my shipment?', a: 'Enter your tracking number in the tracking field on our homepage. You will see real-time updates at every stage from pickup to final delivery.' },
  { q: 'How long does international delivery take?', a: 'Air freight typically takes 1-5 business days. Ocean freight takes 10-30 days depending on the route. We always provide an estimated delivery date at booking.' },
  { q: 'How do I get a quote?', a: 'Use our shipment cost calculator on this page for an instant estimate, or contact our team directly for a detailed quote.' },
  { q: 'What countries do you deliver to?', a: 'We deliver to 120+ countries across every continent. Our network covers major hubs in North America, Europe, Asia, Africa, the Middle East and Oceania.' },
  { q: 'Are my shipments insured?', a: 'Yes. All shipments are fully insured from the moment we collect your cargo. We are a licensed, bonded and insured carrier with full cargo coverage across all routes.' },
  { q: 'Can I ship fragile or hazardous items?', a: 'Yes, we handle fragile cargo with specialized packaging. For hazardous materials, contact our team directly as special documentation applies.' },
]

export const footerColumns: { title: string; links: (NavLink | string)[] }[] = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Services', to: '/services' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Shipping',
    links: [
      { label: 'Track a Shipment', to: '/track' },
      { label: 'Get a Quote', to: '/contact' },
      { label: 'Air Freight', to: '/services' },
      { label: 'Ocean & Road Freight', to: '/services' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQs', to: '/#faq' },
      { label: 'Customer Support', to: '/contact' },
      'Mon–Fri, 9am to 6pm EST',
      'Licensed, Bonded & Insured',
    ],
  },
]
