const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Owner decisions 2026-09-17 (STATE.md): prices stay visible with a LINE "ask about price" button;
// Craft and Stories are hidden until their content is verified (docs/07 D1/D4). Their renderers are kept.
const HIDDEN_ROUTES = ['craft', 'stories'];
// EDIT-ME at launch (docs/07 A4/D2): real LINE OA id (e.g. '@raakrak') and phone (e.g. '+6681…').
// While null, contact buttons show a notice instead of reaching a placeholder account that may belong to someone else.
const CONTACT = { lineId: null, phone: null };
const lineHref = message => CONTACT.lineId ? `https://line.me/R/oaMessage/${encodeURIComponent(CONTACT.lineId)}/?${encodeURIComponent(message)}` : '#';
const telHref = () => CONTACT.phone ? `tel:${CONTACT.phone}` : '#';
const contactAttrs = (ready, external = false) => ready ? (external ? 'target="_blank" rel="noopener"' : '') : 'data-contact-pending';
// Real photos can be the hero too: never show a photo twice, and only label AI renders as visualisations.
const galleryOf = item => [...new Set([item.hero, ...item.photos])];
const isGenerated = src => src.includes('/generated/');
const contactLines = fallback => [CONTACT.lineId && `LINE ${CONTACT.lineId}`, CONTACT.phone].filter(Boolean).join('\n') || fallback;

const copy = {
  en: {
    nav_home: 'Home', nav_collection: 'Collection', nav_craft: 'Craft', nav_stories: 'Stories', nav_visit: 'Visit',
    find_code: 'Find a piece', qr_lookup: 'QR / CODE LOOKUP', find_code_title: 'Find your exact piece', open_piece: 'Open piece ↗', code_note: 'Enter the code printed on the warehouse tag.',
    footer_line: 'Rooted by nature. Chosen by you.', mockup_note: 'Review version — product images are AI visualisations; warehouse photos are real; prices, sizes and contact details are samples.',
    price_ask: 'Ask about the price on LINE', contact_pending: 'Review version — LINE and phone will open at launch.',
    available: 'Available', reserved: 'Reserved', sold: 'Sold', table: 'Tables', bench: 'Benches', stump: 'Stumps', slab: 'Slabs', decor: 'Objects', all: 'All pieces',
    view_collection: 'View collection', plan_visit: 'Plan your visit', explore_piece: 'Explore piece', view_all: 'View all pieces', discover_craft: 'Discover our craft',
    search_placeholder: 'Search by name or code', price_all: 'All prices', price_under10: 'Under ฿10,000', price_10_25: '฿10,000–25,000', price_over25: 'Over ฿25,000',
    result: 'piece', results: 'pieces', showing: 'Showing', clear_filters: 'Clear filters', no_results: 'No pieces match these filters.', status_all: 'Any status',
    story_piece: 'The story of this piece', details: 'Details', dimensions: 'Dimensions', wood: 'Wood species', type: 'Type', weight: 'Approx. weight', carriers: 'People to carry', carriers_unit: 'people', copy_link: 'Copy link', link_copied: 'Link copied', related: 'Related pieces',
    line_this: 'Ask about this piece on LINE', call: 'Call', visualisation: 'Generated product visualisation', warehouse_photo: 'Warehouse photograph',
    line_more: 'Request more photos or video', delivery: 'Delivery & handling', delivery_note: 'This piece weighs about {kg} kg and takes {people} to carry. We can help arrange transport — message us on LINE for a delivery quote to your area.',
    unknown_title: 'We cannot find this piece', unknown_text: 'The code may be mistyped, or this piece has not been added to the catalogue yet.', back_collection: 'Back to collection', try_code: 'Try another code',
  },
  th: {
    nav_home: 'หน้าแรก', nav_collection: 'ชิ้นงาน', nav_craft: 'งานช่าง', nav_stories: 'เรื่องราว', nav_visit: 'เยี่ยมชม',
    find_code: 'ค้นหารหัสชิ้นงาน', qr_lookup: 'ค้นหาจากคิวอาร์ / รหัส', find_code_title: 'ค้นหาชิ้นงานของคุณ', open_piece: 'เปิดชิ้นงาน ↗', code_note: 'กรอกรหัสที่พิมพ์อยู่บนป้ายสินค้าในโกดัง',
    footer_line: 'ธรรมชาติสร้าง คุณเป็นผู้เลือก', mockup_note: 'เวอร์ชันสำหรับรีวิว — ภาพสินค้าเป็นภาพจำลอง AI ภาพโกดังเป็นของจริง ส่วนราคา ขนาด และช่องทางติดต่อเป็นข้อมูลตัวอย่าง',
    price_ask: 'ทักไลน์สอบถามราคา', contact_pending: 'เวอร์ชันรีวิว — ช่องทางไลน์และโทรศัพท์จะเปิดใช้เมื่อเปิดร้านจริง',
    available: 'พร้อมขาย', reserved: 'ติดจอง', sold: 'ขายแล้ว', table: 'โต๊ะ', bench: 'ม้านั่ง', stump: 'ตอไม้', slab: 'แผ่นไม้', decor: 'ของตกแต่ง', all: 'ทุกชิ้น',
    view_collection: 'ดูชิ้นงานทั้งหมด', plan_visit: 'วางแผนมาเยี่ยมชม', explore_piece: 'ดูชิ้นนี้', view_all: 'ดูทั้งหมด', discover_craft: 'รู้จักงานช่างของเรา',
    search_placeholder: 'ค้นหาจากชื่อหรือรหัส', price_all: 'ทุกช่วงราคา', price_under10: 'ต่ำกว่า ฿10,000', price_10_25: '฿10,000–25,000', price_over25: 'มากกว่า ฿25,000',
    result: 'ชิ้น', results: 'ชิ้น', showing: 'แสดงผล', clear_filters: 'ล้างตัวกรอง', no_results: 'ไม่พบชิ้นงานที่ตรงกับตัวกรอง', status_all: 'ทุกสถานะ',
    story_piece: 'เรื่องราวของชิ้นนี้', details: 'รายละเอียด', dimensions: 'ขนาด', wood: 'ชนิดไม้', type: 'ประเภท', weight: 'น้ำหนักโดยประมาณ', carriers: 'จำนวนคนยก', carriers_unit: 'คน', copy_link: 'คัดลอกลิงก์', link_copied: 'คัดลอกลิงก์แล้ว', related: 'ชิ้นงานใกล้เคียง',
    line_this: 'ทักไลน์ถามชิ้นนี้', call: 'โทร', visualisation: 'ภาพจำลองสินค้าที่สร้างขึ้น', warehouse_photo: 'ภาพถ่ายจากโกดัง',
    line_more: 'ขอดูรูป / วิดีโอเพิ่มเติม', delivery: 'การจัดส่งและการขนย้าย', delivery_note: 'ชิ้นงานนี้หนักประมาณ {kg} กก. ต้องใช้คนยก {people} เราช่วยจัดรถขนส่งให้ได้ ทักไลน์เพื่อสอบถามค่าจัดส่งถึงพื้นที่ของคุณ',
    unknown_title: 'เราไม่พบชิ้นงานนี้', unknown_text: 'รหัสอาจพิมพ์ไม่ถูกต้อง หรือชิ้นงานนี้ยังไม่ได้เพิ่มในแคตตาล็อก', back_collection: 'กลับไปหน้าชิ้นงาน', try_code: 'ลองค้นหารหัสอื่น',
  }
};

