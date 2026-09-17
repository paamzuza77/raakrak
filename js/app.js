'use strict';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Owner decisions 2026-09-17 (STATE.md): prices stay visible with a LINE "ask about this piece" button;
// Craft and Stories are hidden until their content is verified (docs/07 D1/D4). Their renderers are kept.
const HIDDEN_ROUTES = ['craft', 'stories'];

// EDIT-ME at launch (docs/07 A4/D2): real LINE OA id (e.g. '@raakrak') and phone (e.g. '+6681…').
// While null, contact buttons show a notice instead of reaching a placeholder account that may belong to someone else.
const CONTACT = { lineId: null, phone: null };
const lineHref = message => CONTACT.lineId ? `https://line.me/R/oaMessage/${encodeURIComponent(CONTACT.lineId)}/?${encodeURIComponent(message)}` : '#';
const telHref = () => CONTACT.phone ? `tel:${CONTACT.phone}` : '#';
const contactAttrs = (ready, external = false) => ready ? (external ? 'target="_blank" rel="noopener"' : '') : 'data-contact-pending';

// Warehouse pin (owner-provided Apple Maps link, 2026-09-17): อ.บางไทร จ.พระนครศรีอยุธยา 13190.
// Google Maps URLs and the classic embed need no API key (docs/12 R8).
const PLACE = {
  lat: 14.124170,
  lng: 100.508497,
  embedSrc: 'https://maps.google.com/maps?q=14.124170,100.508497&z=15&output=embed',
  directionsHref: 'https://www.google.com/maps/dir/?api=1&destination=14.124170,100.508497',
  openHref: 'https://www.google.com/maps/search/?api=1&query=14.124170%2C100.508497'
};

// Real warehouse scenes from scripts/image-manifest.json (kind "warehouse" / "detail"). No AI renders here.
const SCENES = {
  homeHero: 'images/scenes/warehouse-hall-wagon-wheels.jpg',
  rootBall: 'images/scenes/warehouse-root-ball.jpg',
  shed: 'images/scenes/outdoor-shed-benches.jpg',
  hall: 'images/scenes/warehouse-hall-roots-windows.jpg',
  tables: 'images/scenes/warehouse-hall-root-tables.jpg',
  grain: 'images/scenes/detail-teak-grain.jpg'
};

// Icon set (docs/12 §4): 24px grid, 1.5 stroke, currentColor.
// Credits: `phone` and `link` paths follow Feather Icons (MIT); `truck` follows Lucide (ISC). Other paths are original.
const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.35-4.35"/>',
  'arrow-right': '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H4"/><path d="m10 6-6 6 6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>',
  close: '<path d="m6 6 12 12"/><path d="M18 6 6 18"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m15 6-6 6 6 6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  chat: '<path d="M12 4.5c-4.97 0-9 3.13-9 7 0 2.3 1.43 4.34 3.64 5.62L6 20.5l3.86-2.18c.7.12 1.41.18 2.14.18 4.97 0 9-3.13 9-7s-4.03-7-9-7Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  navigation: '<path d="m3 11 18-8-8 18-2-8-8-2Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15h-.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.5"/><path d="m21 15-4.5-4.5L6 20"/>',
  photos: '<rect x="7" y="7" width="14" height="13" rx="2"/><path d="M3 16V6a2 2 0 0 1 2-2h11"/><path d="m21 16-3.5-3.5L11 20"/>',
  expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v2"/>',
  weight: '<circle cx="12" cy="5.5" r="2.5"/><path d="M6.5 9h11l2.5 11H4L6.5 9Z"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M17 14.3a5.5 5.5 0 0 1 3.5 5.7"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  menu: '<path d="M4 9h16"/><path d="M4 15h16"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

const TYPES = ['table', 'bench', 'stump', 'slab', 'decor'];
const STATUSES = ['available', 'reserved', 'sold'];
const STATUS_ORDER = { available: 0, reserved: 1, sold: 2 };
const PRICE_RANGES = {
  under10: price => price < 10000,
  '10-25': price => price >= 10000 && price <= 25000,
  over25: price => price > 25000
};
const SORTS = ['available', 'price-asc', 'price-desc', 'code'];
const BATCH = 24;

