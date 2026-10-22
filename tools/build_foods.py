# Generates data/foods.json. Values are DRAFT approximations per household unit (grams), NOT verified by a dietitian.
# Columns: id, name, unit, carbs, fibre, protein, fat, gi, category, icon, tags
import json
R = []
def add(*rows):
    R.extend(rows)

# ---- Breads and flatbreads (piece)
add(
 ("roti","Roti / chapati / phulka","piece",15,2.0,3,1.2,62,"grain","🫓",[]),
 ("plain_paratha","Plain paratha","piece",22,2.5,4,6,65,"grain","🫓",[]),
 ("aloo_paratha","Aloo paratha","piece",32,3,5,8,65,"grain","🥔",[]),
 ("gobi_paratha","Gobi paratha","piece",28,3,5,7,60,"grain","🫓",[]),
 ("paneer_paratha","Paneer paratha","piece",30,2.5,9,9,58,"grain","🫓",[]),
 ("methi_paratha","Methi paratha","piece",22,3,5,6,55,"grain","🌿",[]),
 ("lachha_paratha","Lachha paratha","piece",28,1.5,4,9,68,"grain","🫓",["restaurant"]),
 ("thepla","Thepla","piece",14,2,4,4,55,"grain","🫓",[]),
 ("missi_roti","Missi roti (besan + atta)","piece",16,3,5,2.5,50,"grain","🫓",[]),
 ("bajra_roti","Bajra roti","piece",18,2.5,3,1.5,55,"grain","🌾",[]),
 ("jowar_roti","Jowar roti","piece",17,2.5,3,0.8,62,"grain","🌾",[]),
 ("ragi_roti","Ragi roti","piece",18,2.5,2.5,0.7,55,"grain","🌾",[]),
 ("makki_roti","Makki di roti","piece",20,2.5,3,2,65,"grain","🌽",[]),
 ("tandoori_roti","Tandoori roti","piece",22,2.5,4,0.8,62,"grain","🫓",["restaurant"]),
 ("rumali_roti","Rumali roti","piece",15,1,3,0.5,65,"grain","🫓",["restaurant"]),
 ("naan","Naan","piece",45,2,8,6,71,"grain","🫓",["restaurant"]),
 ("kulcha","Kulcha","piece",35,1.5,6,5,70,"grain","🫓",["restaurant"]),
 ("puri","Puri","piece",12,1,3,6,65,"grain","🟡",[]),
 ("luchi","Luchi","piece",12,0.5,2,6,70,"grain","🟡",[]),
 ("bhatura","Bhatura","piece",35,2,6,10,70,"grain","🟡",["restaurant"]),
 ("puran_poli","Puran poli","piece",45,2.5,5,6,70,"grain","🫓",["festival"]),
 ("plain_dosa","Plain dosa","piece",25,1,3,4,77,"grain","🥞",[]),
 ("masala_dosa","Masala dosa","piece",42,3,5,10,70,"grain","🥞",["restaurant"]),
 ("rava_dosa","Rava dosa","piece",25,1,3,5,70,"grain","🥞",["restaurant"]),
 ("pesarattu","Pesarattu (moong dosa)","piece",15,3,6,3,40,"protein","🥞",[]),
 ("adai","Adai (mixed dal dosa)","piece",18,3,6,4,45,"protein","🥞",[]),
 ("uttapam","Uttapam","piece",30,2,6,5,65,"grain","🥞",[]),
 ("idli","Idli","piece",8,1,2,0.4,69,"grain","⚪",[]),
 ("rava_idli","Rava idli","piece",12,1,2,2,65,"grain","⚪",[]),
 ("appam","Appam","piece",18,0.5,2,2,70,"grain","🥞",[]),
 ("idiyappam","Idiyappam (string hoppers)","piece",12,0.5,1.5,0.5,70,"grain","🍜",[]),
 ("besan_chilla","Besan chilla","piece",12,2,5,4,35,"protein","🥞",[]),
 ("moong_cheela","Moong dal cheela","piece",10,2,6,3,35,"protein","🥞",[]),
 ("bread_slice","Bread slice","piece",13,1,3,1,70,"grain","🍞",[]),
 ("pav","Pav","piece",18,1,3,2,73,"grain","🍞",[]),
)

