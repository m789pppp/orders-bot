/**
 * Everything the assistant knows about REGINA, collected from the company website
 * (regina.media321action.workers.dev: home + FAQ, about, design studio, every category and product page).
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
- Hours: every day 9:00 am to 6:00 pm, except Sunday (closed).
- Website: ${SITE}

=== PRODUCTS (recommend by use; share the product page link when helpful) ===
CAPS (الكابات) — ${SITE}/caps.html
- كاب عادي (Classic) ${SITE}/classic-cap.html : the most requested cap for companies outfitting their teams; our best seller; classic comfortable shape for daily wear; clean RAISED embroidery of the logo; colourfast. -> any company team, daily uniform.
- كاب ريجينا (Regina) ${SITE}/regina-cap.html : denim (جينز), very hard-wearing, embroidered; a uniform that lasts the team for years. -> premium/casual brand look, long-lasting uniform.
- كاب شيف (Chef) ${SITE}/chef-cap.html : "the professional standard for big kitchens and hotels"; soft 100% cotton, excellent airflow under heat, easy to wash, keeps its shape and clean look. -> chefs, restaurants, hotels.
- بندانة شيف (Bandana) ${SITE}/bandana.html : cotton with a mesh ventilation panel at the back; light, stays firmly in place the whole shift; one comfortable size for everyone. -> restaurant chains, site work.
- كاب فايزر (Visor) ${SITE}/visor.html : modern design, protects from sun and UV, wide brim shading face and eyes, ADJUSTABLE strap, bright sharp look. -> teams at events, marketing campaigns, outdoor.
- كاب القوات الجوية (Air Force) ${SITE}/air-force-cap.html : made for security and guarding staff; formal sharp look, wide band, high-precision embroidery; a symbol of discipline. -> security companies, guards.
- كاب الفاروقية (Faroukia) ${SITE}/faroukia-cap.html : luxurious royal design inspired by King Farouk's era (the cap was named after King Farouk after a shooting practice in 1943); classic. -> formal, heritage or official occasions.
HATS (البرانيط) — ${SITE}/hats.html
- برنيطة سفاري (Safari) ${SITE}/safari-hat.html : heavyweight premium cotton, wide brim protecting face and neck from strong sun, embroidered logo. -> trips, camping, field teams.
- برنيطة بوب هات (Bob) ${SITE}/bob-hat.html : modern, lightweight, all-round shade, folds and stores easily. -> promotional campaigns, outdoor events.
- برنيطة سفاري بحبل (Safari with chin cord) ${SITE}/safari-hat-with-cord.html : heavyweight premium cotton for repeated use, wide sun protection, chin cord keeps it secure in wind and desert; professional expedition look. -> desert sites, field expeditions, engineers.
- برنيطة كوماندو (Commando) ${SITE}/commando-hat.html : tactical cut, short brim, reinforced stitching, embroidered logo, for daily field use. -> security and field teams.
T-SHIRTS (تيشيرتات) — ${SITE}/tshirts.html
- تيشيرت بولو (Polo) ${SITE}/polo-shirt.html : 100% cotton, premium formal cut, professional logo embroidery ON THE CHEST; makes the team look professional in front of clients. -> staff who meet clients, sales, reception, company teams.
- تيشيرت رقبة روند / بيرزك (Round neck) ${SITE}/round-neck-tshirt.html : premium 100% cotton, breathable, resists pilling and fading, precise sizing; logo printed or embroidered; the everyday essential of any uniform. -> daily uniforms, events, campaigns, gifts.
WINTER (الشتوي) — ${SITE}/winter.html
- جاكيت شتوي (Winter jacket) ${SITE}/winter-jacket.html : heavyweight fabrics, cold and rain proof, wear resistant, comfort and freedom of movement; "maximum protection for your team in winter". -> outdoor staff in winter, security, drivers.
- سويت شيرت (Sweatshirt) ${SITE}/sweatshirt.html : resists pilling and shrinking with daily use; comes as hoodie or crew neck.
- هودي (Hoodie) ${SITE}/hoodie.html : heavyweight fabric, hood (كابوشون) that blocks wind and cold, modern sharp design, freedom of movement; logo embroidered or printed. -> field teams, company winter uniform, students.
- حوض (Crew neck) ${SITE}/crew-neck-sweatshirt.html : no hood, ribbed neck (رقبة أستك), fits under a jacket; practical everyday winter uniform.
WORKWEAR (ملابس عمل)
- أوفرول (Coverall) ${SITE}/coverall.html : heavy duty for workers and technicians in tough industrial environments, practical tool pockets, withstands work pressure, full freedom of movement. -> factories, maintenance, technicians.
- ايبيرون (Waist apron) ${SITE}/apron.html : treated heat-resistant fabric, adjustable ties, optional pocket; neat professional look all shift. -> cafés, baristas, restaurant service, kitchens.
- مريلة (Bib apron) ${SITE}/bib-apron.html : full chest coverage against stains and spills, neck strap, waist tie, reinforced seams; shows the venue's identity. -> kitchen and service teams, manufacturing teams.
GRADUATION (التخرج) — ${SITE}/graduation.html
- روب تخرج (Gown) ${SITE}/graduation-gown.html : premium flowing fabric, precise tailoring and finishing, colours can be combined, the university/school crest embroidered in detail; made to the students' sizes. -> universities, schools, institutions.
- كاب تخرج (Graduation cap) ${SITE}/graduation-cap.html : premium materials that keep their shape, tassel (شرابة) in the faculty's colour, graduation year embroidered, logo; made for the graduation photo. Sample first, then the full class quantity; delivered before the ceremony.
CUSTOM: any special model or specification for a company can be produced exactly by our technical team from the customer's details.
NOT ON THE WEBSITE (always say the team will confirm): fabric weights/composition where not stated above, colour palettes, size charts and ranges, minimum quantities, prices, payment terms, exact delivery dates.

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
- "ليه أختاركم؟" -> 3 أسباب: سعر مصنع عادل لأننا بنصنّع بنفسنا من 1983، خامة بتستحمل الغسيل والشغل اليومي، والتزام تام بميعاد التسليم المكتوب في العقد. وكمان عينة حقيقية قبل الإنتاج وتطريز كمبيوتر دقيق.
- "المواعيد؟" -> كل يوم من 9 الصبح لـ 6 المسا ما عدا الأحد، وهنا على الواتساب بنستقبل طلبك في أي وقت.
`.trim();