const copy = {
  en: {
    skip: 'Skip to content', nav_home: 'Home', nav_collection: 'Collection', nav_craft: 'Craft', nav_stories: 'Stories', nav_visit: 'Visit', nav_notfound: 'Not found',
    find_code: 'Find a piece', find_code_aria: 'Find a piece by code', switch_lang: 'เปลี่ยนเป็นภาษาไทย', open_menu: 'Open menu', close_menu: 'Close menu', close: 'Close',
    qr_lookup: 'QR / code lookup', find_code_title: 'Find your exact piece', piece_code: 'Piece code', open_piece: 'Open piece', code_note: 'Enter the code printed on the warehouse tag, for example RW-0041.', code_invalid: 'Enter a code like RW-0041.',
    footer_line: 'Rooted by nature. Chosen by you.', footer_explore: 'Explore', footer_contact: 'Contact',
    mockup_note: 'Review version: pieces, sizes, prices and contact details are samples. Piece photos are real warehouse photos; wood species are not yet confirmed.',
    contact_pending: 'Review version: LINE and phone will open at launch.',
    image_viewer: 'Photo viewer', prev_photo: 'Previous photo', next_photo: 'Next photo',
    available: 'Available', reserved: 'Reserved', sold: 'Sold',
    table: 'Tables', bench: 'Benches', stump: 'Stumps', slab: 'Slabs', decor: 'Objects', all: 'All',
    view_collection: 'View collection', plan_visit: 'Plan a visit', view_all: 'View all',
    search_label: 'Search pieces', search_placeholder: 'Search name or code', type_label: 'Type',
    status_label: 'Status', status_all: 'Any status', price_label: 'Price', price_all: 'Any price', price_under10: 'Under ฿10,000', price_10_25: '฿10,000 to ฿25,000', price_over25: 'Over ฿25,000',
    sort_label: 'Sort', sort_available: 'Available first', sort_price_asc: 'Price: low to high', sort_price_desc: 'Price: high to low', sort_code: 'Code',
    filters: 'Filters', show_n: 'Show {n}', clear: 'Clear', clear_filters: 'Clear filters',
    count_one: '{n} piece', count_many: '{n} pieces', showing: 'Showing {count}', show_more: 'Show more pieces ({n} more)', no_results: 'No pieces match these filters.',
    photos_of: 'Photos of {code}', slide_of: '{i} of {n}', enlarge: 'Enlarge photo {i} of {n}', show_photo: 'Show photo {i} of {n}',
    visualisation: 'AI visualisation', warehouse_photo: 'Warehouse photo',
    line_ask: 'Ask about this piece on LINE', line_ask_reserved: 'Ask if this piece becomes available', line_similar: 'Ask about similar pieces', line_bar: 'Ask on LINE', line_chat: 'Chat on LINE',
    see_available: 'See available pieces', call: 'Call', call_number: 'Call {phone}', line_more: 'Request more photos or a video',
    line_includes: 'Your LINE message will include the code {code}.', sold_note: 'This piece has found its home.', reserved_note: 'Someone has reserved this piece. Ask us and we will tell you if it becomes available.',
    copy_link: 'Copy link', link_copied: 'Link copied', visit_warehouse: 'Visit the warehouse', contact_about: 'Contact about {code}',
    fact_size: 'Size (cm)', fact_weight: 'Approx. weight', fact_carry: 'To carry', fact_delivery: 'Delivery', delivery_value: 'Arranged on request',
    weight_value: '{n} kg', carriers_one: '{n} person', carriers_many: '{n} people', dims_line: 'L {l} × W {w} × H {h} cm', card_dims: '{l} × {w} × {h} cm',
    about_piece: 'About this piece', details_title: 'Dimensions & details', wood: 'Wood', type: 'Type', width: 'Width', length: 'Length', height: 'Height', weight: 'Approx. weight', carriers: 'People to carry', cm: '{n} cm',
    delivery: 'Delivery & handling', delivery_note: 'This piece weighs about {kg} kg and takes {people} to carry. We can help arrange transport. Message us on LINE for a delivery quote to your area.', delivery_quote: 'Ask for a delivery quote',
    how_buying: 'How buying works', buy_step1: 'Message us on LINE with the piece code. We reply with the details and can reserve the piece for you.', buy_step2: 'Visit the warehouse in Bang Sai to see it in person, or confirm with extra photos and a video.', buy_step3: 'We help arrange delivery to your home.',
    sample_note: 'Sample listing for review: size, weight and price are placeholders.',
    related: 'More pieces like this', breadcrumb: 'Breadcrumb', back_collection: 'Collection',
    unknown_title: 'We can’t find this piece yet', unknown_tag_text: 'This tag may be newer than our online catalogue. Ask us on LINE and we will send photos and the price.', unknown_text: 'The code may be mistyped. Check the tag and try again.',
    ask_code_line: 'Ask about {code} on LINE', try_code_label: 'Try another code', browse_collection: 'Browse the collection', available_now: 'Available now',
    msg_ask: 'Hello, I am interested in piece {code}, {name} ({price}).', msg_reserved: 'Hello, please let me know if piece {code}, {name}, becomes available.', msg_similar: 'Hello, piece {code} ({name}) is sold. Do you have similar pieces?',
    msg_more: 'Hello, could you share more photos or a video of piece {code}, {name}?', msg_delivery: 'Hello, could you quote delivery for piece {code}, {name}, to my area?', msg_general: 'Hello RAAKRAK, I would like to ask about your pieces.',
    msg_visit: 'Hello, I would like to visit the warehouse in Bang Sai. When can I come?', msg_unknown: 'Hello, I found tag {code} but it is not on the website yet. Could you send photos and the price?',
    address: 'Address', address_text: 'Bang Sai District (บางไทร), Phra Nakhon Si Ayutthaya 13190, Thailand', address_short: 'Bang Sai, Ayutthaya',
    get_directions: 'Get directions', open_maps: 'Open in Google Maps', copy_address: 'Copy address', address_copied: 'Address copied',
    hours: 'Opening hours', hours_tbc: 'To be confirmed', map_title: 'RAAKRAK warehouse on Google Maps', map_fallback: 'Map not showing?', map_loading: 'Loading map…'
  },
  th: {
    skip: 'ข้ามไปยังเนื้อหา', nav_home: 'หน้าแรก', nav_collection: 'ชิ้นงาน', nav_craft: 'งานช่าง', nav_stories: 'เรื่องราว', nav_visit: 'เยี่ยมชม', nav_notfound: 'ไม่พบหน้า',
    find_code: 'ค้นหาชิ้นงาน', find_code_aria: 'ค้นหาชิ้นงานจากรหัส', switch_lang: 'Switch to English', open_menu: 'เปิดเมนู', close_menu: 'ปิดเมนู', close: 'ปิด',
    qr_lookup: 'ค้นหาจากคิวอาร์ / รหัส', find_code_title: 'ค้นหาชิ้นงานของคุณ', piece_code: 'รหัสชิ้นงาน', open_piece: 'เปิดชิ้นงาน', code_note: 'กรอกรหัสที่พิมพ์อยู่บนป้ายสินค้าในโกดัง เช่น RW-0041', code_invalid: 'กรอกรหัสในรูปแบบ RW-0041',
    footer_line: 'ธรรมชาติสร้าง คุณเป็นผู้เลือก', footer_explore: 'เมนู', footer_contact: 'ติดต่อ',
    mockup_note: 'เวอร์ชันสำหรับรีวิว: ชิ้นงาน ขนาด ราคา และช่องทางติดต่อเป็นข้อมูลตัวอย่าง ภาพชิ้นงานถ่ายจริงในโกดัง ส่วนชนิดไม้ยังรอยืนยัน',
    contact_pending: 'เวอร์ชันรีวิว: ช่องทางไลน์และโทรศัพท์จะเปิดใช้เมื่อเปิดร้านจริง',
    image_viewer: 'ดูภาพ', prev_photo: 'ภาพก่อนหน้า', next_photo: 'ภาพถัดไป',
    available: 'พร้อมขาย', reserved: 'ติดจอง', sold: 'ขายแล้ว',
    table: 'โต๊ะ', bench: 'ม้านั่ง', stump: 'ตอไม้', slab: 'แผ่นไม้', decor: 'ของตกแต่ง', all: 'ทั้งหมด',
    view_collection: 'ดูชิ้นงานทั้งหมด', plan_visit: 'วางแผนมาโกดัง', view_all: 'ดูทั้งหมด',
    search_label: 'ค้นหาชิ้นงาน', search_placeholder: 'ค้นหาจากชื่อหรือรหัส', type_label: 'ประเภท',
    status_label: 'สถานะ', status_all: 'ทุกสถานะ', price_label: 'ราคา', price_all: 'ทุกช่วงราคา', price_under10: 'ต่ำกว่า ฿10,000', price_10_25: '฿10,000 ถึง ฿25,000', price_over25: 'มากกว่า ฿25,000',
    sort_label: 'เรียงลำดับ', sort_available: 'พร้อมขายก่อน', sort_price_asc: 'ราคา: น้อยไปมาก', sort_price_desc: 'ราคา: มากไปน้อย', sort_code: 'รหัส',
    filters: 'ตัวกรอง', show_n: 'แสดง {n}', clear: 'ล้าง', clear_filters: 'ล้างตัวกรอง',
    count_one: '{n} ชิ้น', count_many: '{n} ชิ้น', showing: 'แสดง {count}', show_more: 'ดูเพิ่มเติม (อีก {n} ชิ้น)', no_results: 'ไม่พบชิ้นงานที่ตรงกับตัวกรอง',
    photos_of: 'ภาพของ {code}', slide_of: '{i} จาก {n}', enlarge: 'ขยายภาพที่ {i} จาก {n}', show_photo: 'แสดงภาพที่ {i} จาก {n}',
    visualisation: 'ภาพจำลอง AI', warehouse_photo: 'ภาพถ่ายจากโกดัง',
    line_ask: 'ทักไลน์ถามชิ้นนี้', line_ask_reserved: 'สอบถามคิวชิ้นนี้ทางไลน์', line_similar: 'ถามหาชิ้นที่คล้ายกัน', line_bar: 'ทักไลน์', line_chat: 'แชตทางไลน์',
    see_available: 'ดูชิ้นที่พร้อมขาย', call: 'โทร', call_number: 'โทร {phone}', line_more: 'ขอดูรูป / วิดีโอเพิ่มเติม',
    line_includes: 'ข้อความไลน์จะแนบรหัส {code} ให้อัตโนมัติ', sold_note: 'ชิ้นนี้มีเจ้าของใหม่แล้ว', reserved_note: 'ชิ้นนี้มีผู้จองไว้แล้ว ทักมาถามได้ หากชิ้นนี้ว่างเราจะแจ้งให้ทราบ',
    copy_link: 'คัดลอกลิงก์', link_copied: 'คัดลอกลิงก์แล้ว', visit_warehouse: 'มาดูที่โกดัง', contact_about: 'ติดต่อเรื่อง {code}',
    fact_size: 'ขนาด (ซม.)', fact_weight: 'น้ำหนักประมาณ', fact_carry: 'คนยก', fact_delivery: 'การจัดส่ง', delivery_value: 'ช่วยจัดรถได้',
    weight_value: '{n} กก.', carriers_one: '{n} คน', carriers_many: '{n} คน', dims_line: 'ยาว {l} × กว้าง {w} × สูง {h} ซม.', card_dims: '{l} × {w} × {h} ซม.',
    about_piece: 'เรื่องราวของชิ้นนี้', details_title: 'ขนาดและรายละเอียด', wood: 'ชนิดไม้', type: 'ประเภท', width: 'กว้าง', length: 'ยาว', height: 'สูง', weight: 'น้ำหนักประมาณ', carriers: 'จำนวนคนยก', cm: '{n} ซม.',
    delivery: 'การจัดส่งและการขนย้าย', delivery_note: 'ชิ้นนี้หนักประมาณ {kg} กก. ต้องใช้คนยก {people} เราช่วยประสานรถขนส่งให้ได้ ทักไลน์เพื่อขอราคาค่าส่งถึงพื้นที่ของคุณ', delivery_quote: 'สอบถามค่าจัดส่ง',
    how_buying: 'ขั้นตอนการซื้อ', buy_step1: 'ทักไลน์พร้อมรหัสชิ้นงาน เราจะส่งรายละเอียดให้ และจองชิ้นนี้ไว้ให้ได้', buy_step2: 'มาดูของจริงที่โกดังบางไทร หรือขอดูรูปและวิดีโอเพิ่มก่อนตัดสินใจ', buy_step3: 'เราช่วยประสานการจัดส่งถึงบ้านคุณ',
    sample_note: 'ข้อมูลตัวอย่างสำหรับรีวิว: ขนาด น้ำหนัก และราคายังไม่ใช่ข้อมูลจริง',
    related: 'ชิ้นงานใกล้เคียง', breadcrumb: 'เส้นทางหน้า', back_collection: 'ชิ้นงาน',
    unknown_title: 'ยังไม่พบชิ้นงานนี้', unknown_tag_text: 'ป้ายนี้อาจใหม่กว่าข้อมูลบนเว็บไซต์ ทักไลน์มาได้เลย เราจะส่งรูปและราคาให้',
    unknown_text: 'รหัสอาจพิมพ์ไม่ถูกต้อง ลองตรวจดูป้ายแล้วค้นหาอีกครั้ง',
    ask_code_line: 'ทักไลน์ถามรหัส {code}', try_code_label: 'ลองค้นหารหัสอื่น', browse_collection: 'ดูชิ้นงานทั้งหมด', available_now: 'พร้อมขายตอนนี้',
    msg_ask: 'สวัสดีครับ/ค่ะ สนใจชิ้นงาน {code} {name} ({price})', msg_reserved: 'สวัสดีครับ/ค่ะ ถ้าชิ้นงาน {code} {name} ว่าง รบกวนแจ้งด้วยนะครับ/คะ', msg_similar: 'สวัสดีครับ/ค่ะ ชิ้นงาน {code} ({name}) ขายแล้ว มีชิ้นที่คล้ายกันไหมครับ/คะ',
    msg_more: 'สวัสดีครับ/ค่ะ ขอดูรูปหรือวิดีโอเพิ่มเติมของชิ้นงาน {code} {name}', msg_delivery: 'สวัสดีครับ/ค่ะ ขอสอบถามค่าจัดส่งชิ้นงาน {code} {name} ถึงพื้นที่ของฉัน', msg_general: 'สวัสดีครับ/ค่ะ ขอสอบถามเรื่องชิ้นงานของ RAAKRAK',
    msg_visit: 'สวัสดีครับ/ค่ะ อยากไปดูชิ้นงานที่โกดังบางไทร สะดวกวันไหนบ้างครับ/คะ', msg_unknown: 'สวัสดีครับ/ค่ะ เจอป้ายรหัส {code} แต่ยังไม่มีบนเว็บไซต์ ขอรูปและราคาด้วยครับ/ค่ะ',
    address: 'ที่อยู่', address_text: 'อ.บางไทร จ.พระนครศรีอยุธยา 13190', address_short: 'บางไทร พระนครศรีอยุธยา',
    get_directions: 'นำทาง', open_maps: 'เปิดใน Google Maps', copy_address: 'คัดลอกที่อยู่', address_copied: 'คัดลอกที่อยู่แล้ว',
    hours: 'เวลาเปิด', hours_tbc: 'รอยืนยัน', map_title: 'ตำแหน่งโกดัง RAAKRAK บน Google Maps', map_fallback: 'แผนที่ไม่แสดง?', map_loading: 'กำลังโหลดแผนที่…'
  }
};