# ---- Rice, millets, breakfast bowls (katori)
add(
 ("white_rice","Steamed white rice","katori",40,0.5,4,0.3,73,"grain","🍚",[]),
 ("brown_rice","Brown rice","katori",36,3,5,1,50,"grain","🍚",[]),
 ("jeera_rice","Jeera rice","katori",42,1,4,4,70,"grain","🍚",["restaurant"]),
 ("curd_rice","Curd rice","katori",30,0.5,5,4,60,"grain","🍚",[]),
 ("lemon_rice","Lemon rice","katori",40,1,4,6,65,"grain","🍋",[]),
 ("tamarind_rice","Tamarind rice (puliyogare)","katori",40,1,4,6,65,"grain","🍚",[]),
 ("tomato_rice","Tomato rice","katori",40,1.5,4,5,65,"grain","🍅",[]),
 ("pulao","Veg pulao","katori",38,3,5,6,62,"grain","🍚",[]),
 ("veg_biryani","Veg biryani","katori",40,3,6,9,65,"grain","🍛",["restaurant"]),
 ("chicken_biryani","Chicken biryani","katori",42,1.5,14,12,58,"grain","🍛",["restaurant"]),
 ("egg_biryani","Egg biryani","katori",41,1.5,10,11,60,"grain","🍛",["restaurant"]),
 ("mutton_biryani","Mutton biryani","katori",42,1.5,14,13,58,"grain","🍛",["restaurant","festival"]),
 ("khichdi","Dal khichdi","katori",30,4,8,5,55,"grain","🍲",[]),
 ("millet_khichdi","Millet khichdi","katori",30,4,7,5,50,"grain","🍲",[]),
 ("bisi_bele_bath","Bisi bele bath","katori",40,4,8,6,55,"grain","🍲",[]),
 ("pongal","Ven pongal","katori",35,2,6,7,65,"grain","🍲",[]),
 ("poha","Poha","katori",30,2,4,5,60,"grain","🍚",[]),
 ("upma","Upma","katori",30,2,4,6,65,"grain","🍚",[]),
 ("semiya_upma","Semiya (vermicelli) upma","katori",32,2,4,5,65,"grain","🍜",[]),
 ("daliya","Daliya (broken wheat) porridge","katori",30,4,6,2,50,"grain","🥣",[]),
 ("oats_porridge","Oats porridge (no sugar)","katori",20,3,5,3,55,"grain","🥣",[]),
 ("ragi_mudde","Ragi mudde (ball)","ball",40,3,3,0.5,60,"grain","🌾",[]),
 ("sabudana_khichdi","Sabudana khichdi","katori",40,2,2,9,70,"grain","🥣",["vrat"]),
)

