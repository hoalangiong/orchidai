import json

# Read vi.json to get structure
with open('src/i18n/locales/vi.json', 'r', encoding='utf-8') as f:
    vi_data = json.load(f)

# English translations
en_diseases = {
    "leafSpot": {
        "name": "Leaf Spot (Cercospora)",
        "symptoms": {
            "0": "Round brown spots with clear yellow margins",
            "1": "Dark center with concentric rings",
            "2": "Leaves yellow and drop when severe",
            "3": "Spots spread in wet weather"
        },
        "causes": {
            "0": "Cercospora or Phyllosticta fungi",
            "1": "Pseudomonas bacteria (water-soaked spots)",
            "2": "High humidity, water on leaves"
        },
        "treatment": {
            "0": "Remove severely infected leaves and destroy",
            "1": "Spray Daconil (Chlorothalonil) or Mancozeb",
            "2": "Isolate plant, increase ventilation",
            "3": "Repeat spray after 7–10 days"
        },
        "prevention": {
            "0": "Avoid water pooling on leaf surfaces",
            "1": "Increase spacing between plants",
            "2": "Preventive spray during rainy season"
        }
    },
    "blight": {
        "name": "Leaf Blight",
        "symptoms": {
            "0": "Large brown patches from leaf edges inward",
            "1": "Water-soaked yellow margins",
            "2": "Large areas of leaves die and dry",
            "3": "Disease spreads rapidly in continuous rain"
        },
        "causes": {
            "0": "Botrytis or Alternaria fungi",
            "1": "Heavy rain, humidity > 85%",
            "2": "Low light, poor air circulation"
        },
        "treatment": {
            "0": "Remove infected leaves, destroy away from garden",
            "1": "Spray Iprodione (Rovral) or Thiram",
            "2": "Increase ventilation, reduce humidity",
            "3": "Spray 2–3 times, 5–7 days apart"
        },
        "prevention": {
            "0": "Ensure good ventilation especially in rainy season",
            "1": "Don't water in late afternoon/evening",
            "2": "Preventive Mancozeb spray before rainy season"
        }
    },
    "rust": {
        "name": "Leaf Rust",
        "symptoms": {
            "0": "Small orange-brown spots scattered on leaves",
            "1": "Raised spore pustules on leaf undersides",
            "2": "Spores break open into orange powder",
            "3": "Leaves yellow, plant energy declines"
        },
        "causes": {
            "0": "Pucciniales (Phragmidium) fungi",
            "1": "High humidity, morning fog",
            "2": "Poor ventilation, temperature 15–25°C"
        },
        "treatment": {
            "0": "Spray Propiconazole (Tilt) or Triadimefon",
            "1": "Collect and destroy fallen infected leaves",
            "2": "Spray sulfur suspension",
            "3": "Treat 3 times, 7 days apart"
        },
        "prevention": {
            "0": "Avoid watering in evening",
            "1": "Increase orchid garden ventilation",
            "2": "Check leaf undersides regularly"
        }
    },
    "yellowing": {
        "name": "Chlorosis / Nutrient Deficiency",
        "symptoms": {
            "0": "Leaves turn yellow uniformly or in patches",
            "1": "Leaf veins stay green while blade yellows",
            "2": "Leaves smaller, thinner than normal",
            "3": "Plant slow to produce new growth"
        },
        "causes": {
            "0": "Iron (Fe), Magnesium (Mg) or Nitrogen deficiency",
            "1": "Medium pH too high, locking nutrients",
            "2": "Overwatering or root damage",
            "3": "Prolonged insufficient light"
        },
        "treatment": {
            "0": "Supplement with micronutrients (chelate Fe, Mg)",
            "1": "Check and adjust water pH (5.5–6.5)",
            "2": "Replace medium, trim damaged roots",
            "3": "Increase appropriate lighting"
        },
        "prevention": {
            "0": "Balanced fertilizer every 10–14 days",
            "1": "Use water pH 5.5–6.5",
            "2": "Replace medium every 1–2 years",
            "3": "Ensure 50–70% diffused light"
        }
    },
    "virus": {
        "name": "Orchid Mosaic Virus (CyMV)",
        "symptoms": {
            "0": "Mosaic pattern of light and dark green streaks",
            "1": "Scattered necrotic brown-black spots",
            "2": "Leaves deformed, wrinkled, twisted",
            "3": "Flowers small, pale, deformed"
        },
        "causes": {
            "0": "CyMV (Cymbidium Mosaic Virus)",
            "1": "Spread via cutting tools, unwashed hands",
            "2": "Sucking insects (aphids, mites) carry virus",
            "3": "Purchasing infected plants"
        },
        "treatment": {
            "0": "NO cure — must destroy infected plant",
            "1": "Sterilize tools with 70% alcohol after each plant",
            "2": "Isolate immediately, keep away from healthy plants"
        },
        "prevention": {
            "0": "Buy plants from reliable sources, inspect carefully",
            "1": "Always sterilize cutting tools before use",
            "2": "Control sucking insects in garden",
            "3": "Quarantine new plants minimum 3–4 weeks"
        }
    },
    "fusarium": {
        "name": "Fusarium Wilt",
        "symptoms": {
            "0": "Characteristic pink-purple rot on stem, base",
            "1": "Pink fungal threads in infected area",
            "2": "Plant wilts from base up despite adequate water",
            "3": "Cross-section shows brown vascular tissue"
        },
        "causes": {
            "0": "Fusarium oxysporum fungus",
            "1": "Old medium with accumulated infection",
            "2": "Low pH, continuously high humidity",
            "3": "Root wounds during repotting"
        },
        "treatment": {
            "0": "Cut away infection to clean white tissue",
            "1": "Dip in Captan or Thiophanate-methyl",
            "2": "Replace all medium, sterilize pot",
            "3": "Strict isolation"
        },
        "prevention": {
            "0": "Sterilize pots and medium before use",
            "1": "Don't reuse old medium",
            "2": "Water in morning, avoid continuous moisture",
            "3": "Add lime to adjust medium pH"
        }
    },
    "anthracnose": {
        "name": "Anthracnose",
        "symptoms": {
            "0": "Round black spots with clear concentric rings",
            "1": "Small orange dots (spores) in spot centers",
            "2": "Dead leaf tissue dries, easily punctured",
            "3": "Disease common on older leaves"
        },
        "causes": {
            "0": "Colletotrichum gloeosporioides fungus",
            "1": "Temperature 25–30°C, heavy rain",
            "2": "Water splashing from soil onto leaves"
        },
        "treatment": {
            "0": "Remove infected leaves and destroy",
            "1": "Spray Azoxystrobin (Amistar) or Carbendazim",
            "2": "Spray Copper hydroxide (COC 85) preventively",
            "3": "Repeat 2–3 times, 7 days apart"
        },
        "prevention": {
            "0": "Water at base, avoid splashing on leaves",
            "1": "Clean old leaves and old medium",
            "2": "Preventive spray at start of rainy season"
        }
    },
    "bacterialRot": {
        "name": "Bacterial Soft Rot",
        "symptoms": {
            "0": "Light brown soft rot like cooked tissue",
            "1": "Water-soaked halo around margins",
            "2": "Foul odor when pressing infected area",
            "3": "Spreads very rapidly in 24–48 hours"
        },
        "causes": {
            "0": "Erwinia carotovora or Pseudomonas bacteria",
            "1": "Wounds from pruning, insect damage",
            "2": "High temperature + high humidity + poor ventilation",
            "3": "Water pooling in leaf crown"
        },
        "treatment": {
            "0": "Immediately cut away rot to healthy tissue",
            "1": "Apply Copper sulfate or antibacterial agent",
            "2": "Let cut dry completely for 1–2 days",
            "3": "Don't water plant for at least 3 days after treatment"
        },
        "prevention": {
            "0": "Sterilize cutting tools before each use",
            "1": "Don't let water pool in leaf crown",
            "2": "Increase ventilation strongly in hot humid weather",
            "3": "Balanced fertilizer, avoid excess nitrogen"
        }
    }
}