const content = {
  en: {
    home: {
      eyebrow: 'One-of-a-kind root wood · Thailand', title1: 'Sculpted once.', title2: 'Chosen forever.',
      intro: 'Furniture and objects shaped first by earth, water and time. Every code on our tags belongs to one physical piece.',
      heroCaption: 'Warehouse photo, Bang Sai, Ayutthaya', codeTitle: 'Find your piece by code',
      availableNote: 'Every piece is a single form. When it is sold, it is gone.',
      typesTitle: 'Shop by type', typesNote: 'Start with what you need, then choose by shape and grain.',
      warehouseTitle: 'From the warehouse', warehouseNote: 'Real photos from our warehouse and outdoor shed in Bang Sai.',
      captions: ['Root ball, taller than a person', 'Benches under the outdoor shed', 'Root tables in the main hall'],
      povLabel: 'Our point of view', pov: 'No model numbers to reorder and no identical twins. Each RAAKRAK piece is a single meeting between a form nature made once and the room you make your own.'
    },
    collection: { title: 'Collection', intro: 'One code, one piece. Sold pieces stay visible as our archive.' },
    visit: {
      title: 'Visit the warehouse', intro: 'Walk around hundreds of one-of-a-kind pieces in Bang Sai, Ayutthaya.',
      beforeTitle: 'Before you come', beforeText: 'Please message us one day ahead so we can prepare the pieces you would like to see.',
      hoursNote: 'Opening hours will be published once they are confirmed. Please message us before you come.',
      photoCaption: 'The outdoor shed at our Bang Sai warehouse (warehouse photo)', photoCaption2: 'Root tables and stumps in the main hall (warehouse photo)'
    },
    craft: { eyebrow: 'Form before furniture', title: 'We follow what the wood already knows.', intro: 'Our work is an act of attention: reading weight, grain, balance and the traces of a tree’s former life.', processLabel: 'How we work', steps: [
      ['Read the form', 'We rotate, stand and study each root before deciding what it can become.'],
      ['Refine the touch', 'Only the surfaces meant for hands and daily use are levelled and finished.'],
      ['Preserve the trace', 'Grain shifts, age marks and natural openings are kept rather than hidden.']
    ]},
    stories: { eyebrow: 'Field notes', title: 'Stories held in grain.', intro: 'Notes from the warehouse about choosing and living with natural wood.', cards: [
      ['The grain remembers', 'Growth rings and mineral traces are a record of seasons. We read them as part of the piece.', 'images/scenes/detail-teak-grain.jpg'],
      ['From root to room', 'The journey begins by finding balance, not by forcing symmetry.', 'images/scenes/warehouse-root-on-pallet.jpg']
    ]}
  },
  th: {
    home: {
      eyebrow: 'รากไม้หนึ่งเดียว · ประเทศไทย', title1: 'ธรรมชาติสร้างครั้งเดียว', title2: 'คุณเลือกเก็บไว้ตลอดไป',
      intro: 'เฟอร์นิเจอร์และของตกแต่งที่ดิน น้ำ และเวลาเป็นผู้ปั้นรูปทรง ทุกรหัสบนป้ายหมายถึงชิ้นงานจริงเพียงชิ้นเดียว',
      heroCaption: 'ภาพถ่ายจากโกดัง บางไทร พระนครศรีอยุธยา', codeTitle: 'ค้นหาชิ้นงานจากรหัส',
      availableNote: 'ทุกชิ้นมีเพียงหนึ่งเดียว ขายแล้วจะไม่มีชิ้นเหมือนกันอีก',
      typesTitle: 'เลือกตามประเภท', typesNote: 'เริ่มจากการใช้งานที่ต้องการ แล้วค่อยเลือกจากรูปทรงและลายไม้',
      warehouseTitle: 'จากโกดังของเรา', warehouseNote: 'ภาพถ่ายจริงจากโกดังและโรงเรือนด้านนอกที่บางไทร',
      captions: ['รากไม้ก้อนใหญ่ สูงกว่าคน', 'ม้านั่งใต้โรงเรือนด้านนอก', 'โต๊ะรากไม้ในโถงหลัก'],
      povLabel: 'มุมมองของเรา', pov: 'ไม่มีรุ่นให้สั่งซ้ำ และไม่มีชิ้นไหนเหมือนกัน ทุกชิ้นของ RAAKRAK คือการพบกันครั้งเดียวระหว่างรูปทรงที่ธรรมชาติสร้างไว้ กับพื้นที่ที่คุณเรียกว่าบ้าน'
    },
    collection: { title: 'ชิ้นงาน', intro: 'หนึ่งรหัส หนึ่งชิ้น ชิ้นที่ขายแล้วยังแสดงไว้เป็นคลังผลงาน' },
    visit: {
      title: 'มาเยี่ยมชมโกดัง', intro: 'เดินดูชิ้นงานที่ไม่ซ้ำกันนับร้อยชิ้น ที่บางไทร พระนครศรีอยุธยา',
      beforeTitle: 'ก่อนเดินทาง', beforeText: 'ทักมาบอกล่วงหน้าหนึ่งวัน เราจะได้เตรียมชิ้นงานที่คุณอยากดูไว้ให้',
      hoursNote: 'จะแจ้งเวลาเปิดเมื่อยืนยันแล้ว กรุณาทักมาก่อนเดินทาง',
      photoCaption: 'โรงเรือนด้านนอกของโกดังบางไทร (ภาพถ่ายจากโกดัง)', photoCaption2: 'โต๊ะรากไม้และตอไม้ในโถงหลัก (ภาพถ่ายจากโกดัง)'
    },
    craft: { eyebrow: 'มองรูปทรงก่อนการใช้งาน', title: 'เราเดินตามสิ่งที่ไม้บอกไว้', intro: 'งานของเราเริ่มจากการตั้งใจมองน้ำหนัก เสี้ยนไม้ สมดุล และร่องรอยจากชีวิตเดิมของต้นไม้', processLabel: 'วิธีทำงาน', steps: [
      ['อ่านรูปทรง', 'เราหมุน ตั้ง และใช้เวลากับรากแต่ละชิ้นก่อนตัดสินใจว่าจะเป็นอะไร'],
      ['แต่งผิวสัมผัส', 'แต่งเฉพาะจุดที่มือสัมผัสและใช้งานจริงเท่านั้น'],
      ['เก็บร่องรอย', 'เสี้ยนที่เปลี่ยนทิศ รอยตามวัย และช่องเปิดธรรมชาติถูกเก็บไว้ ไม่ปิดบัง']
    ]},
    stories: { eyebrow: 'บันทึกจากโกดัง', title: 'เรื่องราวที่อยู่ในลายไม้', intro: 'บันทึกเรื่องการเลือกและการอยู่ร่วมกับไม้ธรรมชาติ', cards: [
      ['ลายไม้จดจำเวลา', 'วงปีและรอยแร่คือบันทึกของฤดูกาล เราอ่านสิ่งเหล่านี้เป็นส่วนหนึ่งของชิ้นงาน', 'images/scenes/detail-teak-grain.jpg'],
      ['จากรากไม้สู่ห้อง', 'การเดินทางเริ่มจากการหาสมดุล ไม่ใช่บังคับให้สมมาตร', 'images/scenes/warehouse-root-on-pallet.jpg']
    ]}
  }
};