const content = {
  en: {
    home: {
      eyebrow: 'ONE-OF-A-KIND ROOT WOOD · THAILAND', title1: 'Sculpted once.', title2: 'Chosen forever.', intro: 'Furniture shaped first by earth, water and time—then finished by hand for the life ahead.', scroll: 'Scroll to discover',
      manifestoLabel: 'Our point of view', manifesto: 'No model numbers to reorder. No identical twins. Each RAAKRAK piece is a single encounter between <em>nature’s original form</em> and the room you make your own.', featured: 'Pieces with presence', featuredNote: 'Individual forms selected from a warehouse of hundreds. Each code belongs to one physical piece.',
      categories: 'Find your form', categoriesText: 'Begin with function, then choose by silhouette, grain and the way a piece feels in your space.', warehouseTitle: 'Come closer to the grain.', warehouseText: 'Photographs can introduce a piece. A warehouse visit lets you walk around it, touch its surface and see how the grain changes in real light.'
    },
    collection: { eyebrow: 'THE CURRENT COLLECTION', title: 'One code. One piece.', intro: 'Browse natural root tables, benches, stumps and carved objects. Sold pieces remain visible as part of the RAAKRAK archive.' },
    craft: { eyebrow: 'FORM BEFORE FURNITURE', title: 'We follow what the wood already knows.', intro: 'Our work is an act of attention: reading weight, grain, balance and the traces of a tree’s former life.', processLabel: 'How we work', processTitle: 'Less intervention. More character.', steps: [
      ['Read the form', 'We rotate, stand and study each root before deciding what it can become. Its strongest natural gesture leads the design.'],
      ['Refine the touch', 'Only the surfaces meant for hands and daily use are carefully levelled and finished. Cavities and irregular edges remain honest.'],
      ['Preserve the trace', 'Grain shifts, age marks and natural openings are protected rather than hidden—because these are the details that cannot be reproduced.']
    ], materials: 'Materials with memory', materialCopy: [
      ['Teak', 'Warm, quietly golden and naturally expressive. Teak holds both crisp carving and deep, fluid root forms.'],
      ['Pradu', 'Dense, dark and grounded. Pradu reveals dramatic rings and carries a room with very little decoration.'],
      ['Redwood', 'Long-grained and architectural. Its slender slabs are ideal for benches, counters and shelves.']
    ]},
    stories: { eyebrow: 'FIELD NOTES', title: 'Stories held in grain.', intro: 'Notes from the warehouse about choosing, living with and caring for wood that refuses to be ordinary.', cards: [
      ['01 · MATERIAL', 'The grain remembers', 'Growth rings and mineral traces are a visual record of seasons. We read them as part of the composition, never as defects.', 'images/scenes/detail-teak-grain.jpg'],
      ['02 · PROCESS', 'From root to room', 'The journey begins by finding balance—not forcing symmetry. See how a raw root becomes a usable piece without losing its wildness.', 'images/warehouse-about.jpg'],
      ['03 · COLLECTING', 'Why one piece only', 'Choosing by exact code changes the relationship. You are not buying a model; you are becoming the next custodian of one form.', 'images/scenes/warehouse-hall-root-tables.jpg']
    ]},
    visit: { eyebrow: 'VISIT THE WAREHOUSE', title: 'Walk among hundreds of singular forms.', intro: 'Bring your room dimensions, photographs and an open mind. We will help you find the piece that belongs there.', details: 'Plan your visit', hours: 'Opening hours', hoursText: 'To be confirmed', address: 'Warehouse', addressText: 'Bang Sai District (บางไทร)\nPhra Nakhon Si Ayutthaya 13190', contact: 'Contact', contactText: contactLines('LINE and phone\nannounced at launch'), appointment: 'Before you come', appointmentText: 'Please contact us one day ahead so we can prepare the pieces you would like to see.', map: 'Warehouse location', mapNote: 'Bang Sai, Phra Nakhon Si Ayutthaya', directions: 'Get directions', openMaps: 'Open in Google Maps' }
  },
  th: {
    home: {
      eyebrow: 'รากไม้หนึ่งเดียว · ประเทศไทย', title1: 'ธรรมชาติสร้างครั้งเดียว', title2: 'คุณเลือกเก็บไว้ตลอดไป', intro: 'เฟอร์นิเจอร์ที่ดิน น้ำ และเวลาเป็นผู้ออกแบบ ก่อนช่างจะค่อย ๆ แต่งผิวเพื่อการใช้ชีวิตต่อจากนี้', scroll: 'เลื่อนเพื่อชม',
      manifestoLabel: 'มุมมองของเรา', manifesto: 'ไม่มีรุ่นให้สั่งซ้ำ และไม่มีฝาแฝด ทุกชิ้นของ RAAKRAK คือการพบกันเพียงครั้งเดียว ระหว่าง <em>รูปทรงเดิมของธรรมชาติ</em> กับพื้นที่ที่คุณเรียกว่าบ้าน', featured: 'ชิ้นงานที่มีตัวตน', featuredNote: 'รูปทรงที่คัดมาจากคลังหลายร้อยชิ้น แต่ละรหัสหมายถึงสินค้าจริงเพียงหนึ่งชิ้น',
      categories: 'ค้นหารูปทรงของคุณ', categoriesText: 'เริ่มจากการใช้งาน แล้วค่อยเลือกด้วยเส้นรอบนอก ลายไม้ และความรู้สึกเมื่อชิ้นงานอยู่ในพื้นที่จริง', warehouseTitle: 'เข้ามามองลายไม้ใกล้ ๆ', warehouseText: 'ภาพถ่ายช่วยให้รู้จักชิ้นงาน แต่การมาโกดังทำให้คุณเดินดูรอบด้าน สัมผัสผิว และเห็นลายไม้เปลี่ยนไปตามแสงจริง'
    },
    collection: { eyebrow: 'ชิ้นงานที่มีอยู่ขณะนี้', title: 'หนึ่งรหัส หนึ่งชิ้น', intro: 'เลือกชมโต๊ะรากไม้ ม้านั่ง ตอไม้ และงานแกะสลัก ชิ้นที่ขายแล้วจะยังคงอยู่เพื่อเป็นส่วนหนึ่งของคลังงาน RAAKRAK' },
    craft: { eyebrow: 'มองรูปทรงก่อนการใช้งาน', title: 'เราเดินตามสิ่งที่ไม้บอกไว้', intro: 'งานของเราเริ่มจากการตั้งใจมองน้ำหนัก เสี้ยนไม้ สมดุล และร่องรอยจากชีวิตเดิมของต้นไม้', processLabel: 'วิธีทำงาน', processTitle: 'แต่งให้น้อย รักษาบุคลิกให้มาก', steps: [
      ['อ่านรูปทรง', 'เราหมุน ตั้ง และใช้เวลากับรากแต่ละชิ้นก่อนตัดสินใจว่าจะเป็นอะไร ท่าทางธรรมชาติที่แข็งแรงที่สุดจะเป็นผู้นำงานออกแบบ'],
      ['แต่งผิวสัมผัส', 'เฉพาะจุดที่มือสัมผัสและใช้งานจริงเท่านั้นที่ถูกปรับระดับอย่างละเอียด ส่วนโพรงและขอบไม่สม่ำเสมอยังคงอยู่'],
      ['เก็บร่องรอย', 'เสี้ยนที่เปลี่ยนทิศ รอยตามวัย และช่องเปิดธรรมชาติถูกปกป้องแทนการซ่อน เพราะรายละเอียดเหล่านี้ทำซ้ำไม่ได้']
    ], materials: 'วัสดุที่มีความทรงจำ', materialCopy: [
      ['ไม้สัก', 'โทนอุ่น สีทองสงบ และมีเส้นสายชัด รองรับทั้งงานแกะละเอียดและรูปทรงรากที่ไหลเป็นอิสระ'],
      ['ไม้ประดู่', 'เนื้อแน่น สีเข้ม และมีน้ำหนักทางสายตา วงปีเด่นชัด ช่วยยึดบรรยากาศของห้องโดยไม่ต้องตกแต่งมาก'],
      ['ไม้แดง', 'เสี้ยนยาวและให้ความรู้สึกเชิงสถาปัตยกรรม เหมาะกับแผ่นเรียวสำหรับม้านั่ง เคาน์เตอร์ และชั้นวาง']
    ]},
    stories: { eyebrow: 'บันทึกจากโกดัง', title: 'เรื่องราวที่อยู่ในลายไม้', intro: 'บันทึกเรื่องการเลือก การอยู่ร่วม และการดูแลไม้ที่ไม่เหมือนชิ้นใด จากพื้นที่จริงของเรา', cards: [
      ['01 · วัสดุ', 'ลายไม้จดจำเวลา', 'วงปีและรอยแร่คือบันทึกของฤดูกาล เราอ่านสิ่งเหล่านี้เป็นองค์ประกอบของชิ้นงาน ไม่ใช่ตำหนิที่ต้องลบออก', 'images/scenes/detail-teak-grain.jpg'],
      ['02 · กระบวนการ', 'จากรากไม้สู่ห้อง', 'การเดินทางเริ่มจากการหาสมดุล ไม่ใช่บังคับให้สมมาตร มองดูรากดิบกลายเป็นชิ้นใช้งานโดยยังรักษาความเป็นธรรมชาติไว้', 'images/warehouse-about.jpg'],
      ['03 · การสะสม', 'เหตุผลที่มีเพียงชิ้นเดียว', 'การเลือกด้วยรหัสเฉพาะเปลี่ยนความสัมพันธ์ คุณไม่ได้ซื้อสินค้ารุ่นหนึ่ง แต่กำลังเป็นผู้ดูแลรูปทรงหนึ่งเดียวต่อจากธรรมชาติ', 'images/scenes/warehouse-hall-root-tables.jpg']
    ]},
    visit: { eyebrow: 'เยี่ยมชมโกดัง', title: 'เดินท่ามกลางรูปทรงนับร้อยที่ไม่ซ้ำกัน', intro: 'นำขนาดห้อง ภาพถ่าย และใจที่เปิดกว้างมา เราจะช่วยคุณหาชิ้นที่เหมาะกับพื้นที่จริง', details: 'วางแผนการเยี่ยมชม', hours: 'เวลาเปิด', hoursText: 'รอยืนยัน', address: 'โกดัง', addressText: 'อ.บางไทร\nจ.พระนครศรีอยุธยา 13190', contact: 'ติดต่อ', contactText: contactLines('ไลน์และเบอร์โทร\nจะแจ้งเมื่อเปิดร้าน'), appointment: 'ก่อนเดินทาง', appointmentText: 'กรุณาติดต่อเราล่วงหน้าหนึ่งวัน เพื่อเตรียมชิ้นงานที่คุณสนใจไว้ให้ชม', map: 'ตำแหน่งโกดัง', mapNote: 'อ.บางไทร จ.พระนครศรีอยุธยา', directions: 'นำทาง', openMaps: 'เปิดใน Google Maps' }
  }
};