# ---- Dals and legumes (katori)
add(
 ("dal","Dal (plain toor / moong / masoor)","katori",15,5,8,3,30,"dal","🍲",[]),
 ("dal_tadka","Dal tadka","katori",15,5,8,4,30,"dal","🍲",["restaurant"]),
 ("dal_makhani","Dal makhani","katori",18,6,9,10,30,"dal","🍲",["restaurant"]),
 ("moong_dal","Moong dal","katori",14,4,8,2,28,"dal","🍲",[]),
 ("masoor_dal","Masoor dal","katori",14,4,9,2,30,"dal","🍲",[]),
 ("chana_dal","Chana dal","katori",18,6,9,3,28,"dal","🍲",[]),
 ("urad_dal","Urad dal","katori",14,5,8,3,30,"dal","🍲",[]),
 ("dal_palak","Dal palak","katori",14,5,9,4,28,"dal","🥬",[]),
 ("rajma","Rajma curry","katori",22,8,9,5,29,"dal","🫘",[]),
 ("chole","Chole / chana masala","katori",25,9,10,8,33,"dal","🫘",[]),
 ("black_chana","Kala chana curry","katori",20,7,9,3,28,"dal","🫘",[]),
 ("sambar","Sambar","katori",12,3,4,3,40,"dal","🍲",[]),
 ("rasam","Rasam","katori",5,0.8,1.5,2,40,"dal","🍲",[]),
 ("kadhi","Kadhi","katori",10,1,4,6,40,"dal","🍲",[]),
 ("sprouts_salad","Sprouts salad","katori",12,5,8,1,30,"dal","🌱",[]),
 ("boiled_chana","Boiled chana","katori",22,6,9,2.5,28,"dal","🫘",[]),
 ("soya_chunks","Soya chunks curry","katori",8,5,16,1,15,"protein","🥘",[]),
)

# ---- Vegetable dishes (katori)
add(
 ("aloo_sabzi","Aloo sabzi","katori",18,3,3,6,70,"veg","🥔",[]),
 ("jeera_aloo","Jeera aloo","katori",20,2.5,3,7,70,"veg","🥔",[]),
 ("aloo_gobi","Aloo gobi","katori",14,3,3,7,45,"veg","🥦",[]),
 ("aloo_matar","Aloo matar","katori",18,4,4,6,55,"veg","🥔",[]),
 ("bhindi_sabzi","Bhindi sabzi","katori",8,3,2,5,20,"veg","🥬",[]),
 ("gobi_sabzi","Gobi sabzi","katori",8,3,3,5,20,"veg","🥦",[]),
 ("lauki_sabzi","Lauki sabzi","katori",6,2,1.5,3,15,"veg","🥬",[]),
 ("turai_sabzi","Turai / tori sabzi","katori",6,2,1.5,3,15,"veg","🥬",[]),
 ("karela_sabzi","Karela sabzi","katori",7,3.5,2,4,20,"veg","🥬",[]),
 ("baingan_bharta","Baingan bharta","katori",8,3,2,6,20,"veg","🍆",[]),
 ("mixed_veg","Mixed vegetable sabzi","katori",10,4,3,5,30,"veg","🥕",[]),
 ("poriyal","Vegetable poriyal (dry stir-fry)","katori",8,3,2,5,25,"veg","🥬",[]),
 ("kootu","Kootu (veg + dal)","katori",12,4,5,5,35,"veg","🥘",[]),
 ("avial","Avial","katori",12,3,3,10,40,"veg","🥥",[]),
 ("mushroom_masala","Mushroom masala","katori",7,2,4,7,25,"veg","🍄",[]),
 ("lauki_kofta","Lauki kofta curry","katori",12,2,4,10,40,"veg","🥘",[]),
 ("gatte_sabzi","Gatte ki sabzi","katori",18,3,7,9,45,"veg","🥘",[]),
 ("undhiyu","Undhiyu","katori",18,4,4,10,45,"veg","🥘",["festival"]),
 ("sarson_saag","Sarson ka saag","katori",8,4,4,8,25,"veg","🥬",[]),
 ("pav_bhaji","Pav bhaji (bhaji, 1 katori)","katori",25,4,5,12,65,"veg","🥘",["restaurant"]),
 ("boiled_potato","Boiled potato","piece",17,2,2,0.1,78,"veg","🥔",[]),
 ("boiled_sweet_potato","Boiled sweet potato","piece",25,3.5,2,0.2,50,"veg","🍠",[]),
 ("corn_on_cob","Corn on the cob (bhutta)","piece",25,3,3,1.5,52,"veg","🌽",[]),
 ("salad","Salad (cucumber, tomato, onion)","katori",5,1.5,1,0.2,15,"veg","🥗",[]),
 ("cucumber","Cucumber","piece",3,0.5,0.5,0.1,15,"veg","🥒",[]),
)