const readLang = () => { try { const saved = localStorage.getItem('raakrak-lang'); return ['en', 'th'].includes(saved) ? saved : 'en'; } catch { return 'en'; } };
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  items: [],
  lang: readLang(),
  filters: { query: '', type: 'all', price: 'all', status: 'all', sort: 'available' },
  visible: BATCH,
  gallery: [],
  galleryGo: null,
  lightboxIndex: 0,
  lightboxOpener: null,
  codeOpener: null
};

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const tr = key => copy[state.lang][key] ?? copy.en[key] ?? key;
const fmt = (key, vars = {}) => tr(key).replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
const cc = section => content[state.lang][section];
const itemText = (item, key) => item[`${key}_${state.lang}`] || item[`${key}_en`] || '';
const money = value => `฿${Number(value).toLocaleString('en-US')}`;
const countText = n => fmt(n === 1 ? 'count_one' : 'count_many', { n });
const findItem = code => state.items.find(entry => entry.code.toUpperCase() === String(code || '').toUpperCase());
const galleryOf = item => [...new Set([item.hero, ...(item.photos || [])].filter(Boolean))];
const isGenerated = src => /\/generated\/|\/scenes\/studio-/.test(src);
const photoLabel = src => tr(isGenerated(src) ? 'visualisation' : 'warehouse_photo');
const badge = status => `<span class="badge badge--${status}">${tr(status)}</span>`;
const dimsVars = item => ({ l: item.length, w: item.width, h: item.height });
const messageVars = item => ({ code: item.code, name: itemText(item, 'name'), price: money(item.price) });

const lineLink = (message, cls, label, iconName = 'chat', iconCls = '') =>
  `<a class="${cls}" href="${esc(lineHref(message))}" ${contactAttrs(CONTACT.lineId, true)}>${icon(iconName, iconCls)}<span>${label}</span></a>`;
const callLink = (cls, iconCls = '') =>
  `<a class="${cls}" href="${esc(telHref())}" ${contactAttrs(CONTACT.phone)}>${icon('phone', iconCls)}<span>${CONTACT.phone ? fmt('call_number', { phone: CONTACT.phone }) : tr('call')}</span></a>`;

function normalizeCode(value) {
  const raw = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  const match = raw.match(/^RW-?(\d{1,4})$/);
  return match ? `RW-${match[1].padStart(4, '0')}` : raw;
}

/* ---------- Shared components ---------- */

function productCard(item, eager = false) {
  const name = itemText(item, 'name');
  return `<a class="card${item.status === 'sold' ? ' is-sold' : ''}" href="#/item/${esc(item.code)}">
    <div class="card-media"><img src="${esc(item.hero)}" alt="${esc(`${item.code} ${name}`)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">${badge(item.status)}</div>
    <p class="card-code">${esc(item.code)} · ${esc(itemText(item, 'type'))}</p>
    <h3 class="card-name">${esc(name)}</h3>
    <p class="card-dims">${fmt('card_dims', dimsVars(item))}</p>
    <p class="card-price">${money(item.price)}</p>
  </a>`;
}

