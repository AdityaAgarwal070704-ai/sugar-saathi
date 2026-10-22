import type { Lang } from "./i18n";
import type { Food } from "./types";

// Short, practical lessons in English and Hindi. Static, conservative wording: general diabetes-education ideas,
// never medical advice, doses or diagnosis. {c:dish_id} is replaced with that dish's carbs from the food table, so
// numbers here always match the rest of the app.
type L = { en: string; hi: string };
type LL = { en: string[]; hi: string[] };

export type Lesson = {
  id: string;
  icon: string;
  title: L;
  intro: L;
  points: LL;
  tryToday: L;
  ask?: L;
  link?: { href: string; label: L };
};

export const LESSONS: Lesson[] = [
  {
    id: "plate",
    icon: "🍽️",
    title: { en: "Build a balanced thali", hi: "संतुलित थाली बनाएँ" },
    intro: { en: "A simple way to shape every plate without weighing anything.", hi: "बिना कुछ तौले हर थाली को संतुलित बनाने का आसान तरीका।" },
    points: {
      en: [
        "Fill about half the plate with vegetables: sabzi, salad, raita with cucumber.",
        "Keep about a quarter for dal, paneer, egg, fish, chicken or sprouts.",
        "Keep about a quarter for roti or rice.",
        "Eat the sabzi and dal first, then the roti or rice. Use a smaller katori for rice.",
      ],
      hi: [
        "थाली का लगभग आधा हिस्सा सब्जियों से भरें: सब्जी, सलाद, खीरे का रायता।",
        "लगभग चौथाई हिस्सा दाल, पनीर, अंडा, मछली, चिकन या अंकुरित अनाज के लिए रखें।",
        "लगभग चौथाई हिस्सा रोटी या चावल के लिए रखें।",
        "पहले सब्जी और दाल खाएँ, फिर रोटी या चावल। चावल के लिए छोटी कटोरी लें।",
      ],
    },
    tryToday: { en: "At your next meal, serve the sabzi or salad first and see how full you feel.", hi: "अगले भोजन में पहले सब्जी या सलाद परोसें और देखें कि पेट कितना भरा लगता है।" },
    ask: { en: "How many carbs per meal suit me?", hi: "मेरे लिए प्रति भोजन कितने कार्ब्स ठीक हैं?" },
  },
  {
    id: "roti-rice",
    icon: "🫓",
    title: { en: "Roti or rice? Portions that make sense", hi: "रोटी या चावल? सही मात्रा" },
    intro: { en: "Both are fine in the right amount. The portion matters more than the choice.", hi: "दोनों सही मात्रा में ठीक हैं। चुनाव से ज़्यादा मात्रा मायने रखती है।" },
    points: {
      en: [
        "One roti has about {c:roti} g of carbs. One katori of cooked rice has about {c:white_rice} g.",
        "So two rotis and one katori of rice are quite similar. Three rotis or two katori of rice add up fast.",
        "Bajra, jowar and ragi rotis have more fibre than white rice or refined flour.",
        "Pair either with dal and sabzi, so the carbs arrive with fibre and protein.",
      ],
      hi: [
        "एक रोटी में लगभग {c:roti} ग्राम कार्ब्स होते हैं। एक कटोरी पके चावल में लगभग {c:white_rice} ग्राम।",
        "यानी दो रोटी और एक कटोरी चावल लगभग बराबर हैं। तीन रोटी या दो कटोरी चावल जल्दी बढ़ जाते हैं।",
        "बाजरा, ज्वार और रागी की रोटी में सफ़ेद चावल या मैदे से ज़्यादा फाइबर होता है।",
        "दोनों के साथ दाल और सब्जी लें, ताकि कार्ब्स फाइबर और प्रोटीन के साथ आएँ।",
      ],
    },
    tryToday: { en: "Log your usual roti or rice portion and check how many grams of carbs it really is.", hi: "अपनी रोज़ की रोटी या चावल की मात्रा दर्ज करें और देखें कि असल में कितने ग्राम कार्ब्स हैं।" },
  },
  {
    id: "fibre-protein",
    icon: "🥦",
    title: { en: "Why fibre and protein help", hi: "फाइबर और प्रोटीन क्यों मदद करते हैं" },
    intro: { en: "They slow down how quickly carbs reach your blood and keep you full for longer.", hi: "ये कार्ब्स के खून तक पहुँचने की गति धीमी करते हैं और पेट देर तक भरा रखते हैं।" },
    points: {
      en: [
        "Fibre comes from vegetables, salad, dal, rajma, chole, sprouts, fruit with skin and whole grains.",
        "Protein comes from dal, curd, paneer, eggs, fish, chicken, soya and sprouts.",
        "A meal of plain rice or poha alone has little of either. Adding dal, curd or a sabzi changes that.",
      ],
      hi: [
        "फाइबर सब्जियों, सलाद, दाल, राजमा, छोले, अंकुरित अनाज, छिलके वाले फल और साबुत अनाज से मिलता है।",
        "प्रोटीन दाल, दही, पनीर, अंडे, मछली, चिकन, सोया और अंकुरित अनाज से मिलता है।",
        "सिर्फ सादे चावल या पोहे के भोजन में दोनों कम होते हैं। दाल, दही या सब्जी जोड़ने से यह बदल जाता है।",
      ],
    },
    tryToday: { en: "Add one protein or one extra sabzi to a meal that usually has only carbs.", hi: "जिस भोजन में आमतौर पर सिर्फ कार्ब्स होते हैं, उसमें एक प्रोटीन या एक और सब्जी जोड़ें।" },
  },
  {
    id: "gi-gl",
    icon: "📊",
    title: { en: "Glycemic index and load, simply", hi: "ग्लाइसेमिक इंडेक्स और लोड, आसान भाषा में" },
    intro: { en: "Two numbers that explain why some foods raise sugar faster than others.", hi: "दो संख्याएँ जो बताती हैं कि कुछ खाने शुगर को दूसरों से तेज़ क्यों बढ़ाते हैं।" },
    points: {
      en: [
        "Glycemic index (GI) ranks how fast a carb food tends to raise blood sugar, from 0 to 100.",
        "Glycemic load (GL) also counts how much you eat: GI × carbs ÷ 100. A big portion of a medium-GI food can still be a big load.",
        "Sugar Saathi's gauge uses glycemic load for the whole meal. It is a general guide, not a prediction for you.",
        "Your own readings are the best guide. That is why the app asks for a reading before and 2 hours after.",
      ],
      hi: [
        "ग्लाइसेमिक इंडेक्स (GI) बताता है कि कोई कार्ब वाला खाना खून में शुगर कितनी तेज़ी से बढ़ाता है, 0 से 100 के पैमाने पर।",
        "ग्लाइसेमिक लोड (GL) में यह भी गिना जाता है कि आपने कितना खाया: GI × कार्ब्स ÷ 100। मध्यम GI वाले खाने की बड़ी मात्रा भी बड़ा लोड बन सकती है।",
        "शुगर साथी का गेज पूरे भोजन का ग्लाइसेमिक लोड इस्तेमाल करता है। यह एक सामान्य मार्गदर्शन है, आपके लिए भविष्यवाणी नहीं।",
        "आपकी अपनी रीडिंग सबसे अच्छा मार्गदर्शक हैं। इसीलिए ऐप खाने से पहले और 2 घंटे बाद की रीडिंग माँगता है।",
      ],
    },
    tryToday: { en: "Compare two dishes you eat often on the Eating out page and look at their glycemic load.", hi: "'बाहर का खाना' पेज पर अपने रोज़ के दो व्यंजनों की तुलना करें और उनका ग्लाइसेमिक लोड देखें।" },
    link: { href: "/app/eating-out", label: { en: "Compare dishes", hi: "व्यंजनों की तुलना करें" } },
  },
  {
    id: "labels",
    icon: "🏷️",
    title: { en: "Reading packet labels", hi: "पैकेट के लेबल पढ़ना" },
    intro: { en: "Biscuits, namkeen and ready mixes can hide a lot of carbs.", hi: "बिस्कुट, नमकीन और रेडी-मिक्स में काफ़ी कार्ब्स छिपे हो सकते हैं।" },
    points: {
      en: [
        "Check the serving size first. Many packs hold two or three servings.",
        "Look at total carbohydrate, not just sugar. Atta, maida and starch count too.",
        "\"Sugar free\" does not mean carb free, and \"multigrain\" does not always mean whole grain.",
        "Compare per 100 g when you are choosing between two packs.",
      ],
      hi: [
        "सबसे पहले सर्विंग साइज़ देखें। कई पैकेट में दो-तीन सर्विंग होती हैं।",
        "सिर्फ शुगर नहीं, कुल कार्बोहाइड्रेट देखें। आटा, मैदा और स्टार्च भी गिने जाते हैं।",
        "\"शुगर फ्री\" का मतलब कार्ब फ्री नहीं है, और \"मल्टीग्रेन\" हमेशा साबुत अनाज नहीं होता।",
        "दो पैकेट में से चुनते समय प्रति 100 ग्राम की तुलना करें।",
      ],
    },
    tryToday: { en: "Pick one packaged food at home and find its total carbohydrate per serving.", hi: "घर का कोई एक पैकेट वाला खाना चुनें और प्रति सर्विंग कुल कार्बोहाइड्रेट ढूँढें।" },
  },
  {
    id: "check",
    icon: "🩸",
    title: { en: "Why check before and 2 hours after a meal", hi: "खाने से पहले और 2 घंटे बाद जाँच क्यों" },
    intro: { en: "Two readings show what that exact meal did to you.", hi: "दो रीडिंग दिखाती हैं कि उसी भोजन ने आप पर क्या असर किया।" },
    points: {
      en: [
        "The reading before the meal is your starting point. The reading about 2 hours after shows the rise.",
        "One reading is one data point. Patterns over several meals are more useful.",
        "Note unusual days, such as illness, poor sleep, stress, travel or a skipped meal.",
        "If a reading is outside the range your doctor gave you, follow your doctor's plan. If you feel unwell, contact your doctor or emergency services.",
      ],
      hi: [
        "भोजन से पहले की रीडिंग आपकी शुरुआती रीडिंग है। लगभग 2 घंटे बाद की रीडिंग वृद्धि दिखाती है।",
        "एक रीडिंग सिर्फ एक आँकड़ा है। कई भोजनों का पैटर्न ज़्यादा काम का होता है।",
        "असामान्य दिन नोट करें, जैसे बीमारी, कम नींद, तनाव, यात्रा या छूटा हुआ भोजन।",
        "अगर रीडिंग उस सीमा से बाहर हो जो डॉक्टर ने दी है, तो डॉक्टर की योजना का पालन करें। तबीयत ठीक न लगे तो अपने डॉक्टर या आपातकालीन सेवाओं से संपर्क करें।",
      ],
    },
    tryToday: { en: "Log your next meal and add both readings. After three similar meals, the app can show a personal range.", hi: "अपना अगला भोजन दर्ज करें और दोनों रीडिंग जोड़ें। तीन मिलते-जुलते भोजनों के बाद ऐप आपका अपना दायरा दिखा सकता है।" },
    ask: { en: "How often should I check, and at what times?", hi: "मुझे कितनी बार और किस समय जाँच करनी चाहिए?" },
  },
  {
    id: "sweet-drinks",
    icon: "🥤",
    title: { en: "Sweet drinks add up", hi: "मीठे पेय चुपके से बढ़ते हैं" },
    intro: { en: "Liquid carbs arrive fast, with nothing to slow them down.", hi: "तरल कार्ब्स तेज़ी से आते हैं और उन्हें धीमा करने वाला कुछ नहीं होता।" },
    points: {
      en: [
        "A cup of chai with sugar has about {c:chai_sugar} g of carbs. Three cups a day is {c:chai_sugar} × 3.",
        "A glass of cola has about {c:cola} g, and sugarcane juice about {c:sugarcane_juice} g.",
        "Chaas, plain water, nimbu pani without sugar and black coffee have almost none.",
        "Fruit juice has the sugar of the fruit without its fibre. The whole fruit is the better choice.",
      ],
      hi: [
        "चीनी वाली एक कप चाय में लगभग {c:chai_sugar} ग्राम कार्ब्स होते हैं। दिन में तीन कप यानी {c:chai_sugar} × 3।",
        "एक गिलास कोल्ड ड्रिंक में लगभग {c:cola} ग्राम और गन्ने के रस में लगभग {c:sugarcane_juice} ग्राम।",
        "छाछ, सादा पानी, बिना चीनी का नींबू पानी और ब्लैक कॉफी में लगभग कुछ नहीं होता।",
        "फलों के जूस में फल की शक्कर होती है पर उसका फाइबर नहीं। पूरा फल बेहतर चुनाव है।",
      ],
    },
    tryToday: { en: "Count your sweet drinks today and try swapping one for chaas or water.", hi: "आज अपने मीठे पेय गिनें और एक की जगह छाछ या पानी लेकर देखें।" },
  },
  {
    id: "eating-out",
    icon: "🍛",
    title: { en: "Eating out and ordering in", hi: "बाहर खाना और ऑर्डर करना" },
    intro: { en: "You can enjoy restaurants and delivery with a few simple habits.", hi: "कुछ आसान आदतों के साथ आप रेस्टोरेंट और डिलीवरी का मज़ा ले सकते हैं।" },
    points: {
      en: [
        "Choose roti or tandoori roti over naan or kulcha: naan has about {c:naan} g of carbs against {c:roti} g for a roti.",
        "Pick grilled or tandoori starters over fried ones.",
        "Ask for dal, a dry sabzi or a salad alongside, and share rice or biryani.",
        "Share dessert instead of ordering one each.",
      ],
      hi: [
        "नान या कुलचे की जगह रोटी या तंदूरी रोटी चुनें: नान में लगभग {c:naan} ग्राम कार्ब्स होते हैं और रोटी में {c:roti} ग्राम।",
        "तले हुए स्टार्टर की जगह ग्रिल्ड या तंदूरी चुनें।",
        "साथ में दाल, सूखी सब्जी या सलाद माँगें, और चावल या बिरयानी बाँटकर खाएँ।",
        "हर किसी के लिए अलग मिठाई मँगाने की जगह मिलकर एक लें।",
      ],
    },
    tryToday: { en: "Before your next order, compare two dishes on the Eating out page.", hi: "अगला ऑर्डर देने से पहले 'बाहर का खाना' पेज पर दो व्यंजनों की तुलना करें।" },
    link: { href: "/app/eating-out", label: { en: "Open Eating out", hi: "बाहर का खाना खोलें" } },
  },
  {
    id: "festivals",
    icon: "🪔",
    title: { en: "Festivals and fasting", hi: "त्योहार और व्रत" },
    intro: { en: "Celebrate with a plan instead of skipping the joy.", hi: "खुशी छोड़ने की जगह योजना के साथ त्योहार मनाएँ।" },
    points: {
      en: [
        "Decide how many carbs you will set aside for sweets, then pick one or two favourites.",
        "Have sweets after a balanced meal rather than on an empty stomach.",
        "Vrat foods like sabudana, potato and sweets are quick carbs. Pair them with curd, nuts or paneer.",
        "Fasting can change what your body needs when you have diabetes. Talk to your doctor before you fast.",
      ],
      hi: [
        "तय करें कि मिठाई के लिए कितने कार्ब्स रखेंगे, फिर एक-दो पसंदीदा चुनें।",
        "खाली पेट की जगह संतुलित भोजन के बाद मिठाई लें।",
        "साबूदाना, आलू और मिठाई जैसे व्रत के खाने तेज़ कार्ब्स हैं। इन्हें दही, मेवे या पनीर के साथ लें।",
        "डायबिटीज़ में उपवास से शरीर की ज़रूरतें बदल सकती हैं। उपवास से पहले अपने डॉक्टर से बात करें।",
      ],
    },
    tryToday: { en: "Open the sweet budget and see how many pieces of your favourite fit.", hi: "मिठाई का बजट खोलें और देखें कि आपकी पसंदीदा मिठाई के कितने टुकड़े आ सकते हैं।" },
    ask: { en: "Is it safe for me to fast, and what should I change?", hi: "क्या मेरे लिए उपवास करना सुरक्षित है, और मुझे क्या बदलना चाहिए?" },
    link: { href: "/app/occasions", label: { en: "Fasting and festivals", hi: "व्रत और त्योहार" } },
  },
  {
    id: "sleep-stress",
    icon: "🛌",
    title: { en: "Sleep, stress and your readings", hi: "नींद, तनाव और आपकी रीडिंग" },
    intro: { en: "Food is not the only thing that moves your sugar.", hi: "आपके शुगर को सिर्फ खाना ही नहीं बदलता।" },
    points: {
      en: [
        "Poor sleep, stress, illness, travel and activity can all change a reading.",
        "That is why the same meal can give different results on different days.",
        "Jotting a quick note about an unusual day helps you and your educator make sense of the numbers.",
      ],
      hi: [
        "कम नींद, तनाव, बीमारी, यात्रा और गतिविधि, सब रीडिंग बदल सकते हैं।",
        "इसीलिए एक ही भोजन अलग-अलग दिन अलग नतीजे दे सकता है।",
        "असामान्य दिन के बारे में छोटा-सा नोट लिख लेने से आपको और आपके एजुकेटर को आँकड़े समझने में आसानी होती है।",
      ],
    },
    tryToday: { en: "If a reading surprises you, think about sleep, stress and activity before blaming the food.", hi: "अगर कोई रीडिंग चौंकाए तो खाने को दोष देने से पहले नींद, तनाव और गतिविधि के बारे में सोचें।" },
    ask: { en: "If my readings stay high for no clear reason, what should I do?", hi: "अगर बिना किसी साफ़ कारण के मेरी रीडिंग ऊँची रहें तो मुझे क्या करना चाहिए?" },
  },
  {
    id: "appointment",
    icon: "📄",
    title: { en: "Make the most of your appointment", hi: "अपनी अपॉइंटमेंट का पूरा फ़ायदा उठाएँ" },
    intro: { en: "Bring your week with you, so the visit is about you and not about guessing.", hi: "अपना हफ्ता साथ ले जाएँ, ताकि मुलाकात अंदाज़ों की नहीं, आपकी बात हो।" },
    points: {
      en: [
        "Open the Report page and print it, save it as a PDF or share it on WhatsApp.",
        "Pick two or three things you noticed, such as a meal that always spikes you.",
        "Write down questions before you go.",
      ],
      hi: [
        "रिपोर्ट पेज खोलें और उसे प्रिंट करें, PDF में सहेजें या व्हाट्सऐप पर भेजें।",
        "दो-तीन बातें चुनें जो आपने देखीं, जैसे कोई भोजन जो हमेशा शुगर बढ़ाता है।",
        "जाने से पहले अपने सवाल लिख लें।",
      ],
    },
    tryToday: { en: "Write down three questions for your next visit.", hi: "अगली मुलाकात के लिए तीन सवाल लिख लें।" },
    ask: { en: "Are my targets still right? How often should I test? Which foods should I look at first?", hi: "क्या मेरे लक्ष्य अब भी सही हैं? मुझे कितनी बार जाँच करनी चाहिए? सबसे पहले किन खानों पर ध्यान दूँ?" },
    link: { href: "/app/report", label: { en: "Open my report", hi: "मेरी रिपोर्ट खोलें" } },
  },
];

// Fills {c:dish_id} with that dish's carbs from the food table.
export function fill(text: string, foods: Pick<Food, "id" | "carbs">[]): string {
  return text.replace(/\{c:(\w+)\}/g, (m, id) => {
    const f = foods.find((x) => x.id === id);
    return f ? String(f.carbs) : m;
  });
}

export function pick(l: L, lang: Lang): string {
  return l[lang];
}