const state = {
  items: [],
  lang: ['en', 'th'].includes(localStorage.getItem('raakrak-lang')) ? localStorage.getItem('raakrak-lang') : 'en',
  filters: { query: '', type: 'all', price: 'all', status: 'all' },
  lightboxImages: [], lightboxIndex: 0
};

const tr = key => copy[state.lang][key] || copy.en[key] || key;
const cc = section => content[state.lang][section];
const itemText = (item, key) => item[`${key}_${state.lang}`] || item[`${key}_en`] || '';
const money = value => new Intl.NumberFormat(state.lang === 'th' ? 'th-TH' : 'en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value);
const statusMarkup = status => `<span class="status ${status}">${tr(status)}</span>`;
// Photos built by scripts/build-web-images.cjs exist in two sizes: X.jpg (2400px) and X-sm.jpg (1200px).
// srcset lets phones on 4G and small cards take the 1200px file while full-bleed and Retina views stay sharp.
// IMG_V busts browser caches when photos are rebuilt under the same file names — bump it with each image rebuild.
const IMG_V = '2026-09-17f';
// Product imagery = AI renders in images/generated/ (owner decision 2026-09-17); real photos = scenes/ ambience.
const HIRES = /^images\/(generated\/RW-\d{4}-\d+|RW-\d{4}-\d+|scenes\/[\w-]+)\.jpg$/;
const versioned = src => `${src}?v=${IMG_V}`;
const srcsetFor = src => HIRES.test(src) ? `srcset="${versioned(src.replace(/\.jpg$/, '-sm.jpg'))} 1200w, ${versioned(src)} 2400w"` : '';
const image = (src, alt, eager = false, sizes = '100vw') => `<img src="${versioned(src)}" ${srcsetFor(src)} sizes="${sizes}" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

function productCard(item, eager = false) {
  return `<a class="product-card ${item.status === 'sold' ? 'is-sold' : ''} reveal" href="#/item/${item.code}">
    <div class="product-image">${image(item.hero, `${item.code} — ${itemText(item, 'name')}`, eager, '(max-width: 700px) 92vw, 34vw')}${statusMarkup(item.status)}</div>
    <div class="product-meta"><span class="product-code">${item.code} · ${itemText(item, 'type')}</span><h3 class="product-name">${itemText(item, 'name')}</h3><span class="product-price">${money(item.price)}</span></div>
  </a>`;
}

function homePage() {
  const c = cc('home');
  const featured = state.items.filter(item => item.status === 'available').concat(state.items.filter(item => item.status !== 'available')).slice(0, 3);
  const heroItem = featured[0];
  const heroIndex = heroItem ? `<span class="hero-index">${String(state.items.indexOf(heroItem) + 1).padStart(2, '0')} / ${String(state.items.length).padStart(2, '0')}</span>` : '';
  const counts = type => state.items.filter(item => item.type_key === type).length.toString().padStart(2, '0');
  return `<article class="page home-page">
    <section class="home-hero" id="home-hero">
      <div class="home-hero-visual">${image(heroItem?.hero || 'images/warehouse-hero.jpg', 'RAAKRAK natural root-wood furniture', true)}</div>
      <div class="home-hero-copy"><p class="eyebrow">${c.eyebrow}</p><h1 class="display"><span>${c.title1}</span><span>${c.title2}</span></h1><p>${c.intro}</p><div class="hero-actions"><a class="button fill" href="#/collection">${tr('view_collection')} <span>↗</span></a><a class="button" href="#/visit">${tr('plan_visit')}</a></div></div>
      <span class="scroll-cue">${c.scroll}</span>${heroIndex}
    </section>
    <section class="manifesto reveal"><p class="eyebrow">${c.manifestoLabel}</p><p class="lead">${c.manifesto}</p></section>
    <section class="featured"><div class="section-head reveal"><div><p class="eyebrow">SELECTED FORMS</p><h2 class="section-title">${c.featured}</h2></div><p>${c.featuredNote}</p></div><div class="featured-grid">${featured.map((item, i) => productCard(item, i === 0)).join('')}</div><p style="margin-top:46px"><a class="text-link" href="#/collection">${tr('view_all')} <span>→</span></a></p></section>
    <section class="category-section"><div class="category-intro reveal"><p class="eyebrow">BY FUNCTION</p><div><h2 class="section-title">${c.categories}</h2><p>${c.categoriesText}</p></div></div><div class="category-list">${['table','bench','stump','slab','decor'].map(type => `<a class="category-row reveal" href="#/collection?type=${type}"><small>${counts(type)}</small><strong>${tr(type)}</strong><span>↗</span></a>`).join('')}</div></section>
    <section class="warehouse-feature"><img src="images/warehouse-grain.jpg" alt="RAAKRAK warehouse and carved root-wood collection" loading="lazy"><div class="warehouse-feature-copy reveal"><h2 class="section-title">${c.warehouseTitle}</h2><div><p>${c.warehouseText}</p><a class="button light" href="#/visit">${tr('plan_visit')} ↗</a></div></div></section>
  </article>`;
}

function collectionPage(queryString = '') {
  const params = new URLSearchParams(queryString);
  if (params.get('type') && ['table','bench','stump','slab','decor'].includes(params.get('type'))) state.filters.type = params.get('type');
  if (params.get('status') && ['available','reserved','sold'].includes(params.get('status'))) state.filters.status = params.get('status');
  const c = cc('collection');
  return `<article class="page collection-page">
    <section class="collection-hero"><div class="collection-hero-top"><div><p class="eyebrow">${c.eyebrow}</p><h1 class="display">${c.title}</h1></div><p>${c.intro}</p></div></section>
    <section class="collection-tools" aria-label="Collection filters"><div class="tool-row"><label class="search-field"><span aria-hidden="true">⌕</span><input id="catalog-search" type="search" value="${state.filters.query}" placeholder="${tr('search_placeholder')}" aria-label="${tr('search_placeholder')}"></label><div class="type-filters">${['all','table','bench','stump','slab','decor'].map(type => `<button class="filter-chip ${state.filters.type === type ? 'active' : ''}" type="button" data-filter="${type}">${tr(type)}</button>`).join('')}</div><select class="price-select" id="price-filter" aria-label="Price range"><option value="all">${tr('price_all')}</option><option value="under10">${tr('price_under10')}</option><option value="10-25">${tr('price_10_25')}</option><option value="over25">${tr('price_over25')}</option></select><div class="status-filters">${['all','available','reserved','sold'].map(status => `<button class="filter-chip ${state.filters.status === status ? 'active' : ''}" type="button" data-status="${status}">${status === 'all' ? tr('status_all') : tr(status)}</button>`).join('')}</div></div></section>
    <div class="result-bar"><span id="result-count"></span><button class="text-link" id="clear-filters" type="button">${tr('clear_filters')}</button></div><section class="catalog-grid" id="catalog-grid"></section>
  </article>`;
}

function itemPage(code) {
  const item = state.items.find(entry => entry.code.toUpperCase() === code.toUpperCase());
  if (!item) return notFoundPage(code);
  const gallery = galleryOf(item);
  const related = state.items.filter(entry => entry.code !== item.code && (entry.type_key === item.type_key || entry.wood_en === item.wood_en)).slice(0, 3);
  const lineText = `${state.lang === 'th' ? 'สวัสดีครับ/ค่ะ สนใจชิ้นงาน' : 'Hello, I am interested in piece'} ${item.code} — ${itemText(item, 'name')}`;
  const lineMoreText = `${state.lang === 'th' ? 'สวัสดีครับ/ค่ะ ขอดูรูปหรือวิดีโอเพิ่มเติมของชิ้นงาน' : 'Hello, could you share more photos or a video of piece'} ${item.code} — ${itemText(item, 'name')}`;
  const linePriceText = `${state.lang === 'th' ? 'สวัสดีครับ/ค่ะ ขอสอบถามราคาชิ้นงาน' : 'Hello, I would like to ask about the price of piece'} ${item.code} — ${itemText(item, 'name')} (${money(item.price)})`;
  const carriersText = state.lang === 'th' ? `${item.carriers} คน` : `${item.carriers} ${item.carriers === 1 ? 'person' : 'people'}`;
  const deliveryNote = tr('delivery_note').replace('{kg}', item.weight_kg).replace('{people}', carriersText);
  return `<article class="page item-page">
    <section class="item-hero"><div class="item-hero-code">${item.code}</div><div class="item-hero-image">${image(item.hero, `${item.code} — ${itemText(item, 'name')}`, true)}${isGenerated(item.hero) ? `<span class="visualisation-note">${tr('visualisation')}</span>` : ''}</div><div class="item-hero-copy"><p class="kicker">${itemText(item, 'type')} · ${itemText(item, 'wood')}</p><h1>${itemText(item, 'name')}</h1><p class="hero-status ${item.status}">${tr(item.status)}</p><p class="item-price">${money(item.price)}</p><div class="price-actions"><a class="button price-ask" href="${lineHref(linePriceText)}" ${contactAttrs(CONTACT.lineId, true)}>${tr('price_ask')} ↗</a><a class="button price-call" href="${telHref()}" ${contactAttrs(CONTACT.phone)}>${tr('call')}</a></div><a class="text-link" href="#item-story">${tr('story_piece')} <span>↓</span></a></div></section>
    <section class="item-intro" id="item-story"><p class="eyebrow">${tr('story_piece')}</p><div class="item-story reveal"><h2 class="section-title">${itemText(item, 'name')}</h2><p>${itemText(item, 'story')}</p></div></section>
    <section class="item-gallery" aria-label="Product gallery">${gallery.map((src, index) => `<button class="gallery-image reveal" type="button" data-gallery-index="${index}">${image(src, `${item.code} — ${isGenerated(src) ? tr('visualisation') : tr('warehouse_photo')} ${index + 1}`, false, '(max-width: 700px) 92vw, 70vw')}</button>`).join('')}</section>
    <section class="item-specs"><p class="eyebrow">${tr('details')}</p><div><dl class="spec-table"><div class="spec-row"><dt>${tr('wood')}</dt><dd>${itemText(item, 'wood')}</dd></div><div class="spec-row"><dt>${tr('type')}</dt><dd>${itemText(item, 'type')}</dd></div><div class="spec-row"><dt>${tr('weight')}</dt><dd>${item.weight_kg} kg</dd></div><div class="spec-row"><dt>${tr('carriers')}</dt><dd>${item.carriers} ${tr('carriers_unit')}</dd></div></dl><div class="dimensions"><h3>${tr('dimensions')} · CM</h3><div class="dimension-row"><span>W / ${state.lang === 'th' ? 'กว้าง' : 'Width'}</span><strong>${item.width}</strong></div><div class="dimension-row"><span>L / ${state.lang === 'th' ? 'ยาว' : 'Length'}</span><strong>${item.length}</strong></div><div class="dimension-row"><span>H / ${state.lang === 'th' ? 'สูง' : 'Height'}</span><strong>${item.height}</strong></div></div><div class="delivery-note"><h3>${tr('delivery')}</h3><p>${deliveryNote}</p></div><div class="item-actions-inline"><a class="button" href="${lineHref(lineMoreText)}" ${contactAttrs(CONTACT.lineId, true)}>${tr('line_more')} ↗</a><button class="button" id="copy-link" type="button">${tr('copy_link')} ↗</button><a class="button" href="#/visit">${tr('plan_visit')}</a></div></div></section>
    <section class="related"><div class="section-head"><h2 class="section-title">${tr('related')}</h2><a class="text-link" href="#/collection">${tr('view_all')} <span>→</span></a></div><div class="related-grid">${related.map(entry => productCard(entry)).join('')}</div></section>
    <div class="sticky-contact" id="sticky-contact"><a class="line" href="${lineHref(lineText)}" ${contactAttrs(CONTACT.lineId, true)}>${tr('line_this')}</a><a class="call" href="${telHref()}" ${contactAttrs(CONTACT.phone)}>${tr('call')} ↗</a></div>
  </article>`;
}

function craftPage() {
  const c = cc('craft');
  return `<article class="page">
    <section class="dark-hero"><img src="images/warehouse-about.jpg" alt="Natural root wood in the RAAKRAK warehouse" fetchpriority="high"><div class="dark-hero-copy"><div><p class="eyebrow">${c.eyebrow}</p><h1 class="display">${c.title}</h1></div><p>${c.intro}</p></div></section>
    <section class="process"><div class="process-intro reveal"><p class="eyebrow">${c.processLabel}</p><h2 class="section-title">${c.processTitle}</h2></div><div class="process-steps">${c.steps.map((step, i) => `<article class="process-step reveal"><span class="number">0${i + 1}</span><h3>${step[0]}</h3><p>${step[1]}</p></article>`).join('')}</div></section>
    <section class="materials"><p class="eyebrow">MATERIAL NOTES</p><h2 class="section-title">${c.materials}</h2><div class="material-grid">${c.materialCopy.map((material, i) => `<article class="material-card reveal"><span class="kicker">0${i + 1}</span><div><strong>${material[0]}</strong><p>${material[1]}</p></div></article>`).join('')}</div></section>
  </article>`;
}

function storiesPage() {
  const c = cc('stories');
  return `<article class="page"><section class="stories-hero"><div><p class="eyebrow">${c.eyebrow}</p><h1 class="display">${c.title}</h1></div><p>${c.intro}</p></section><section class="story-list">${c.cards.map(card => `<article class="story-card reveal"><div class="story-card-image">${image(card[3], card[1])}</div><div class="story-card-copy"><small>${card[0]}</small><h2>${card[1]}</h2><p>${card[2]}</p><a class="text-link" href="#/craft">${tr('discover_craft')} <span>→</span></a></div></article>`).join('')}</section></article>`;
}

function visitPage() {
  const c = cc('visit');
  const block = (title, text) => `<div class="visit-block"><h3>${title}</h3><p>${text.replace(/\n/g, '<br>')}</p></div>`;
  return `<article class="page"><section class="dark-hero"><img src="images/warehouse-about.jpg" alt="RAAKRAK root-wood warehouse" fetchpriority="high"><div class="dark-hero-copy"><div><p class="eyebrow">${c.eyebrow}</p><h1 class="display">${c.title}</h1></div><p>${c.intro}</p></div></section><section class="visit-details"><p class="eyebrow">${c.details}</p><div class="visit-info reveal">${block(c.hours,c.hoursText)}${block(c.address,c.addressText)}${block(c.contact,c.contactText)}${block(c.appointment,c.appointmentText)}</div></section><section class="map-panel map-live reveal"><iframe class="map-embed" src="https://maps.google.com/maps?q=14.124170,100.508497&amp;z=15&amp;output=embed" title="${c.map}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></section><section class="map-actions"><div><p class="eyebrow">${c.map}</p><p>${c.mapNote}</p></div><div class="hero-actions"><a class="button fill" href="https://www.google.com/maps/dir/?api=1&amp;destination=14.124170,100.508497" target="_blank" rel="noopener">${c.directions} <span>↗</span></a><a class="button" href="https://www.google.com/maps/search/?api=1&amp;query=14.124170%2C100.508497" target="_blank" rel="noopener">${c.openMaps}</a></div></section></article>`;
}