const cardGrid = (items, cls = '') => `<div class="card-grid ${cls}">${items.map(item => productCard(item)).join('')}</div>`;
const byCode = (a, b) => a.code.localeCompare(b.code);
const availableFirst = (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || byCode(a, b);

function codeForm(id, extraClass = '') {
  return `<form class="code-form ${extraClass}" data-code-form novalidate>
    <label class="sr-only" for="${id}">${tr('piece_code')}</label>
    <span class="code-form-field">${icon('search')}<input id="${id}" type="text" inputmode="text" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="RW-0041"></span>
    <button class="btn btn--primary" type="submit"><span>${tr('open_piece')}</span>${icon('arrow-right')}</button>
  </form>`;
}

const sectionHead = (title, note = '', link = '') => `<div class="section-head"><div><h2 class="section-title">${title}</h2>${note ? `<p class="section-note">${note}</p>` : ''}</div>${link}</div>`;
const viewAllLink = href => `<a class="btn btn--ghost" href="${href}"><span>${tr('view_all')}</span>${icon('arrow-right')}</a>`;

/* ---------- Pages ---------- */

function homePage() {
  const c = cc('home');
  const available = state.items.filter(item => item.status === 'available').sort(byCode).slice(0, 4);
  const count = type => state.items.filter(item => item.type_key === type).length;
  const photos = [SCENES.rootBall, SCENES.shed, SCENES.tables];
  return `<article class="page home-page">
    <section class="home-hero container">
      <figure class="home-hero-media">
        <img src="${SCENES.homeHero}" alt="${esc(c.heroCaption)}" width="1200" height="1600" fetchpriority="high" decoding="async">
        <figcaption>${c.heroCaption}</figcaption>
      </figure>
      <div class="home-hero-copy">
        <p class="eyebrow">${c.eyebrow}</p>
        <h1 class="display"><span>${c.title1}</span> <span class="display-accent">${c.title2}</span></h1>
        <p class="lead">${c.intro}</p>
        <div class="button-row">
          <a class="btn btn--primary btn--lg" href="#/collection"><span>${tr('view_collection')}</span>${icon('arrow-right')}</a>
          <a class="btn btn--secondary btn--lg" href="#/visit">${icon('map-pin')}<span>${tr('plan_visit')}</span></a>
        </div>
        <div class="code-box"><p class="code-box-title">${c.codeTitle}</p>${codeForm('home-code')}</div>
      </div>
    </section>

    <section class="section container">
      ${sectionHead(tr('available_now'), c.availableNote, viewAllLink('#/collection?status=available'))}
      ${cardGrid(available)}
    </section>

    <section class="types-band on-dark">
      <div class="container">
        ${sectionHead(c.typesTitle, c.typesNote)}
        <div class="type-list">${TYPES.map(type => `<a class="type-row" href="#/collection?type=${type}"><span class="type-name">${tr(type)}</span><span class="type-count">${countText(count(type))}</span>${icon('arrow-right', 'icon--24')}</a>`).join('')}</div>
      </div>
    </section>

    <section class="section container">
      ${sectionHead(c.warehouseTitle, c.warehouseNote, `<a class="btn btn--ghost" href="#/visit"><span>${tr('visit_warehouse')}</span>${icon('arrow-right')}</a>`)}
      <div class="photo-row">${photos.map((src, i) => `<figure class="photo-tile"><img src="${src}" alt="${esc(c.captions[i])}" width="1200" height="1600" loading="lazy" decoding="async"><figcaption>${c.captions[i]}</figcaption></figure>`).join('')}</div>
    </section>

    <section class="section container pov">
      <p class="eyebrow">${c.povLabel}</p>
      <p class="pov-text">${c.pov}</p>
    </section>
  </article>`;
}

function collectionPage(queryString = '') {
  // The URL is the source of truth (?type= ?status= deep links, plus price/sort/q kept by syncCollectionUrl).
  const params = new URLSearchParams(queryString);
  state.filters = {
    query: params.get('q') || '',
    type: TYPES.includes(params.get('type')) ? params.get('type') : 'all',
    status: STATUSES.includes(params.get('status')) ? params.get('status') : 'all',
    price: params.get('price') in PRICE_RANGES ? params.get('price') : 'all',
    sort: SORTS.includes(params.get('sort')) ? params.get('sort') : 'available'
  };
  state.visible = BATCH;
  const c = cc('collection');
  const f = state.filters;
  const option = (value, label, current) => `<option value="${value}"${value === current ? ' selected' : ''}>${label}</option>`;
  const statusOptions = option('all', tr('status_all'), f.status) + STATUSES.map(s => option(s, tr(s), f.status)).join('');
  const priceOptions = option('all', tr('price_all'), f.price) + Object.keys(PRICE_RANGES).map(key => option(key, tr(`price_${key.replace('-', '_')}`), f.price)).join('');
  const sortOptions = SORTS.map(key => option(key, tr(`sort_${key.replace('-', '_')}`), f.sort)).join('');
  const select = (id, label, options, cls = '') => `<label class="select-wrap ${cls}"><span class="sr-only">${label}</span><select id="${id}">${options}</select>${icon('chevron-down')}</label>`;
  const radio = (name, value, label, current, cls) => `<label class="${cls}"><input type="radio" name="${name}" value="${value}"${value === current ? ' checked' : ''}><span>${label}</span></label>`;
  return `<article class="page collection-page">
    <header class="page-head container">
      <h1 class="page-title">${c.title}</h1>
      <p class="page-intro">${c.intro}</p>
    </header>
    <div class="tools" id="tools">
      <div class="tools-inner container">
        <label class="search-field">${icon('search')}<span class="sr-only">${tr('search_label')}</span><input id="catalog-search" type="search" value="${esc(f.query)}" placeholder="${tr('search_placeholder')}" autocomplete="off"></label>
        <div class="chip-row" role="group" aria-label="${tr('type_label')}">${['all', ...TYPES].map(type => `<button class="chip" type="button" data-type="${type}" aria-pressed="${f.type === type}">${tr(type)}</button>`).join('')}</div>
        <div class="tool-selects">
          ${select('status-filter', tr('status_label'), statusOptions, 'desktop-only')}
          ${select('price-filter', tr('price_label'), priceOptions, 'desktop-only')}
          <button class="btn btn--secondary mobile-only" id="open-filters" type="button" aria-haspopup="dialog">${icon('sliders')}<span id="filters-label">${tr('filters')}</span></button>
          ${select('sort-select', tr('sort_label'), sortOptions)}
        </div>
      </div>
    </div>
    <div class="result-bar container"><p id="result-count" aria-live="polite"></p><button class="btn btn--ghost" id="clear-filters" type="button" hidden>${icon('close')}<span>${tr('clear_filters')}</span></button></div>
    <section class="container" aria-labelledby="result-count"><div class="card-grid catalog-grid" id="catalog-grid"></div><div class="show-more" id="show-more"></div></section>
    <dialog class="sheet" id="filter-sheet" aria-labelledby="sheet-title">
      <div class="sheet-head"><h2 id="sheet-title">${tr('filters')}</h2><button class="icon-btn" type="button" data-sheet-close aria-label="${tr('close')}">${icon('close', 'icon--24')}</button></div>
      <fieldset class="sheet-group"><legend>${tr('status_label')}</legend><div class="radio-chips">${radio('sheet-status', 'all', tr('status_all'), f.status, 'radio-chip')}${STATUSES.map(s => radio('sheet-status', s, tr(s), f.status, 'radio-chip')).join('')}</div></fieldset>
      <fieldset class="sheet-group"><legend>${tr('price_label')}</legend><div class="radio-list">${radio('sheet-price', 'all', tr('price_all'), f.price, 'radio-row')}${Object.keys(PRICE_RANGES).map(key => radio('sheet-price', key, tr(`price_${key.replace('-', '_')}`), f.price, 'radio-row')).join('')}</div></fieldset>
      <div class="sheet-foot"><button class="btn btn--ghost" type="button" id="sheet-clear">${tr('clear')}</button><button class="btn btn--primary" type="button" id="sheet-apply" data-sheet-close></button></div>
    </dialog>
  </article>`;
}

function itemPage(item) {
  const name = itemText(item, 'name');
  const photos = galleryOf(item);
  const n = photos.length;
  const vars = messageVars(item);
  const sold = item.status === 'sold';
  const related = state.items
    .filter(entry => entry.code !== item.code)
    .map(entry => ({ entry, score: (entry.type_key === item.type_key ? 2 : 0) + (entry.wood_en === item.wood_en ? 1 : 0) }))
    .sort((a, b) => STATUS_ORDER[a.entry.status] - STATUS_ORDER[b.entry.status] || b.score - a.score || byCode(a.entry, b.entry))
    .slice(0, 4).map(({ entry }) => entry);
  const carriersText = fmt(item.carriers === 1 ? 'carriers_one' : 'carriers_many', { n: item.carriers });
  const weightText = fmt('weight_value', { n: item.weight_kg });
  const seeAvailableHref = `#/collection?status=available&type=${item.type_key}`;

  const slides = photos.map((src, i) => `<figure class="gallery-slide" aria-label="${fmt('slide_of', { i: i + 1, n })}">
      <button class="gallery-open" type="button" data-gallery-index="${i}" aria-label="${fmt('enlarge', { i: i + 1, n })}">
        <img src="${esc(src)}" alt="${esc(`${item.code} ${name}, ${photoLabel(src)} ${i + 1}`)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      </button>
      ${isGenerated(src) ? `<figcaption class="photo-label">${tr('visualisation')}</figcaption>` : ''}
    </figure>`).join('');
  const thumbs = n > 1 ? `<div class="gallery-thumbs">${photos.map((src, i) => `<button type="button" data-thumb="${i}" aria-label="${fmt('show_photo', { i: i + 1, n })}" aria-current="${i === 0}"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>` : '';

  let contact;
  if (sold) {
    contact = `<a class="btn btn--primary btn--lg btn--block" href="${seeAvailableHref}"><span>${tr('see_available')}</span>${icon('arrow-right', 'icon--24')}</a>
      ${lineLink(fmt('msg_similar', vars), 'btn btn--ghost btn--block', tr('line_similar'))}`;
  } else {
    const reserved = item.status === 'reserved';
    contact = `${lineLink(fmt(reserved ? 'msg_reserved' : 'msg_ask', vars), 'btn btn--contact btn--lg btn--block', tr(reserved ? 'line_ask_reserved' : 'line_ask'), 'chat', 'icon--24')}
      ${callLink('btn btn--secondary btn--block')}
      ${lineLink(fmt('msg_more', vars), 'btn btn--ghost btn--block btn--start', tr('line_more'), 'photos')}
      <p class="contact-note">${fmt('line_includes', { code: item.code })}</p>`;
  }

  return `<article class="page item-page">
    <nav class="breadcrumb container" aria-label="${tr('breadcrumb')}">
      <a class="btn btn--ghost btn--back" href="#/collection">${icon('arrow-left')}<span>${tr('back_collection')}</span></a>
      <span class="crumb-sep" aria-hidden="true">/</span><a class="crumb" href="#/collection?type=${item.type_key}">${tr(item.type_key)}</a>
      <span class="crumb-sep" aria-hidden="true">/</span><span class="crumb crumb-current" aria-current="page">${esc(item.code)}</span>
    </nav>
    <div class="piece container">
      <div class="piece-media">
        <section class="gallery" aria-label="${fmt('photos_of', { code: item.code })}" data-count="${n}">
          <div class="gallery-track" tabindex="0">${slides}</div>
          ${n > 1 ? `<button class="icon-btn gallery-nav gallery-prev" type="button" aria-label="${tr('prev_photo')}" disabled>${icon('chevron-left', 'icon--24')}</button>
          <button class="icon-btn gallery-nav gallery-next" type="button" aria-label="${tr('next_photo')}">${icon('chevron-right', 'icon--24')}</button>` : ''}
          <p class="gallery-count">${icon('image')}<span class="gallery-count-text">1 / ${n}</span></p>
        </section>
        ${thumbs}
      </div>

      <aside class="buybox${sold ? ' is-sold' : ''}" aria-labelledby="piece-name">
        <div class="piece-idline"><span class="code-chip">${esc(item.code)}</span>${badge(item.status)}</div>
        <h1 class="piece-name" id="piece-name">${esc(name)}</h1>
        <p class="piece-meta"><span>${esc(itemText(item, 'type'))}</span><span class="meta-wood">${esc(itemText(item, 'wood'))}</span><span class="meta-dims">${fmt('dims_line', dimsVars(item))}</span></p>
        <hr class="divider">
        <p class="piece-price">${money(item.price)}</p>
        ${sold ? `<p class="status-note">${tr('sold_note')}</p>` : item.status === 'reserved' ? `<p class="status-note">${tr('reserved_note')}</p>` : ''}
        <div class="contact-block">${contact}</div>
        <div class="share-row">
          <button class="btn btn--ghost" id="copy-link" type="button">${icon('link')}<span>${tr('copy_link')}</span></button>
          <a class="btn btn--ghost" href="#/visit">${icon('map-pin')}<span>${tr('visit_warehouse')}</span></a>
        </div>
      </aside>

      <div class="piece-body">
        <ul class="facts">
          <li>${icon('ruler', 'icon--24')}<span class="fact-label">${tr('fact_size')}</span><span class="fact-value">${item.length} × ${item.width} × ${item.height}</span></li>
          <li>${icon('weight', 'icon--24')}<span class="fact-label">${tr('fact_weight')}</span><span class="fact-value">${weightText}</span></li>
          <li>${icon('people', 'icon--24')}<span class="fact-label">${tr('fact_carry')}</span><span class="fact-value">${carriersText}</span></li>
          <li>${icon('truck', 'icon--24')}<span class="fact-label">${tr('fact_delivery')}</span><span class="fact-value">${tr('delivery_value')}</span></li>
        </ul>
        <section class="piece-story">
          <h2 class="section-title">${tr('about_piece')}</h2>
          <p>${esc(itemText(item, 'story'))}</p>
          <p class="sample-note">${tr('sample_note')}</p>
        </section>
        <div class="disclosures">
          <details class="disclosure" open>
            <summary><span>${tr('details_title')}</span>${icon('chevron-down')}</summary>
            <div><dl class="spec-table">
              <div><dt>${tr('wood')}</dt><dd>${esc(itemText(item, 'wood'))}</dd></div>
              <div><dt>${tr('type')}</dt><dd>${esc(itemText(item, 'type'))}</dd></div>
              <div><dt>${tr('length')}</dt><dd>${fmt('cm', { n: item.length })}</dd></div>
              <div><dt>${tr('width')}</dt><dd>${fmt('cm', { n: item.width })}</dd></div>
              <div><dt>${tr('height')}</dt><dd>${fmt('cm', { n: item.height })}</dd></div>
              <div><dt>${tr('weight')}</dt><dd>${weightText}</dd></div>
              <div><dt>${tr('carriers')}</dt><dd>${carriersText}</dd></div>
            </dl></div>
          </details>
          <details class="disclosure">
            <summary><span>${tr('delivery')}</span>${icon('chevron-down')}</summary>
            <div><p>${fmt('delivery_note', { kg: item.weight_kg, people: carriersText })}</p>${lineLink(fmt('msg_delivery', vars), 'btn btn--ghost', tr('delivery_quote'), 'truck')}</div>
          </details>
          <details class="disclosure">
            <summary><span>${tr('how_buying')}</span>${icon('chevron-down')}</summary>
            <div><ol class="steps">${['buy_step1', 'buy_step2', 'buy_step3'].map(key => `<li>${tr(key)}</li>`).join('')}</ol></div>
          </details>
        </div>
      </div>
    </div>

    <section class="section container related">
      ${sectionHead(tr('related'), '', viewAllLink(`#/collection?type=${item.type_key}`))}
      ${cardGrid(related)}
    </section>
  </article>`;
}

function actionBar(item) {
  const vars = messageVars(item);
  const label = `aria-label="${esc(fmt('contact_about', { code: item.code }))}"`;
  if (item.status === 'sold') {
    return `<nav class="action-bar" ${label}>
      <a class="btn btn--primary btn--bar" href="#/collection?status=available&type=${item.type_key}"><span>${tr('see_available')}</span>${icon('arrow-right')}</a>
      <a class="btn btn--secondary btn--bar btn--square" href="${esc(lineHref(fmt('msg_similar', vars)))}" ${contactAttrs(CONTACT.lineId, true)} aria-label="${tr('line_similar')}">${icon('chat', 'icon--24')}</a>
    </nav>`;
  }
  const message = fmt(item.status === 'reserved' ? 'msg_reserved' : 'msg_ask', vars);
  return `<nav class="action-bar" ${label}>
    ${lineLink(message, 'btn btn--contact btn--bar', tr('line_bar'))}
    <a class="btn btn--secondary btn--bar btn--call" href="${esc(telHref())}" ${contactAttrs(CONTACT.phone)}>${icon('phone')}<span>${tr('call')}</span></a>
  </nav>`;
}

function visitPage() {
  const c = cc('visit');
  return `<article class="page visit-page">
    <header class="page-head container">
      <h1 class="page-title">${c.title}</h1>
      <p class="page-intro">${c.intro}</p>
    </header>
    <div class="visit-grid container">
      <div class="visit-info">
        <section class="info-block">
          <h2 class="info-title">${icon('map-pin', 'icon--24')}<span>${tr('address')}</span></h2>
          <p class="address" id="visit-address">${tr('address_text')}</p>
          <div class="info-actions">
            <a class="btn btn--primary btn--lg btn--block" href="${PLACE.directionsHref}" target="_blank" rel="noopener">${icon('navigation', 'icon--24')}<span>${tr('get_directions')}</span></a>
            <div class="info-links">
              <a class="btn btn--ghost" href="${PLACE.openHref}" target="_blank" rel="noopener"><span>${tr('open_maps')}</span>${icon('arrow-up-right')}</a>
              <button class="btn btn--ghost" type="button" id="copy-address">${icon('copy')}<span>${tr('copy_address')}</span></button>
            </div>
          </div>
        </section>
        <section class="info-block">
          <h2 class="info-title">${icon('clock', 'icon--24')}<span>${tr('hours')}</span></h2>
          <p class="hours-value">${tr('hours_tbc')}</p>
          <p class="info-note">${c.hoursNote}</p>
        </section>
        <section class="info-block">
          <h2 class="info-title">${icon('chat', 'icon--24')}<span>${c.beforeTitle}</span></h2>
          <p>${c.beforeText}</p>
          <div class="button-row">
            ${lineLink(tr('msg_visit'), 'btn btn--contact btn--bar', tr('line_bar'))}
            ${callLink('btn btn--secondary btn--bar')}
          </div>
        </section>
      </div>
      <div class="visit-map">
        <div class="map-frame">
          <div class="map-fallback">${icon('map-pin', 'icon--24')}<p>${tr('map_loading')}</p><a class="btn btn--secondary" href="${PLACE.openHref}" target="_blank" rel="noopener"><span>${tr('open_maps')}</span>${icon('arrow-up-right')}</a></div>
          <iframe src="${PLACE.embedSrc}" title="${tr('map_title')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <p class="map-caption"><span>${tr('map_fallback')}</span> <a href="${PLACE.openHref}" target="_blank" rel="noopener">${tr('open_maps')}${icon('arrow-up-right')}</a></p>
      </div>
    </div>
    <section class="section container">
      <div class="visit-photos">
        <figure class="photo-tile"><img src="${SCENES.shed}" alt="${esc(c.photoCaption)}" width="1200" height="1600" loading="lazy" decoding="async"><figcaption>${c.photoCaption}</figcaption></figure>
        <figure class="photo-tile"><img src="${SCENES.hall}" alt="${esc(c.photoCaption2)}" width="1200" height="1600" loading="lazy" decoding="async"><figcaption>${c.photoCaption2}</figcaption></figure>
      </div>
    </section>
  </article>`;
}

function notFoundPage(code = '') {
  const normalized = normalizeCode(decodeURIComponent(code || ''));
  const looksLikeTag = /^RW-\d{4}$/.test(normalized);
  const available = state.items.filter(item => item.status === 'available').sort(byCode).slice(0, 4);
  return `<article class="page not-found">
    <div class="not-found-inner container">
      ${looksLikeTag ? `<p class="code-chip code-chip--lg">${esc(normalized)}</p>` : ''}
      <h1 class="page-title">${tr('unknown_title')}</h1>
      <p class="page-intro">${tr(looksLikeTag ? 'unknown_tag_text' : 'unknown_text')}</p>
      ${looksLikeTag ? lineLink(fmt('msg_unknown', { code: normalized }), 'btn btn--contact btn--lg btn--block', fmt('ask_code_line', { code: normalized }), 'chat', 'icon--24') : ''}
      <div class="code-box"><p class="code-box-title">${tr('try_code_label')}</p>${codeForm('notfound-code')}</div>
      <a class="btn btn--secondary btn--lg btn--block" href="#/collection"><span>${tr('browse_collection')}</span>${icon('arrow-right')}</a>
    </div>
    ${available.length ? `<section class="section container">${sectionHead(tr('available_now'), '', viewAllLink('#/collection?status=available'))}${cardGrid(available)}</section>` : ''}
  </article>`;
}

// Hidden routes (HIDDEN_ROUTES): kept for later, unreachable until their content is verified.
function craftPage() {
  const c = cc('craft');
  return `<article class="page"><header class="page-head container"><p class="eyebrow">${c.eyebrow}</p><h1 class="page-title">${c.title}</h1><p class="page-intro">${c.intro}</p></header>
    <section class="section container"><h2 class="section-title">${c.processLabel}</h2><ol class="steps">${c.steps.map(step => `<li><strong>${step[0]}</strong> ${step[1]}</li>`).join('')}</ol></section></article>`;
}

function storiesPage() {
  const c = cc('stories');
  return `<article class="page"><header class="page-head container"><p class="eyebrow">${c.eyebrow}</p><h1 class="page-title">${c.title}</h1><p class="page-intro">${c.intro}</p></header>
    <section class="section container"><div class="photo-row">${c.cards.map(card => `<figure class="photo-tile"><img src="${card[2]}" alt="" loading="lazy" decoding="async"><figcaption><strong>${card[0]}</strong><br>${card[1]}</figcaption></figure>`).join('')}</div></section></article>`;
}

/* ---------- Collection behaviour ---------- */

function filteredItems() {
  const { query, type, status, price, sort } = state.filters;
  const q = query.trim().toLowerCase();
  const list = state.items.filter(item => {
    const haystack = [item.code, item.name_en, item.name_th, item.wood_en, item.wood_th, item.type_en, item.type_th].join(' ').toLowerCase();
    return (!q || haystack.includes(q))
      && (type === 'all' || item.type_key === type)
      && (status === 'all' || item.status === status)
      && (price === 'all' || (PRICE_RANGES[price] && PRICE_RANGES[price](item.price)));
  });
  const sorters = {
    available: availableFirst,
    'price-asc': (a, b) => a.price - b.price || byCode(a, b),
    'price-desc': (a, b) => b.price - a.price || byCode(a, b),
    code: byCode
  };
  return list.sort(sorters[sort] || availableFirst);
}

function renderCollection() {
  const grid = $('#catalog-grid');
  if (!grid) return;
  const f = state.filters;
  const list = filteredItems();
  grid.innerHTML = list.length
    ? list.slice(0, state.visible).map((item, i) => productCard(item, i < 2)).join('')
    : `<div class="empty-state"><p>${tr('no_results')}</p><button class="btn btn--secondary" type="button" data-clear-filters>${icon('close')}<span>${tr('clear_filters')}</span></button></div>`;
  $('#result-count').textContent = fmt('showing', { count: countText(list.length) });
  const remaining = list.length - state.visible;
  $('#show-more').innerHTML = remaining > 0 ? `<button class="btn btn--secondary btn--lg" type="button" id="show-more-btn">${fmt('show_more', { n: Math.min(remaining, BATCH) })}</button>` : '';
  const activeSheet = (f.status !== 'all') + (f.price !== 'all');
  $('#filters-label').textContent = activeSheet ? `${tr('filters')} · ${activeSheet}` : tr('filters');
  $('#clear-filters').hidden = !(f.query || f.type !== 'all' || activeSheet);
  $('#sheet-apply').textContent = fmt('show_n', { n: countText(list.length) });
  $$('.chip[data-type]').forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.type === f.type)));
  $('#status-filter').value = f.status;
  $('#price-filter').value = f.price;
  $('#sort-select').value = f.sort;
  $$('input[name="sheet-status"]').forEach(input => { input.checked = input.value === f.status; });
  $$('input[name="sheet-price"]').forEach(input => { input.checked = input.value === f.price; });
}

function syncCollectionUrl() {
  const f = state.filters;
  const params = new URLSearchParams();
  if (f.type !== 'all') params.set('type', f.type);
  if (f.status !== 'all') params.set('status', f.status);
  if (f.price !== 'all') params.set('price', f.price);
  if (f.sort !== 'available') params.set('sort', f.sort);
  if (f.query.trim()) params.set('q', f.query.trim());
  const qs = params.toString();
  // replaceState does not fire hashchange, so the page is not re-rendered; Back from a piece restores the filters.
  history.replaceState(null, '', `#/collection${qs ? `?${qs}` : ''}`);
}

function setFilter(key, value) {
  state.filters[key] = value;
  state.visible = BATCH;
  syncCollectionUrl();
  renderCollection();
}

function clearFilters() {
  state.filters = { query: '', type: 'all', price: 'all', status: 'all', sort: state.filters.sort };
  state.visible = BATCH;
  const search = $('#catalog-search');
  if (search) search.value = '';
  syncCollectionUrl();
  renderCollection();
}

function bindCollection() {
  $('#catalog-search').addEventListener('input', event => setFilter('query', event.target.value));
  $$('.chip[data-type]').forEach(chip => chip.addEventListener('click', () => setFilter('type', chip.dataset.type)));
  $('#status-filter').addEventListener('change', event => setFilter('status', event.target.value));
  $('#price-filter').addEventListener('change', event => setFilter('price', event.target.value));
  $('#sort-select').addEventListener('change', event => setFilter('sort', event.target.value));
  $('#clear-filters').addEventListener('click', clearFilters);
  const sheet = $('#filter-sheet');
  $('#open-filters').addEventListener('click', () => { if (typeof sheet.showModal === 'function') { sheet.showModal(); document.body.classList.add('overlay-open'); } });
  sheet.addEventListener('close', () => { document.body.classList.remove('overlay-open'); $('#open-filters')?.focus(); });
  sheet.addEventListener('click', event => { if (event.target === sheet || event.target.closest('[data-sheet-close]')) sheet.close(); });
  sheet.addEventListener('change', event => {
    if (event.target.name === 'sheet-status') setFilter('status', event.target.value);
    if (event.target.name === 'sheet-price') setFilter('price', event.target.value);
  });
  $('#sheet-clear').addEventListener('click', () => { state.filters.price = 'all'; setFilter('status', 'all'); });
  $('#app').addEventListener('click', collectionClicks);
  renderCollection();
}

function collectionClicks(event) {
  if (!$('#catalog-grid')) return;
  if (event.target.closest('[data-clear-filters]')) clearFilters();
  if (event.target.closest('#show-more-btn')) { state.visible += BATCH; renderCollection(); }
}

/* ---------- Piece page behaviour ---------- */

function bindGallery() {
  const track = $('.gallery-track');
  if (!track) return;
  const slides = $$('.gallery-slide', track);
  const thumbs = $$('.gallery-thumbs [data-thumb]');
  const thumbWrap = $('.gallery-thumbs');
  const counter = $('.gallery-count-text');
  const prev = $('.gallery-prev');
  const next = $('.gallery-next');
  let current = 0;
  const setCurrent = index => {
    if (index === current && counter.dataset.ready) return;
    current = index;
    counter.dataset.ready = '1';
    counter.textContent = `${index + 1} / ${slides.length}`;
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-current', String(i === index)));
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
    const thumb = thumbs[index];
    if (thumb && thumbWrap) {
      const left = thumb.offsetLeft - (thumbWrap.clientWidth - thumb.offsetWidth) / 2;
      thumbWrap.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  };
  const go = (index, instant = false) => {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: target * track.clientWidth, behavior: instant || reducedMotion() ? 'auto' : 'smooth' });
    setCurrent(target);
  };
  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => setCurrent(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
  }, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(current + 1); }
  });
  thumbs.forEach(thumb => thumb.addEventListener('click', () => go(Number(thumb.dataset.thumb))));
  prev?.addEventListener('click', () => go(current - 1));
  next?.addEventListener('click', () => go(current + 1));
  $$('.gallery-open', track).forEach(button => button.addEventListener('click', () => openLightbox(Number(button.dataset.galleryIndex), button)));
  state.galleryGo = go;
  state.galleryIndex = () => current;
}