# ---- Paneer, egg, meat, fish
add(
 ("palak_paneer","Palak paneer","katori",7,3,9,14,15,"protein","🥬",["restaurant"]),
 ("paneer_butter_masala","Paneer butter masala","katori",10,2,12,22,30,"protein","🧈",["restaurant"]),
 ("matar_paneer","Matar paneer","katori",10,3,12,16,35,"protein","🥘",["restaurant"]),
 ("shahi_paneer","Shahi paneer","katori",10,1.5,11,20,30,"protein","🥘",["restaurant","festival"]),
 ("kadai_paneer","Kadai paneer","katori",8,2,12,17,30,"protein","🥘",["restaurant"]),
 ("paneer_bhurji","Paneer bhurji","katori",6,1,12,14,15,"protein","🧀",[]),
 ("paneer_tikka","Paneer tikka (4 pieces)","serving",4,0.5,12,10,20,"protein","🧀",["restaurant"]),
 ("paneer_cubes","Paneer (plain, 50 g)","serving",1,0,9,10,0,"protein","🧀",[]),
 ("tofu_bhurji","Tofu bhurji","katori",5,2,13,8,15,"protein","🥘",[]),
 ("egg","Boiled egg","piece",1,0,6,5,0,"protein","🥚",[]),
 ("omelette","Omelette (2 egg)","piece",2,0.2,12,14,0,"protein","🍳",[]),
 ("egg_bhurji","Egg bhurji","katori",3,0.5,12,12,15,"protein","🍳",[]),
 ("egg_curry","Egg curry (2 eggs)","katori",6,1.5,12,14,25,"protein","🥘",[]),
 ("chicken_curry","Chicken curry","katori",5,1,20,12,0,"protein","🍗",[]),
 ("butter_chicken","Butter chicken","katori",10,1,20,20,30,"protein","🍗",["restaurant"]),
 ("chicken_tikka","Chicken tikka (4 pieces)","serving",3,0.5,24,8,0,"protein","🍗",["restaurant"]),
 ("tandoori_chicken","Tandoori chicken (1 leg)","piece",2,0,26,10,0,"protein","🍗",["restaurant"]),
 ("mutton_curry","Mutton curry","katori",5,1,20,22,0,"protein","🍖",["festival"]),
 ("keema","Keema (mince) curry","katori",4,1,18,16,0,"protein","🍖",[]),
 ("fish_curry","Fish curry","katori",4,1,18,8,0,"protein","🐟",[]),
 ("fish_fry","Fish fry (1 piece)","piece",5,0.3,16,10,0,"protein","🐟",[]),
 ("prawn_curry","Prawn curry","katori",6,0.5,18,12,0,"protein","🦐",[]),
)

# ---- Dairy
add(
 ("curd","Curd / dahi","katori",6,0,4,4,36,"dairy","🥛",[]),
 ("raita","Raita","katori",7,0.5,3,3,36,"dairy","🥣",[]),
 ("dahi_vada","Dahi vada","piece",12,1,4,5,50,"snack","🥣",["festival"]),
)