en_pests = {
    "spiderMites": {
        "name": "Spider Mites",
        "description": "Tiny red/yellow mites that suck sap from leaf undersides. Active in hot dry conditions.",
        "symptoms": {
            "0": "Dense tiny yellow stippling on leaves",
            "1": "Fine webbing on leaf undersides when severe",
            "2": "Leaves turn silvery then dry, curl and drop",
            "3": "Plant stunted, slow growth"
        },
        "treatment": {
            "0": "Spray strong water to wash leaf undersides",
            "1": "Use Abamectin (Vertimec) or Dicofol",
            "2": "Spray neem oil 2–3ml/L",
            "3": "Repeat after 5–7 days as mite eggs resist treatment"
        },
        "prevention": {
            "0": "Maintain 60–70% humidity around garden",
            "1": "Mist leaf undersides regularly",
            "2": "Check leaves periodically with magnifier"
        }
    },
    "flowerFly": {
        "name": "Flower Fly / Blossom Midge",
        "description": "Small flies lay eggs in flower buds, larvae feed inside. Common on Dendrobium in dry season.",
        "symptoms": {
            "0": "Buds yellow, drop early before opening",
            "1": "Petals deformed, distorted when opening",
            "2": "Small white larvae inside buds",
            "3": "Many flower spikes but few open"
        },
        "causes": {
            "0": "Flower flies (Contarinia, Bactrocera)",
            "1": "Hot humid weather favors reproduction",
            "2": "Orchid garden near fruit trees"
        },
        "treatment": {
            "0": "Remove and destroy all infected buds",
            "1": "Spray Cypermethrin or Deltamethrin",
            "2": "Cover entire flower spike with fine mesh",
            "3": "Spray twice, 5 days apart when buds form"
        },
        "prevention": {
            "0": "Cover flower spikes as soon as buds emerge",
            "1": "Preventive spray before flowering season",
            "2": "Place yellow sticky traps around garden",
            "3": "Check flower buds daily"
        }
    },
    "thrips": {
        "name": "Thrips (Frankliniella)",
        "description": "Slender insects ~1mm, yellow-brown. Suck leaves and flowers, leaving characteristic silvery scars.",
        "symptoms": {
            "0": "Silvery scars along leaf veins",
            "1": "Flowers with silver/brown spots, deformed, drop early",
            "2": "Young leaves curl, shoots deformed",
            "3": "See tiny yellow insects when checking leaf undersides"
        },
        "causes": {
            "0": "Frankliniella occidentalis or Thrips palmi",
            "1": "Hot dry weather (dry season) causes outbreaks",
            "2": "Spread from new plants or weeds"
        },
        "treatment": {
            "0": "Spray Spinosad (Entrust) or Abamectin",
            "1": "Place blue sticky traps in garden",
            "2": "Remove severely damaged flowers and shoots",
            "3": "Repeat after 5–7 days, alternate products to avoid resistance"
        },
        "prevention": {
            "0": "Hang blue sticky traps permanently",
            "1": "Check leaf undersides and inside flowers daily",
            "2": "Maintain high humidity to limit thrips development",
            "3": "Quarantine new plants at least 2 weeks"
        }
    },
    "mealybugs": {
        "name": "Mealybugs",
        "description": "White cottony insects due to waxy coating, cluster in leaf axils and stems.",
        "symptoms": {
            "0": "White cottony masses in leaf axils, stems, roots",
            "1": "Sticky leaves (honeydew secreted by mealybugs)",
            "2": "Leaves yellow and wilt gradually",
            "3": "Black sooty mold grows on honeydew"
        },
        "treatment": {
            "0": "Wipe each cluster with cotton soaked in 70% alcohol",
            "1": "Spray Imidacloprid (Confidor) or Dinotefuran",
            "2": "Spray neem oil 3ml/L thoroughly",
            "3": "Treat 3–4 times, 1 week apart"
        },
        "prevention": {
            "0": "Inspect new plants carefully before adding to garden",
            "1": "Clean leaves and stems regularly",
            "2": "Don't over-fertilize with nitrogen, makes plants succulent"
        }
    },
    "scale": {
        "name": "Scale Insects",
        "description": "Hard brown scales attached firmly to leaves and stems, continuously sucking sap.",
        "symptoms": {
            "0": "Round hard brown bumps scattered on leaves, stems",
            "1": "Leaves yellow, plant weakens gradually",
            "2": "Sticky substance on leaf surfaces",
            "3": "Plant grows slowly, leaves shrink"
        },
        "treatment": {
            "0": "Scrub with soft brush soaked in horticultural oil",
            "1": "Spray Chlorpyrifos or horticultural oil 99",
            "2": "Use systemic Imidacloprid",
            "3": "Repeat after 2 weeks when eggs hatch"
        },
        "prevention": {
            "0": "Quarantine new plants 2–3 weeks before adding to garden",
            "1": "Check leaf undersides regularly",
            "2": "Wipe leaves clean with damp cloth monthly"
        }
    },
    "snails": {
        "name": "Snails & Slugs",
        "description": "Active at night and after rain. Eat young leaves, roots, and Dendrobium shoots.",
        "symptoms": {
            "0": "Irregular holes in leaves",
            "1": "Young shoots and roots eaten away",
            "2": "Silvery slime trails on plants and soil",
            "3": "Small snail droppings near plant base"
        },
        "treatment": {
            "0": "Hand-pick at night or after rain",
            "1": "Scatter snail bait (Metaldehyde) around pots",
            "2": "Scatter lime powder or rice hull ash around base",
            "3": "Set beer traps near pots"
        },
        "prevention": {
            "0": "Keep growing area clean, no decaying leaves",
            "1": "Avoid evening watering that moistens ground",
            "2": "Check under benches and garden floor at night"
        }
    }
}

# Combine
en_diseases_full = {
    **en_diseases["diseases"],
    **en_diseases
}

print(json.dumps(en_diseases, indent=2, ensure_ascii=False))
print("\n\n=== PESTS ===\n\n")
print(json.dumps(en_pests, indent=2, ensure_ascii=False))