function bindItem(item) {
  state.gallery = galleryOf(item);
  bindGallery();
  $('#copy-link')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    await copyText(location.href);
    toast(tr('link_copied'));
    swapIcon(button, 'check', 'link');
  });
}

/* ---------- Visit behaviour ---------- */

function bindVisit() {
  $('#copy-address')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    await copyText(`${copy.th.address_text}\n${copy.en.address_text}\n${PLACE.lat}, ${PLACE.lng}`);
    toast(tr('address_copied'));
    swapIcon(button, 'check', 'copy');
  });
}

/* ---------- Utilities ---------- */

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const input = document.createElement('textarea');
    input.value = text; input.setAttribute('readonly', ''); input.style.position = 'fixed'; input.style.opacity = '0';
    document.body.append(input); input.select();
    try { document.execCommand('copy'); } catch { /* nothing else to try */ }
    input.remove();
  }
}

function swapIcon(button, to, back) {
  const svg = $('svg', button);
  if (!svg) return;
  svg.innerHTML = ICONS[to];
  clearTimeout(button._iconTimer);
  button._iconTimer = setTimeout(() => { svg.innerHTML = ICONS[back]; }, 2000);
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 2600);
}

function fitCardImage(img) {
  if (!img.naturalWidth) return;
  img.classList.toggle('fit-contain', img.naturalWidth / img.naturalHeight > 1.15);
}