# ---- Snacks and chaat
add(
 ("samosa","Samosa","piece",24,2,3,12,65,"snack","🥟",[]),
 ("kachori","Kachori","piece",25,2,4,12,65,"snack","🥟",[]),
 ("pakora","Pakora / bhajiya","piece",6,1,1.5,5,50,"snack","🧆",[]),
 ("vada_pav","Vada pav","piece",38,3,6,12,70,"snack","🍔",["restaurant"]),
 ("medu_vada","Medu vada","piece",10,1.5,3,6,55,"snack","🍩",[]),
 ("aloo_tikki","Aloo tikki","piece",20,2,3,8,65,"snack","🥔",["restaurant"]),
 ("pani_puri","Pani puri (1 puri)","piece",7,0.5,1,2.5,65,"snack","🫧",["restaurant"]),
 ("bhel_puri","Bhel puri","plate",40,3,6,8,65,"snack","🥗",["restaurant"]),
 ("papdi_chaat","Papdi chaat","plate",35,3,7,12,60,"snack","🥗",["restaurant"]),
 ("dhokla","Dhokla","piece",8,1,3,1.5,35,"snack","🟨",[]),
 ("khandvi","Khandvi","piece",5,0.5,2,2,40,"snack","🟨",[]),
 ("sabudana_vada","Sabudana vada","piece",20,1,2,8,70,"snack","🟤",["vrat"]),
 ("murukku","Murukku / chakli","piece",8,0.5,1.5,5,70,"snack","🌀",["festival"]),
 ("namkeen","Namkeen mixture (small katori)","katori",15,1,3,10,60,"snack","🥜",[]),
 ("roasted_chana","Roasted chana (handful)","handful",10,3,5,2,28,"nuts","🫘",[]),
 ("makhana","Roasted makhana (katori)","katori",12,2,3,1,45,"nuts","⚪",["vrat"]),
 ("peanuts","Peanuts (handful)","handful",4,2.5,7,14,15,"nuts","🥜",[]),
 ("almonds","Almonds (handful)","handful",3,3,6,14,15,"nuts","🌰",[]),
 ("mixed_nuts","Mixed nuts (handful)","handful",5,2,5,13,20,"nuts","🥜",[]),
 ("popcorn","Popcorn (katori)","katori",12,2,1.5,3,65,"snack","🍿",[]),
 ("marie_biscuit","Marie biscuit","piece",5.5,0.2,0.7,1,65,"snack","🍪",[]),
 ("digestive_biscuit","Digestive biscuit","piece",11,0.5,1,3,60,"snack","🍪",[]),
 ("chips_packet","Potato chips (small packet)","packet",15,1,2,10,55,"snack","🥔",[]),
)

# ---- Sweets
add(
 ("gulab_jamun","Gulab jamun","piece",30,0.5,2,9,76,"sweet","🍮",["festival"]),
 ("jalebi","Jalebi","piece",20,0,1,6,75,"sweet","🍥",["festival"]),
 ("rasgulla","Rasgulla","piece",25,0,3,1,70,"sweet","⚪",["festival"]),
 ("kheer","Kheer / payasam","katori",35,0.5,6,6,60,"sweet","🍚",["festival"]),
 ("suji_halwa","Suji halwa","katori",40,1,3,12,65,"sweet","🍮",["festival","vrat"]),
 ("gajar_halwa","Gajar halwa","katori",40,2,5,12,65,"sweet","🥕",["festival"]),
 ("besan_ladoo","Besan ladoo","piece",20,1,3,8,60,"sweet","🟡",["festival"]),
 ("motichoor_ladoo","Motichoor ladoo","piece",22,0.5,2,7,70,"sweet","🟠",["festival"]),
 ("kaju_katli","Kaju katli","piece",8,0.5,1.5,3,55,"sweet","💠",["festival"]),
 ("barfi","Milk barfi","piece",18,0.3,3,5,65,"sweet","🟦",["festival"]),
 ("peda","Peda","piece",14,0,2.5,3,65,"sweet","🟤",["festival"]),
 ("sandesh","Sandesh","piece",12,0,3,3,60,"sweet","⚪",["festival"]),
 ("chikki","Chikki (peanut)","piece",15,1,3,5,55,"sweet","🟫",["festival"]),
 ("ice_cream","Ice cream (1 scoop)","scoop",14,0.5,2,7,60,"sweet","🍨",[]),
 ("khajoor","Dates (1 piece)","piece",6,0.7,0.2,0,45,"sweet","🌴",["vrat"]),
)