function notFoundPage(code = '404') {
  return `<article class="page not-found"><div><strong>${code === '404' ? '404' : code}</strong><h1>${tr('unknown_title')}</h1><p>${tr('unknown_text')}</p><div class="hero-actions" style="justify-content:center"><a class="button fill" href="#/collection">${tr('back_collection')}</a><button class="button" type="button" id="try-code">${tr('try_code')}</button></div></div></article>`;
}

function renderCollection() {
  const query = state.filters.query.trim().toLowerCase();
  const filtered = state.items.filter(item => {
    const haystack = [item.code, item.name_en, item.name_th, item.wood_en, item.wood_th, item.type_en, item.type_th].join(' ').toLowerCase();
    const typeMatch = state.filters.type === 'all' || item.type_key === state.filters.type;
    const statusMatch = state.filters.status === 'all' || item.status === state.filters.status;
    const priceMatch = state.filters.price === 'all' || (state.filters.price === 'under10' && item.price < 10000) || (state.filters.price === '10-25' && item.price >= 10000 && item.price <= 25000) || (state.filters.price === 'over25' && item.price > 25000);
    return haystack.includes(query) && typeMatch && statusMatch && priceMatch;
  });
  $('#catalog-grid').innerHTML = filtered.length ? filtered.map(productCard).join('') : `<div class="empty-state"><p class="lead">${tr('no_results')}</p><button class="button" id="empty-clear" type="button">${tr('clear_filters')}</button></div>`;
  $('#result-count').textContent = `${tr('showing')} ${filtered.length} ${filtered.length === 1 ? tr('result') : tr('results')}`;
  bindReveals();
  $('#empty-clear')?.addEventListener('click', clearFilters);
}

