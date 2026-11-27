/**
 * Everything the assistant knows about REGINA, collected from the company website
 * (regina.media321action.workers.dev: home, about, caps, hats, t-shirts, winter, coverall, graduation, design studio).
 * This is the ONLY source the assistant may answer from. Update it when the business changes.
 * Nothing here is a price, a date or a promise.
 */
export const SITE = "https://regina.media321action.workers.dev";

export const KNOWLEDGE = `
=== WHO WE ARE ===
- REGINA (ريجينا): Egyptian factory for caps, uniforms and workwear in Alexandria, since 1983 (40+ years).
- We manufacture 20+ products in our OWN factory (no middleman): "fair price straight from the factory".
- Multi-head computerised embroidery machines (precise even on complex logos), high-capacity production lines for large supply orders on schedule, colourfast dyes, solid finishing, strict quality and colour-fastness standards.
- 150+ brands served. The website lists names such as Coca-Cola, Pepsi, McDonald's, Burger King, Domino's, Pizza Hut, Vodafone, Etisalat, Samsung, LG, Shell, Mobil, EgyptAir, FedEx, Nestlé, Mercedes-Benz, Honda, Jotun, Sika, Pirelli, Petrojet, AASTMT, Cambridge International Education; plus large governmental bodies (e.g. caps and t-shirts for naval sectors, commemorative caps for the New Suez Canal opening). Mention 3-4 names only when asked about experience/clients.
- Sectors we serve: company uniforms, field and engineering teams, outdoor events, factories and industry, kitchens and restaurants, security teams, schools and universities, events and gifts.

=== CONTACT ===
- Address: 15 El Nasr St., El Mansheya, Alexandria (١٥ شارع النصر، المنشية، الإسكندرية).
- Phones: 03 4806229 / 01002882044 / 01220225303. WhatsApp: 01211777728. Facebook: facebook.com/Regina.Hats.Alex
- Hours: 9:00 am to 6:00 pm, closed Sunday.
- Website: ${SITE}

=== PRODUCTS (recommend by use, and share the page link when helpful) ===
CAPS — ${SITE}/caps.html
- كاب عادي (Classic): our best seller; raised embroidery; colourfast. Good all-round company cap.
- كاب ريجينا (Regina): denim, very hard-wearing. Good for a premium/casual brand look.
- كاب شيف (Chef): 100% cotton, breathable, made for kitchen heat. -> restaurants, kitchens, cafés.
- كاب القوات الجوية (Air Force): disciplined uniform look with high-precision embroidery. -> security teams, guards, official teams.
- الفاروقية (Faroukia): royal classic style. -> formal/official occasions.
- بندانة (Bandana): light, mesh ventilation, one size. -> kitchens, workshops, events.
- فايزر (Visor): wide shade for face and eyes, comfortable fabric. -> sun, outdoor events, sports, beaches.
HATS — ${SITE}/hats.html
- سفاري (Safari): premium cotton, sun protection. -> trips, camping, field work.
- بوب هات (Bob): light, all-round shade. -> outdoor events, youth campaigns.
- سفاري بحبل (Safari with cord): heavy cotton, wind and desert resistant. -> desert sites, engineers, expeditions.
- كوماندو (Commando): tactical cut, short brim, reinforced stitching. -> field/tactical teams.
T-SHIRTS — ${SITE}/tshirts.html
- بولو (Polo): 100% cotton, smart formal look, professional embroidered logo. -> company staff, sales, reception, events.
- بيرزك / راوند (Basic round neck): 100% cotton, breathable, resists pilling and fading, accurate sizing. -> events, campaigns, giveaways, daily uniform.
- Branding: embroidery (تطريز) or screen print (سلك سكرين).
WINTER — ${SITE}/winter.html
- جاكيت (Jacket): heavy, cold and rain proof, wear resistant, freedom of movement. -> outdoor staff in winter, security, drivers.
- هودي (Hoodie): modern, wind and cold proof. -> teams, students, events.
- حوض (Crew neck sweatshirt): no hood, ribbed neck, everyday wear.
WORKWEAR — ${SITE}/coverall.html
- أوفرول (Coverall): heavy duty, tool pockets, withstands work pressure, full freedom of movement. -> factories, maintenance, technicians.
- إيبرون (Waist apron): heat and wash resistant. -> kitchens, cafés, shops.
- مريلة (Bib apron): chest cover, neck strap, front pockets. -> kitchens, workshops, salons.
GRADUATION — ${SITE}/graduation.html
- Gown (روب) + cap (كاب) set, in the faculty's colour, made to the students' sizes, with institution logo and graduation year; delivered before the ceremony on a date fixed in the contract. -> universities and schools.
CUSTOM: any special design or specification can be produced by our technical team from the customer's details.
NOT ON THE WEBSITE (always say the team will confirm): exact fabric weights, full colour palettes, size charts and size ranges, minimum quantities, prices, payment terms, exact delivery dates.

=== BRANDING AND THE DESIGN STUDIO ===
- Logos are embroidered or printed, in the customer's colours, at the position they choose.
- Free online Design Studio: ${SITE}/customize.html
  3D preview of polo (short and long sleeve), round-neck T-shirt and cap; rotate 360°; upload logo (PNG with transparent background, SVG or JPG); place it (chest centre/left/right, pocket, centre), resize and tilt; choose colours (shirts: body, sleeves, collar/placket/cuffs, pocket; caps: crown, brim and strap, top button); then press "Send This Design for a Quote" to send it on WhatsApp. If the 3D view doesn't open, use Chrome or Safari, or just send the logo here and the team prepares a mockup.

=== HOW ORDERING WORKS (our real process) ===
1. Send the logo + the products + approximate quantities (here on WhatsApp).
2. The team sends a price quote suited to the order size.
3. A REAL SAMPLE is made with the logo embroidered/printed; production starts only after the customer approves it.
4. Delivery to the company/factory door in any Egyptian governorate, on a delivery date written in the contract.

=== OUR ANSWERS TO COMMON QUESTIONS (say them in natural Egyptian Arabic) ===
- "فيه عينة؟" -> أيوه، العينة أساسية في كل طلب: بنطرّز أو نطبع اللوجو على قطعة حقيقية الأول، ومفيش إنتاج غير بعد موافقتك عليها.
- "أقل كمية كام؟" -> بتختلف حسب المنتج وطريقة الطباعة أو التطريز؛ ابعتلنا المنتج والكمية التقريبية والفريق يأكدلك.
- "الطلب بياخد قد إيه؟" -> حسب الكمية والموديل، والفريق بيحدد ميعاد تسليم ثابت مكتوب في العقد، والإنتاج بيبدأ بعد اعتماد التصميم.
- "بتشحنوا لمحافظتي؟" -> أيوه، بنوصّل لكل محافظات مصر لحد باب الشركة أو المصنع.
- "لو في عيب؟" -> لو أي قطعة طلعت مختلفة عن العينة المعتمدة بسبب عيب تصنيع، بنعيدها أو نبدّلها من غير أي تكلفة إضافية.
- "الخامة بتستحمل؟" -> خاماتنا مختارة للشغل اليومي والغسيل المتكرر، والتيشيرتات والبولو قطن 100%.
- "ينفع تصميم مخصوص؟" -> أكيد، ابعتلنا التفاصيل والفريق الفني ينفذها.
- "ممكن أشوف شكل اللوجو على المنتج؟" -> استخدم استوديو التصميم (${SITE}/customize.html) أو ابعت اللوجو هنا والفريق يعملك تصور.
- "انتو فين؟" -> مصنعنا ومكتبنا في ١٥ شارع النصر، المنشية، إسكندرية.
- "مين اشتغل معاكم؟" -> أكتر من 150 براند من أكتر من 40 سنة، زي (اذكر 3-4 أسماء من القائمة).
- "ليه أختاركم؟" -> مصنع من 1983 بيصنّع بنفسه (سعر مصنع عادل)، تطريز كمبيوتر دقيق، عينة قبل الإنتاج، وميعاد تسليم ثابت في العقد.
`.trim();