# ---- Drinks
add(
 ("chai_sugar","Chai with sugar","cup",12,0,2,2.5,65,"drink","☕",[]),
 ("chai_nosugar","Chai without sugar","cup",5,0,2,2,30,"drink","☕",[]),
 ("coffee_sugar","Coffee with milk and sugar","cup",12,0,2,2,60,"drink","☕",[]),
 ("black_coffee","Black coffee (no sugar)","cup",0.5,0,0.3,0,0,"drink","☕",[]),
 ("milk","Milk","glass",10,0,6,6,30,"drink","🥛",[]),
 ("chaas","Chaas / buttermilk","glass",5,0,2,1,30,"drink","🥛",[]),
 ("lassi_sweet","Sweet lassi","glass",35,0,7,6,55,"drink","🥛",["restaurant"]),
 ("lassi_salted","Salted lassi","glass",8,0,6,4,35,"drink","🥛",[]),
 ("nimbu_pani_sugar","Nimbu pani with sugar","glass",18,0,0,0,65,"drink","🍋",[]),
 ("coconut_water","Coconut water","glass",9,0,0.5,0.3,55,"drink","🥥",[]),
 ("sugarcane_juice","Sugarcane juice","glass",40,0,0.3,0,70,"drink","🧃",[]),
 ("cola","Cola / soft drink","glass",26,0,0,0,63,"drink","🥤",[]),
 ("fruit_juice_packaged","Packaged fruit juice","glass",24,0.3,0.5,0.1,65,"drink","🧃",[]),
 ("sattu_drink","Sattu drink","glass",15,3,8,1,30,"drink","🥤",[]),
 ("badam_milk","Badam milk","glass",20,1,8,7,40,"drink","🥛",[]),
 ("haldi_milk","Haldi doodh (turmeric milk)","glass",11,0,6,6,30,"drink","🥛",[]),
 ("jaljeera","Jaljeera","glass",8,0.5,0.5,0,50,"drink","🥤",[]),
 ("thandai","Thandai","glass",30,1,5,8,55,"drink","🥛",["festival"]),
 ("aam_panna","Aam panna","glass",25,0.5,0.5,0,60,"drink","🥭",[]),
)

# ---- Fruit
add(
 ("banana","Banana","piece",23,2.6,1.3,0.3,55,"fruit","🍌",[]),
 ("apple","Apple","piece",20,2.4,0.5,0.3,36,"fruit","🍎",[]),
 ("mango","Mango slices","katori",25,2,1,0.5,51,"fruit","🥭",[]),
 ("papaya","Papaya (katori)","katori",11,2,0.7,0.2,55,"fruit","🍈",[]),
 ("guava","Guava","piece",14,5,2.5,1,30,"fruit","🍐",[]),
 ("orange","Orange / mosambi","piece",12,2.5,1,0.2,40,"fruit","🍊",[]),
 ("pomegranate","Pomegranate (katori)","katori",20,4,2,1,35,"fruit","🍎",[]),
 ("grapes","Grapes (katori)","katori",17,1,1,0.2,55,"fruit","🍇",[]),
 ("watermelon","Watermelon (katori)","katori",11,0.5,1,0.2,72,"fruit","🍉",[]),
 ("pear","Pear","piece",21,5,0.7,0.2,38,"fruit","🍐",[]),
 ("chikoo","Chikoo (sapota)","piece",20,5,0.5,1,55,"fruit","🟤",[]),
 ("jamun","Jamun (katori)","katori",14,1.5,1,0.3,25,"fruit","🫐",[]),
 ("muskmelon","Muskmelon (katori)","katori",8,0.8,1,0.2,65,"fruit","🍈",[]),
 ("pineapple","Pineapple (katori)","katori",13,1.5,0.5,0.1,60,"fruit","🍍",[]),
 ("fruit_chaat","Fruit chaat (katori)","katori",20,3,1,0.4,50,"fruit","🍓",["vrat"]),
)