function clearFilters() {
  state.filters = { query: '', type: 'all', price: 'all', status: 'all' };
  if ($('#catalog-search')) $('#catalog-search').value = '';
  if ($('#price-filter')) $('#price-filter').value = 'all';
  $$('.filter-chip').forEach(chip => chip.classList.toggle('active', (chip.dataset.filter || chip.dataset.status) === 'all'));
  renderCollection();
}

function bindCollection() {
  $('#price-filter').value = state.filters.price;
  $('#catalog-search').addEventListener('input', event => { state.filters.query = event.target.value; renderCollection(); });
  $('#price-filter').addEventListener('change', event => { state.filters.price = event.target.value; renderCollection(); });
  $$('.filter-chip[data-filter]').forEach(chip => chip.addEventListener('click', () => { state.filters.type = chip.dataset.filter; $$('.filter-chip[data-filter]').forEach(entry => entry.classList.toggle('active', entry === chip)); renderCollection(); }));
  $$('.filter-chip[data-status]').forEach(chip => chip.addEventListener('click', () => { state.filters.status = chip.dataset.status; $$('.filter-chip[data-status]').forEach(entry => entry.classList.toggle('active', entry === chip)); renderCollection(); }));
  $('#clear-filters').addEventListener('click', clearFilters);
  renderCollection();
}