/* ---------- Routing ---------- */

function parseRoute() {
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  let route = parts[0] || 'home';
  if (route === 'catalog') route = 'collection';
  if (route === 'about') route = 'visit';
  if (HIDDEN_ROUTES.includes(route)) route = 'home';
  return { route, code: parts[1] ? decodeURIComponent(parts[1]) : '', query };
}

function render({ keepScroll = false } = {}) {
  const { route, code, query } = parseRoute();
  const app = $('#app');
  const scroll = scrollY;
  closeMenu(false);
  closeLightbox(false);
  closeCodeSearch(false);
  document.body.classList.remove('overlay-open');
  state.gallery = [];
  state.galleryGo = null;
  state.galleryIndex = null;

  const item = route === 'item' ? findItem(code) : null;
  let html;
  let bar = '';
  let pageName;
  if (route === 'home') { html = homePage(); pageName = 'Rooted by Nature'; }
  else if (route === 'collection') { html = collectionPage(query); pageName = tr('nav_collection'); }
  else if (route === 'item' && item) { html = itemPage(item); bar = actionBar(item); pageName = `${item.code} · ${itemText(item, 'name')}`; }
  else if (route === 'visit') { html = visitPage(); pageName = tr('nav_visit'); }
  else if (route === 'craft') { html = craftPage(); pageName = tr('nav_craft'); }
  else if (route === 'stories') { html = storiesPage(); pageName = tr('nav_stories'); }
  else { html = notFoundPage(route === 'item' ? code : ''); pageName = tr('nav_notfound'); }

  app.innerHTML = html;
  $('#action-bar-slot').innerHTML = bar;
  document.body.classList.toggle('has-action-bar', Boolean(bar));
  document.title = `${pageName} · RAAKRAK`;
  $$('.main-nav a, .mobile-menu a[data-route]').forEach(link => {
    const active = link.dataset.route === route || (route === 'item' && link.dataset.route === 'collection');
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });

  if (route === 'collection') bindCollection();
  if (item) bindItem(item);
  if (route === 'visit') bindVisit();
  $$('.card-media img', app).forEach(img => { if (img.complete) fitCardImage(img); });

  if (keepScroll) window.scrollTo(0, scroll);
  else { window.scrollTo(0, 0); if (render.ready) app.focus({ preventScroll: true }); }
  render.ready = true;
}