# ---- Extras
add(
 ("papad","Papad (roasted)","piece",5,1,2.5,0.5,50,"extra","⭕",[]),
 ("pickle","Pickle (1 tsp)","tsp",0.5,0.2,0.1,2,0,"extra","🫙",[]),
 ("ghee","Ghee (1 tsp)","tsp",0,0,0,5,0,"extra","🧈",[]),
 ("butter","Butter (1 tsp)","tsp",0,0,0,4,0,"extra","🧈",[]),
 ("coconut_chutney","Coconut chutney (tbsp)","tbsp",1,0.5,0.5,3,30,"extra","🥥",[]),
)

# ---- Vrat / fasting
add(
 ("kuttu_puri","Kuttu puri","piece",14,1.5,2,6,55,"grain","🟡",["vrat"]),
 ("sama_rice","Sama (vrat) rice","katori",30,3,3,1.5,55,"grain","🍚",["vrat"]),
 ("aloo_vrat","Vrat aloo","katori",18,2.5,2,8,65,"veg","🥔",["vrat"]),
 ("rajgira_paratha","Rajgira paratha","piece",22,2.5,4,6,60,"grain","🫓",["vrat"]),
 ("makhana_kheer","Makhana kheer","katori",25,1,6,6,55,"sweet","🍚",["vrat"]),
)

# ---- Restaurant and street fast food
add(
 ("veg_momos","Veg momos (1 piece)","piece",6,0.5,1.5,1,60,"snack","🥟",["restaurant"]),
 ("noodles","Hakka noodles","katori",38,2,6,7,60,"grain","🍜",["restaurant"]),
 ("fried_rice","Veg fried rice","katori",40,2,6,8,65,"grain","🍚",["restaurant"]),
 ("pizza_slice","Pizza slice","piece",30,2,10,10,60,"snack","🍕",["restaurant"]),
 ("burger","Burger","piece",40,3,15,15,65,"snack","🍔",["restaurant"]),
 ("french_fries","French fries (katori)","katori",30,3,3,14,65,"snack","🍟",["restaurant"]),
 ("sandwich_veg","Veg sandwich","piece",30,3,7,8,60,"snack","🥪",["restaurant"]),
 ("maggi","Maggi noodles (1 packet)","packet",45,2,9,15,65,"snack","🍜",[]),
)

NONVEG = {"chicken_biryani","mutton_biryani","chicken_curry","butter_chicken","chicken_tikka","tandoori_chicken","mutton_curry","keema","fish_curry","fish_fry","prawn_curry"}
EGG = {"egg","omelette","egg_bhurji","egg_curry","egg_biryani"}
R = [(*r[:10], sorted(set(r[10]) | ({"nonveg"} if r[0] in NONVEG else set()) | ({"egg"} if r[0] in EGG else set()))) for r in R]
ids=[r[0] for r in R]
dups={i for i in ids if ids.count(i)>1}
assert not dups, dups
HI=json.load(open('tools/hi_names.json'))
missing=[r[0] for r in R if r[0] not in HI]
assert not missing, missing
extra=[k for k in HI if k not in set(r[0] for r in R)]
assert not extra, extra
foods=[dict(id=i,name=n,hi=HI[i],unit=u,carbs=c,fibre=fi,protein=p,fat=f,gi=g,category=cat,icon=ic,tags=t) for (i,n,u,c,fi,p,f,g,cat,ic,t) in R]
for f in foods:
    assert 0<=f['gi']<=100 and f['carbs']>=0 and f['fat']>=0 and f['protein']>=0 and f['fibre']>=0, f
    assert f['fibre']<=f['carbs']+8, f   # fibre can exceed available carbs slightly (e.g. legumes)
doc=dict(_note="STARTER TABLE, UNVERIFIED. Approximate values per household unit (carbs, fibre, protein, fat in grams; gi = glycemic index), drafted from typical Indian food composition and glycemic index data (ICMR-NIN, IFCT, published GI tables). Must be reviewed by a dietitian before real use.", foods=foods)
json.dump(doc,open('data/foods.json','w'),indent=1,ensure_ascii=False)
print(len(foods),"dishes")
