# Generates data/ingredients.json: DRAFT per-100 g values (RAW weight), NOT verified by a dietitian.
# Columns: id, name, carbs, fibre, protein, fat, gi, icon, units (grams per unit, optional)
import json
R = []
def add(*rows): R.extend(rows)

add(
 ("atta","Wheat flour (atta)",71,11,11,1.5,62,"🌾",{"cup":120,"tbsp":8}),
 ("maida","Maida (refined flour)",74,3,10,1,70,"🌾",{"cup":125,"tbsp":8}),
 ("besan","Besan (gram flour)",58,11,22,6,35,"🌾",{"cup":100,"tbsp":6}),
 ("suji","Suji / rava",73,3,10,1,66,"🌾",{"cup":160,"tbsp":10}),
 ("ragi_flour","Ragi flour",72,11,7,1.5,55,"🌾",{"cup":120,"tbsp":8}),
 ("bajra_flour","Bajra flour",67,11,11,5,55,"🌾",{"cup":120,"tbsp":8}),
 ("jowar_flour","Jowar flour",73,10,10,2,62,"🌾",{"cup":120,"tbsp":8}),
 ("oats","Rolled oats",66,10,13,7,55,"🌾",{"cup":90,"tbsp":6}),
 ("rice_raw","White rice (raw)",78,1,7,0.5,73,"🍚",{"cup":190,"tbsp":12}),
 ("brown_rice_raw","Brown rice (raw)",77,3.5,8,2.5,50,"🍚",{"cup":190,"tbsp":12}),
 ("poha_raw","Poha (flattened rice, raw)",77,2,7,1,60,"🍚",{"cup":70,"tbsp":5}),
 ("sabudana_raw","Sabudana (raw)",88,0.5,0.2,0.2,70,"⚪",{"cup":150,"tbsp":10}),
 ("vermicelli_raw","Vermicelli (raw)",75,3,9,1,65,"🍜",{"cup":100}),
 ("toor_dal_raw","Toor dal (raw)",63,15,22,1.7,30,"🫘",{"cup":200,"tbsp":13}),
 ("moong_dal_raw","Moong dal (raw)",60,16,24,1.3,28,"🫘",{"cup":200,"tbsp":13}),
 ("masoor_dal_raw","Masoor dal (raw)",59,11,25,1,30,"🫘",{"cup":200,"tbsp":13}),
 ("chana_dal_raw","Chana dal (raw)",60,12,21,5,28,"🫘",{"cup":200,"tbsp":13}),
 ("urad_dal_raw","Urad dal (raw)",59,18,24,1.5,30,"🫘",{"cup":200,"tbsp":13}),
 ("rajma_raw","Rajma (raw)",60,16,22,1.5,29,"🫘",{"cup":190,"tbsp":12}),
 ("chole_raw","Kabuli chana (raw)",61,12,19,6,33,"🫘",{"cup":190,"tbsp":12}),
 ("kala_chana_raw","Kala chana (raw)",61,17,20,5,28,"🫘",{"cup":190,"tbsp":12}),
 ("soya_chunks_raw","Soya chunks (dry)",33,13,52,0.5,15,"🫘",{"cup":60}),
 ("potato","Potato",17,2,2,0.1,78,"🥔",{"piece":100}),
 ("sweet_potato","Sweet potato",20,3,1.6,0.1,50,"🍠",{"piece":130}),
 ("onion","Onion",11,2,1.2,0.1,10,"🧅",{"piece":100,"cup":160}),
 ("tomato","Tomato",4,1,0.9,0.2,15,"🍅",{"piece":80,"cup":180}),
 ("spinach","Spinach (palak)",3,2,2.9,0.4,15,"🥬",{"cup":30}),
 ("cauliflower","Cauliflower (gobi)",5,2,2.5,0.3,15,"🥦",{"cup":100}),
 ("cabbage","Cabbage",6,2,1.3,0.1,10,"🥬",{"cup":90}),
 ("brinjal","Brinjal (baingan)",5,3,1.4,0.2,15,"🍆",{"piece":150,"cup":100}),
 ("bhindi","Okra (bhindi)",7,3,1.9,0.2,20,"🥬",{"cup":100}),
 ("lauki","Bottle gourd (lauki)",3,1,0.5,0.1,15,"🥬",{"cup":120}),
 ("carrot","Carrot",10,3,0.9,0.2,35,"🥕",{"piece":70,"cup":120}),
 ("peas","Green peas (matar)",14,5,5.4,0.4,35,"🟢",{"cup":145}),
 ("capsicum","Capsicum",5,2,1,0.3,15,"🫑",{"piece":120,"cup":120}),
 ("mushroom","Mushrooms",3,1,3,0.3,25,"🍄",{"cup":70}),
 ("beans","French beans",7,3,2,0.1,20,"🥬",{"cup":100}),
 ("karela","Bitter gourd (karela)",4,3,1.6,0.2,20,"🥬",{"piece":100}),
 ("cucumber_raw","Cucumber",3,0.5,0.7,0.1,15,"🥒",{"piece":200,"cup":120}),
 ("pumpkin","Pumpkin",5,1,1,0.1,65,"🎃",{"cup":116}),
 ("garlic","Garlic",33,2,6,0.5,30,"🧄",{"piece":4,"tbsp":9}),
 ("ginger","Ginger",18,2,2,0.8,15,"🫚",{"tsp":5,"tbsp":15}),
 ("green_chilli","Green chilli",3,1.5,1,0.1,10,"🌶️",{"piece":5}),
 ("coriander_leaves","Coriander leaves",2,1,2,0.5,10,"🌿",{"cup":16,"tbsp":3}),
 ("paneer_raw","Paneer",1,0,18,21,0,"🧀",{"cup":150,"piece":25}),
 ("tofu_raw","Tofu",2,1,8,5,15,"⬜",{"cup":250}),
 ("curd_raw","Curd / dahi",4,0,3,4,36,"🥛",{"cup":240,"tbsp":15}),
 ("milk_raw","Milk",5,0,3,4,30,"🥛",{"cup":240,"tbsp":15}),
 ("cream","Cream (malai)",3,0,2,25,0,"🥛",{"tbsp":15}),
 ("egg_raw","Egg",1,0,13,10,0,"🥚",{"piece":50}),
 ("chicken_raw","Chicken (boneless)",0,0,22,3,0,"🍗",{"cup":140,"piece":150}),
 ("mutton_raw","Mutton",0,0,20,10,0,"🍖",{"cup":140}),
 ("fish_raw","Fish",0,0,19,3,0,"🐟",{"piece":120}),
 ("oil","Cooking oil",0,0,0,100,0,"🫒",{"tsp":4.5,"tbsp":14}),
 ("ghee_raw","Ghee",0,0,0,100,0,"🧈",{"tsp":4.5,"tbsp":14}),
 ("butter_raw","Butter",0,0,1,81,0,"🧈",{"tsp":4.7,"tbsp":14}),
 ("sugar","Sugar",100,0,0,0,65,"🍬",{"tsp":4.2,"tbsp":12.5}),
 ("jaggery","Jaggery (gur)",95,0,0.4,0.1,70,"🟤",{"tsp":6,"tbsp":18}),
 ("coconut_grated","Coconut (grated)",15,9,3,34,45,"🥥",{"tbsp":6,"cup":80}),
 ("coconut_milk","Coconut milk",6,0,2,24,40,"🥥",{"cup":240,"tbsp":15}),
 ("peanuts_raw","Peanuts",17,9,26,45,15,"🥜",{"tbsp":10,"cup":145}),
 ("cashews_raw","Cashews",30,3,18,44,25,"🌰",{"piece":2,"tbsp":9}),
 ("almonds_raw","Almonds",20,12,21,50,15,"🌰",{"piece":1.2,"tbsp":9}),
 ("sesame","Sesame seeds (til)",23,12,18,50,35,"⚪",{"tsp":3,"tbsp":9}),
 ("tamarind","Tamarind",62,5,3,0.6,60,"🟤",{"tsp":5,"tbsp":15}),
 ("lemon_juice","Lemon juice",7,0,0.4,0.2,20,"🍋",{"tsp":5,"tbsp":15}),
 ("spice_mix","Dry spices (haldi, mirch, masala)",50,20,12,10,30,"🌶️",{"tsp":2.5,"tbsp":7}),
)

ids=[r[0] for r in R]
assert len(ids)==len(set(ids)), [i for i in ids if ids.count(i)>1]
ing=[dict(id=i,name=n,carbs=c,fibre=fi,protein=p,fat=f,gi=g,icon=ic,units=u) for (i,n,c,fi,p,f,g,ic,u) in R]
for x in ing:
    assert 0<=x['gi']<=100 and x['carbs']>=0 and x['carbs']+x['protein']+x['fat']<=210, x   # per 100 g; fibre sits inside carbs
doc=dict(_note="STARTER TABLE, UNVERIFIED. Approximate values per 100 g of the RAW ingredient (carbs, fibre, protein, fat in grams; gi = glycemic index), drafted from typical Indian food composition data (IFCT, ICMR-NIN). Must be reviewed by a dietitian before real use.", ingredients=ing)
json.dump(doc,open('data/ingredients.json','w'),indent=1,ensure_ascii=False)
print(len(ing),"ingredients")