function bindItem(code) {
  const item = state.items.find(entry => entry.code.toUpperCase() === code.toUpperCase());
  if (!item) { $('#try-code')?.addEventListener('click', openCodeSearch); return; }
  state.lightboxImages = galleryOf(item);
  $$('[data-gallery-index]').forEach(button => button.addEventListener('click', () => openLightbox(Number(button.dataset.galleryIndex))));
  $('#copy-link')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast(tr('link_copied')); }
    catch { const input = document.createElement('input'); input.value = location.href; document.body.append(input); input.select(); document.execCommand('copy'); input.remove(); toast(tr('link_copied')); }
  });
  // Contact bar is visible from page load (owner feedback 2026-09-17: contact was too hard to find).
  // It is moved to <body> because the animated .page transform would otherwise trap position:fixed.
  const sticky = $('#app #sticky-contact');
  if (sticky) { document.body.append(sticky); setTimeout(() => sticky.classList.add('show'), 60); }
}

function bindReveals() {
  const nodes = $$('.reveal:not(.in-view)');
  if (!('IntersectionObserver' in window)) { nodes.forEach(node => node.classList.add('in-view')); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }), { threshold: .09, rootMargin: '0px 0px -5% 0px' });
  nodes.forEach(node => observer.observe(node));
}