/* ---------- Chrome: language, menu, overlays ---------- */

function applyChrome() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach(node => { node.textContent = tr(node.dataset.i18n); });
  $$('[data-i18n-aria]').forEach(node => node.setAttribute('aria-label', tr(node.dataset.i18nAria)));
  $$('#lang-toggle [data-lang]').forEach(node => node.classList.toggle('is-current', node.dataset.lang === state.lang));
  $$('[data-contact]').forEach(link => {
    const isLine = link.dataset.contact === 'line';
    const ready = isLine ? CONTACT.lineId : CONTACT.phone;
    link.setAttribute('href', isLine ? lineHref(tr('msg_general')) : telHref());
    link.toggleAttribute('data-contact-pending', !ready);
    if (ready && isLine) { link.target = '_blank'; link.rel = 'noopener'; } else { link.removeAttribute('target'); link.removeAttribute('rel'); }
  });
  $('#menu-toggle').setAttribute('aria-label', tr($('#mobile-menu').hidden ? 'open_menu' : 'close_menu'));
}

function applyLanguage(keepScroll = false) {
  applyChrome();
  render({ keepScroll });
}

function openMenu() {
  const menu = $('#mobile-menu');
  menu.hidden = false;
  $('#menu-toggle').setAttribute('aria-expanded', 'true');
  $('#menu-toggle').setAttribute('aria-label', tr('close_menu'));
  document.body.classList.add('menu-open');
}

function closeMenu(returnFocus = true) {
  const menu = $('#mobile-menu');
  if (menu.hidden) return;
  menu.hidden = true;
  $('#menu-toggle').setAttribute('aria-expanded', 'false');
  $('#menu-toggle').setAttribute('aria-label', tr('open_menu'));
  document.body.classList.remove('menu-open');
  if (returnFocus) $('#menu-toggle').focus();
}

function openCodeSearch(event) {
  state.codeOpener = event?.currentTarget || document.activeElement;
  $('#code-search').hidden = false;
  document.body.classList.add('overlay-open');
  const input = $('#code-search-input');
  input.value = '';
  setTimeout(() => input.focus(), 30);
}

function closeCodeSearch(returnFocus = true) {
  const overlay = $('#code-search');
  if (overlay.hidden) return;
  overlay.hidden = true;
  document.body.classList.remove('overlay-open');
  if (returnFocus) state.codeOpener?.focus?.();
}

function openLightbox(index, opener) {
  if (!state.gallery.length) return;
  state.lightboxIndex = index;
  state.lightboxOpener = opener || document.activeElement;
  updateLightbox();
  $('#lightbox').hidden = false;
  document.body.classList.add('overlay-open');
  $('.lightbox-close').focus();
}

function updateLightbox() {
  const box = $('#lightbox');
  const list = state.gallery;
  const i = state.lightboxIndex;
  const src = list[i];
  const img = $('img', box);
  img.src = src;
  img.alt = `${photoLabel(src)} ${i + 1}`;
  $('.lightbox-label', box).textContent = photoLabel(src);
  $('.lightbox-count', box).textContent = `${i + 1} / ${list.length}`;
  const single = list.length < 2;
  $('.lightbox-prev', box).hidden = single;
  $('.lightbox-next', box).hidden = single;
  [list[(i + 1) % list.length], list[(i - 1 + list.length) % list.length]].forEach(neighbour => { if (neighbour) new Image().src = neighbour; });
}

function moveLightbox(amount) {
  const total = state.gallery.length;
  if (total < 2) return;
  state.lightboxIndex = (state.lightboxIndex + amount + total) % total;
  updateLightbox();
}

function closeLightbox(returnFocus = true) {
  const box = $('#lightbox');
  if (box.hidden) return;
  box.hidden = true;
  document.body.classList.remove('overlay-open');
  if (!returnFocus) return;
  state.galleryGo?.(state.lightboxIndex, true);
  const opener = $(`.gallery-open[data-gallery-index="${state.lightboxIndex}"]`) || state.lightboxOpener;
  opener?.focus?.({ preventScroll: true });
}

function trapFocus(container, event) {
  const focusable = $$('a[href],button:not([disabled]):not([hidden]),input,select,textarea,iframe,[tabindex]:not([tabindex="-1"])', container).filter(node => node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function bindGlobal() {
  window.addEventListener('hashchange', () => render());
  document.addEventListener('click', event => {
    if (event.target.closest('[data-contact-pending]')) { event.preventDefault(); toast(tr('contact_pending')); }
  });
  document.addEventListener('load', event => { if (event.target.matches?.('.card-media img')) fitCardImage(event.target); }, true);

  $('#lang-toggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'th' : 'en';
    try { localStorage.setItem('raakrak-lang', state.lang); } catch { /* private mode: keep in memory */ }
    applyLanguage(true);
  });
  $('#menu-toggle').addEventListener('click', () => ($('#mobile-menu').hidden ? openMenu() : closeMenu()));
  $('#mobile-menu').addEventListener('click', event => { if (event.target.closest('a[data-route]')) closeMenu(false); });
  $('#code-trigger').addEventListener('click', openCodeSearch);
  $('.overlay-close').addEventListener('click', () => closeCodeSearch());
  $('#code-search').addEventListener('click', event => { if (event.target === event.currentTarget) closeCodeSearch(); });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-code-form], #code-search-form');
    if (!form) return;
    event.preventDefault();
    const input = $('input', form);
    const code = normalizeCode(input.value);
    if (!code) { toast(tr('code_invalid')); input.focus(); return; }
    closeCodeSearch(false);
    const target = `#/item/${encodeURIComponent(code)}`;
    if (location.hash === target) render(); else location.hash = target;
  });

  const box = $('#lightbox');
  $('.lightbox-close', box).addEventListener('click', () => closeLightbox());
  $('.lightbox-prev', box).addEventListener('click', () => moveLightbox(-1));
  $('.lightbox-next', box).addEventListener('click', () => moveLightbox(1));
  box.addEventListener('click', event => { if (event.target === box || event.target.classList.contains('lightbox-stage')) closeLightbox(); });
  let startX = null;
  const stage = $('.lightbox-stage', box);
  stage.addEventListener('pointerdown', event => { startX = event.clientX; });
  stage.addEventListener('pointerup', event => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) moveLightbox(dx < 0 ? 1 : -1);
  });

  document.addEventListener('keydown', event => {
    const lightboxOpen = !box.hidden;
    const codeOpen = !$('#code-search').hidden;
    if (event.key === 'Escape') {
      if (lightboxOpen) closeLightbox();
      else if (codeOpen) closeCodeSearch();
      else closeMenu();
    }
    if (lightboxOpen && event.key === 'ArrowLeft') moveLightbox(-1);
    if (lightboxOpen && event.key === 'ArrowRight') moveLightbox(1);
    if (event.key === 'Tab') {
      if (lightboxOpen) trapFocus(box, event);
      else if (codeOpen) trapFocus($('#code-search'), event);
    }
  });

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (state.galleryGo && state.galleryIndex) state.galleryGo(state.galleryIndex(), true);
      if (matchMedia('(min-width: 1024px)').matches) closeMenu(false);
    });
  });
}

function hydrateStaticIcons() {
  $$('[data-icon]').forEach(node => { node.outerHTML = icon(node.dataset.icon, node.className); });
}

async function init() {
  hydrateStaticIcons();
  try {
    // no-cache: revalidate with the server so a reviewer never mixes new code with a stale catalogue.
    const response = await fetch('data/items.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.items = await response.json();
    bindGlobal();
    applyLanguage();
  } catch (error) {
    $('#app').innerHTML = `<section class="not-found"><div class="not-found-inner container"><h1 class="page-title">Could not load the catalogue</h1><p class="page-intro">Run this mockup through the local server command in README.md.</p><p class="sample-note">${esc(error.message)}</p></div></section>`;
    console.error('RAAKRAK data load failed:', error);
  }
}

init();