function bindParallax() {
  const visual = $('.home-hero-visual img, .dark-hero > img');
  if (!visual || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const update = () => { if (scrollY < innerHeight * 1.1) visual.style.transform = `translate3d(0, ${scrollY * .07}px, 0) scale(1.04)`; };
  window.addEventListener('scroll', update, { passive: true });
}

function parseRoute() {
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  let route = parts[0] || 'home';
  if (route === 'catalog') route = 'collection';
  if (route === 'about') route = 'visit';
  if (HIDDEN_ROUTES.includes(route)) route = 'home';
  return { route, code: parts[1], query };
}

function render() {
  const { route, code, query } = parseRoute();
  const app = $('#app');
  $$('body > #sticky-contact').forEach(bar => bar.remove());
  window.scrollTo(0, 0);
  closeMenu();
  $$('.main-nav a,.mobile-menu a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  const dark = ['craft','visit'].includes(route);
  $('#site-header').classList.toggle('is-dark', dark);
  $('#site-header').classList.toggle('is-solid', !dark);
  if (route === 'home') app.innerHTML = homePage();
  else if (route === 'collection') app.innerHTML = collectionPage(query);
  else if (route === 'item' && code) app.innerHTML = itemPage(code);
  else if (route === 'craft') app.innerHTML = craftPage();
  else if (route === 'stories') app.innerHTML = storiesPage();
  else if (route === 'visit') app.innerHTML = visitPage();
  else app.innerHTML = notFoundPage();
  document.title = route === 'item' && code ? `${code} — RAAKRAK` : `RAAKRAK — ${tr(`nav_${route}`) || 'Rooted by Nature'}`;
  if (route === 'collection') bindCollection();
  if (route === 'item' && code) bindItem(code);
  $('#try-code')?.addEventListener('click', openCodeSearch);
  bindReveals(); bindParallax();
  requestAnimationFrame(() => $('#home-hero')?.classList.add('loaded'));
  app.focus({ preventScroll: true });
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach(node => { node.textContent = tr(node.dataset.i18n); });
  $('.lang-current').textContent = state.lang.toUpperCase();
  $('.lang-other').textContent = state.lang === 'en' ? 'TH' : 'EN';
  render();
}

function openCodeSearch() {
  $('#code-search').hidden = false; document.body.classList.add('overlay-open');
  setTimeout(() => $('#code-search-input').focus(), 50);
}
function closeCodeSearch() { $('#code-search').hidden = true; document.body.classList.remove('overlay-open'); }
function openLightbox(index) { state.lightboxIndex = index; updateLightbox(); $('#lightbox').hidden = false; document.body.classList.add('overlay-open'); }
function updateLightbox() { const box = $('#lightbox'); $('img', box).src = versioned(state.lightboxImages[state.lightboxIndex]); $('.lightbox-count', box).textContent = `${state.lightboxIndex + 1} / ${state.lightboxImages.length}`; }
function moveLightbox(amount) { state.lightboxIndex = (state.lightboxIndex + amount + state.lightboxImages.length) % state.lightboxImages.length; updateLightbox(); }
function closeLightbox() { $('#lightbox').hidden = true; document.body.classList.remove('overlay-open'); }
function toast(message) { const node = $('#toast'); node.textContent = message; node.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('show'), 2300); }
function closeMenu() { $('#mobile-menu').classList.remove('open'); $('#mobile-menu').setAttribute('aria-hidden','true'); $('#menu-toggle').setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); }

function bindGlobal() {
  window.addEventListener('hashchange', render);
  document.addEventListener('click', event => { if (event.target.closest('[data-contact-pending]')) { event.preventDefault(); toast(tr('contact_pending')); } });
  window.addEventListener('scroll', () => { const { route } = parseRoute(); if (['craft','visit'].includes(route)) $('#site-header').classList.toggle('is-solid', scrollY > 30); }, { passive: true });
  $('#lang-toggle').addEventListener('click', () => { state.lang = state.lang === 'en' ? 'th' : 'en'; localStorage.setItem('raakrak-lang', state.lang); applyLanguage(); });
  $('#menu-toggle').addEventListener('click', () => { const open = !$('#mobile-menu').classList.contains('open'); $('#mobile-menu').classList.toggle('open', open); $('#mobile-menu').setAttribute('aria-hidden', String(!open)); $('#menu-toggle').setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open); });
  $('#code-trigger').addEventListener('click', openCodeSearch);
  $('.overlay-close').addEventListener('click', closeCodeSearch);
  $('#code-search').addEventListener('click', event => { if (event.target === event.currentTarget) closeCodeSearch(); });
  $('#code-search-form').addEventListener('submit', event => { event.preventDefault(); const code = $('#code-search-input').value.trim().toUpperCase(); if (code) { closeCodeSearch(); location.hash = `#/item/${encodeURIComponent(code)}`; } });
  $('.lightbox-close').addEventListener('click', closeLightbox); $('.lightbox-prev').addEventListener('click', () => moveLightbox(-1)); $('.lightbox-next').addEventListener('click', () => moveLightbox(1));
  $('#lightbox').addEventListener('click', event => { if (event.target === event.currentTarget) closeLightbox(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeCodeSearch(); closeLightbox(); closeMenu(); } if (!$('#lightbox').hidden && event.key === 'ArrowLeft') moveLightbox(-1); if (!$('#lightbox').hidden && event.key === 'ArrowRight') moveLightbox(1); });
}

async function init() {
  try {
    const response = await fetch('data/items.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.items = await response.json();
    bindGlobal(); applyLanguage();
  } catch (error) {
    $('#app').innerHTML = `<section class="not-found"><div><strong>!</strong><h1>Could not load the catalogue</h1><p>Run this mockup through the local server command in README.md.<br><small>${error.message}</small></p></div></section>`;
    console.error('RAAKRAK data load failed:', error);
  }
}

init();
