import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod_bc_1",
    "sku": "CRK-SS-TNS1",
    "name": "Tennis-Ball Cricket Bat",
    "category": "bats",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "SS TON",
    "price": 1599,
    "costPrice": 980,
    "gstPercent": 12,
    "stockQty": 24,
    "reorderLevel": 5,
    "featured": true,
    "skillLevel": "Beginner",
    "material": "Selected Lightweight Kashmir Willow",
    "intendedUse": "Box cricket turfs and tennis ball matches",
    "image": "/images/proshop/box-cricket/tennis-ball-cricket-bat.svg",
    "shortDescription": "Specially scooped lightweight cricket bat engineered for box cricket tennis-ball strokeplay.",
    "description": "Precision handcrafted with deep aerodynamic scoop profile and massive 40mm contoured edges. Weighs under 1040g for lighting-fast bat speed and explosive six-hitting in enclosed box cricket turfs with heavy and light tennis balls.",
    "specifications": {
      "Willow Grade": "Grade 1 Selected Kashmir Willow",
      "Weight Range": "990g - 1040g (Ultra Light Pickup)",
      "Edge Thickness": "40 mm Contoured Power Edges",
      "Handle Type": "Short Handle with 3-piece Singapore Cane",
      "Ball Compatibility": "Heavy Tennis, Light Tennis, Soft Synthetic",
      "Playing Style": "T20 / 6-a-side Box Cricket Power Hitter"
    },
    "warranty": "6 Months Handle Warranty",
    "variants": [
      {
        "id": "v_bc1_1",
        "size": "Full Size (Senior Short Handle)",
        "weight": "1020g",
        "stockQty": 18
      },
      {
        "id": "v_bc1_2",
        "size": "Size 6 (Junior)",
        "weight": "920g",
        "stockQty": 6
      }
    ]
  },
  {
    "id": "prod_bc_2",
    "sku": "CRK-SG-LTH2",
    "name": "Leather-Ball Cricket Bat",
    "category": "bats",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "SG",
    "price": 6499,
    "costPrice": 4200,
    "gstPercent": 12,
    "stockQty": 12,
    "reorderLevel": 3,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Air-Dried Grade 2 English Willow",
    "intendedUse": "Club practice nets and leather match cricket",
    "image": "/images/proshop/box-cricket/leather-ball-cricket-bat.svg",
    "shortDescription": "Traditional English willow bat with pronounced spine and mid-to-low sweet spot for leather ball cricket.",
    "description": "Mastercrafted traditional cricket bat designed for leather ball impact. Features 6-8 straight grains, rounded face, pronounced bow, and reinforced Sarawak cane handle fitted with specialized chevron grip.",
    "specifications": {
      "Willow Type": "Grade 2 Seasoned English Willow",
      "Weight Range": "1160g - 1200g (Balanced Pickup)",
      "Blade Profile": "Traditional Full Spine with 38mm Edges",
      "Handle": "Round 12-piece Cane Handle with Rubber Dampener",
      "Ball Compatibility": "Red/White 4-Piece Leather Balls",
      "Skill Level": "Intermediate to Advanced Club Batsman"
    },
    "warranty": "1 Year Blade Crack Warranty",
    "variants": [
      {
        "id": "v_bc2_1",
        "size": "Short Handle (1180g)",
        "weight": "1180g",
        "stockQty": 8
      },
      {
        "id": "v_bc2_2",
        "size": "Short Handle (1210g)",
        "weight": "1210g",
        "stockQty": 4
      }
    ]
  },
  {
    "id": "prod_bc_3",
    "sku": "BAL-NIV-HVY3",
    "name": "Heavy Tennis Cricket Ball",
    "category": "balls",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "Nivia",
    "price": 540,
    "costPrice": 320,
    "gstPercent": 12,
    "stockQty": 120,
    "reorderLevel": 25,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "High-Density Molded Natural Rubber Core with Needle Felt",
    "intendedUse": "Competitive box cricket tournaments and turf leagues",
    "image": "/images/proshop/box-cricket/heavy-tennis-cricket-ball.svg",
    "shortDescription": "Pack of 6 tournament-grade heavy tennis balls (125g) engineered for fast turf box cricket.",
    "description": "Official tournament weight heavy tennis cricket balls. Features dense vulcanized rubber core for realistic seam bounce and durable woven felt cloth that resists tear on artificial grass turf wickets.",
    "specifications": {
      "Quantity": "Pack of 6 Balls",
      "Weight": "125g ± 3g per ball (Heavy Spec)",
      "Diameter": "66 mm",
      "Core": "High-rebound solid vulcanized rubber",
      "Surface": "Premium abrasion-resistant woven yellow felt",
      "Bounce Rating": "Consistent 48-52 inches from 100 inches drop"
    }
  },
  {
    "id": "prod_bc_4",
    "sku": "BAL-DSC-SFT4",
    "name": "Soft Tennis Cricket Ball",
    "category": "balls",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "DSC",
    "price": 420,
    "costPrice": 240,
    "gstPercent": 12,
    "stockQty": 85,
    "reorderLevel": 20,
    "featured": false,
    "skillLevel": "Beginner",
    "material": "Low-Compression Soft Rubber Core with Soft Wool Felt",
    "intendedUse": "Beginner practice, junior drills and coaching warmups",
    "image": "/images/proshop/box-cricket/soft-tennis-cricket-ball.svg",
    "shortDescription": "Pack of 6 soft-core tennis cricket balls (75g) providing safe, comfortable beginner coaching.",
    "description": "Specially softened tennis cricket balls designed to prevent injury and finger bruising during coaching sessions. Excellent for indoor sports halls, beginners learning batting mechanics, and casual weekend box play.",
    "specifications": {
      "Quantity": "Pack of 6 Balls",
      "Weight": "75g - 80g per ball (Soft Spec)",
      "Diameter": "65 mm",
      "Core": "Low-impact hollow soft rubber",
      "Safety": "Ideal for play without pads or helmet",
      "Recommended For": "Under-14 training & indoor box cricket"
    }
  },
  {
    "id": "prod_bc_5",
    "sku": "BAL-SG-LTH5",
    "name": "Leather Cricket Ball",
    "category": "balls",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "SG",
    "price": 899,
    "costPrice": 560,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Top-Grade Alum-Tanned Cowhide Leather",
    "intendedUse": "Club practice matches and tournament net bowling",
    "image": "/images/proshop/box-cricket/leather-cricket-ball.svg",
    "shortDescription": "Four-piece red stitched leather ball with pronounced hand-sewn seam and cork core.",
    "description": "Regulation four-piece leather cricket ball constructed around layered Portuguese cork and worsted yarn winding. Treated with waterproof gloss wax for shape retention and swing under floodlights.",
    "specifications": {
      "Construction": "4-Piece Quarters with 78-82 Stitches",
      "Weight": "156g Regulation Match Standard",
      "Color": "Classic Test Red with Gold Stamping",
      "Core": "Compressed Portuguese Cork & Yarn Center",
      "Suitability": "Net practice and 50-over club cricket"
    }
  },
  {
    "id": "prod_bc_6",
    "sku": "EQP-DSC-STP6",
    "name": "Plastic Cricket Stumps Set",
    "category": "equipment",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "DSC",
    "price": 899,
    "costPrice": 520,
    "gstPercent": 18,
    "stockQty": 30,
    "reorderLevel": 6,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Impact Molded Virgin PVC Polycarbonate",
    "intendedUse": "Box cricket turfs, indoor arenas and all-weather pitches",
    "image": "/images/proshop/box-cricket/plastic-cricket-stumps-set.svg",
    "shortDescription": "3 heavy-duty PVC stumps with weighted cast base and 2 detachable bails.",
    "description": "Weatherproof plastic cricket stump set engineered for artificial turf and concrete surfaces where wooden spikes cannot be driven. Features sturdy weighted rubber base to maintain stability in breezy conditions.",
    "specifications": {
      "Height": "28 Inches (Official Cricket Height)",
      "Base Type": "Detachable Heavyweight Rubberized Molded Base",
      "Bails Included": "2 Matching Molded Polycarbonate Bails",
      "Color": "High-Visibility Neon Fluorescent Yellow",
      "Weather Resistance": "100% Waterproof and UV Protected"
    }
  },
  {
    "id": "prod_bc_7",
    "sku": "EQP-SS-SPR7",
    "name": "Spring-Loaded Cricket Stumps",
    "category": "equipment",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "SS TON",
    "price": 2499,
    "costPrice": 1550,
    "gstPercent": 18,
    "stockQty": 18,
    "reorderLevel": 4,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Solid Ashwood Stumps mounted on High-Tensile Dual Springs and Cast Iron Base",
    "intendedUse": "Fast-paced bowling net practice and turf wicket matches",
    "image": "/images/proshop/box-cricket/spring-loaded-cricket-stumps.svg",
    "shortDescription": "Heavy cast-iron base spring stumps that automatically snap back vertical upon ball strike.",
    "description": "Heavyweight spring-loaded training stump set. Equipped with industrial dual-rebound return springs mounted to a solid cast iron anchor block. Eliminates the hassle of resetting stumps between bowling deliveries.",
    "specifications": {
      "Base Weight": "4.5 kg Solid Cast Iron Stability Block",
      "Stumps Material": "Turned Solid Hardwood with Lacquer Finish",
      "Mechanism": "Twin Heavy-Duty Recoil Springs",
      "Height": "28 Inches Match Standard",
      "Suitability": "Fast bowling machines and high-velocity strikes"
    }
  },
  {
    "id": "prod_bc_8",
    "sku": "PRT-SG-GLV8",
    "name": "Cricket Batting Gloves",
    "category": "protective",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "SG",
    "price": 1399,
    "costPrice": 840,
    "gstPercent": 12,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "Intermediate",
    "material": "Supple Sheep Leather Palm with High-Density EVA Foam Rolls",
    "intendedUse": "Finger and knuckle protection against hard tennis and leather balls",
    "image": "/images/proshop/box-cricket/cricket-batting-gloves.svg",
    "shortDescription": "Padded cricket batting gloves with split-finger ergonomics and breathable mesh gussets.",
    "description": "Ergonomic batting gloves featuring sausage-style finger rolls with thermoplastic inserts on the leading bottom two fingers. Premium sheep leather palm provides superior bat handle grip in hot playing conditions.",
    "specifications": {
      "Palm": "Select Calf/Sheep Leather with Reinforcement Patch",
      "Finger Protection": "Pre-curved Multi-flex High Density EVA Foam",
      "Thumb": "Two-piece Ergonomic Articulated Thumb Block",
      "Ventilation": "Airflow Mesh Gussets on Inner Fingers",
      "Wrist Band": "50mm Wide Elasticated Band with Dual Velcro Closure"
    },
    "variants": [
      {
        "id": "v_bc8_m",
        "size": "Men Regular (Right Hand)",
        "stockQty": 22
      },
      {
        "id": "v_bc8_l",
        "size": "Men Large (Right Hand)",
        "stockQty": 12
      },
      {
        "id": "v_bc8_lh",
        "size": "Men Regular (Left Hand)",
        "stockQty": 6
      }
    ]
  },
  {
    "id": "prod_bc_9",
    "sku": "PRT-SS-PAD9",
    "name": "Cricket Batting Pads",
    "category": "protective",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "SS TON",
    "price": 2199,
    "costPrice": 1350,
    "gstPercent": 12,
    "stockQty": 25,
    "reorderLevel": 6,
    "featured": false,
    "skillLevel": "Intermediate",
    "material": "Polyurethane Facing with Traditional Cane Reinforcement Bolsters",
    "intendedUse": "Shin, knee, and calf impact shielding",
    "image": "/images/proshop/box-cricket/cricket-batting-pads.svg",
    "shortDescription": "Lightweight batting legguards with 7-bar cane construction and 3-piece contoured knee roll.",
    "description": "Club batting pads combining vertical cane rods with high-density sponge padding for reliable impact dispersion. Features a deep knee pocket with side wings for wrap-around protection during aggressive shots.",
    "specifications": {
      "Facing": "Durable Matte Polyurethane Skin",
      "Internal Shield": "7 Vertical Wooden Cane Ribs + Low Density Foam",
      "Knee Cup": "Three-Piece Padded Knee Bolster with Fiber Insert",
      "Straps": "Three 2-inch Padded Quick-Release Velcro Straps",
      "Instep": "Padded Mesh Instep for Shoe Comfort"
    },
    "variants": [
      {
        "id": "v_bc9_m",
        "size": "Men (Full Size)",
        "stockQty": 18
      },
      {
        "id": "v_bc9_y",
        "size": "Youth / Small",
        "stockQty": 7
      }
    ]
  },
  {
    "id": "prod_bc_10",
    "sku": "PRT-SHR-HLM10",
    "name": "Cricket Helmet with Face Grill",
    "category": "protective",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "Shrey",
    "price": 2799,
    "costPrice": 1750,
    "gstPercent": 18,
    "stockQty": 20,
    "reorderLevel": 5,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Injection Molded ABS Shell with Powder-Coated Mild Steel Visor",
    "intendedUse": "Bouncer protection in batting nets and box matches",
    "image": "/images/proshop/box-cricket/cricket-helmet-with-face-grill.svg",
    "shortDescription": "Impact-tested cricket batting helmet with adjustable powder-coated steel face grille.",
    "description": "High-protection cricket batting helmet conforming to safety guidelines. Equipped with dual-density EPS inner foam liner, rear rotary micro-adjustment dial, and wide aperture steel grille for optimal line-of-sight.",
    "specifications": {
      "Shell": "High-Impact Engineered ABS Resin",
      "Grille": "Powder-Coated Fixed Mild Steel Face Grille",
      "Liner": "Shock Absorbing Expanded Polystyrene (EPS)",
      "Fitting": "Rear Nape Dial Fit Adjuster",
      "Ventilation": "6 Crown Air Vents for Match Long Cooling"
    },
    "variants": [
      {
        "id": "v_bc10_m",
        "size": "Medium (56-58 cm)",
        "stockQty": 12
      },
      {
        "id": "v_bc10_l",
        "size": "Large (58-61 cm)",
        "stockQty": 8
      }
    ]
  },
  {
    "id": "prod_bc_11",
    "sku": "PRT-SG-GRD11",
    "name": "Cricket Abdominal Guard",
    "category": "protective",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "SG",
    "price": 299,
    "costPrice": 160,
    "gstPercent": 12,
    "stockQty": 65,
    "reorderLevel": 15,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Impact Molded Polycarbonate Cup with Thermoplastic Rubber Rim",
    "intendedUse": "Essential groin protection for batsmen and wicketkeepers",
    "image": "/images/proshop/box-cricket/cricket-abdominal-guard.svg",
    "shortDescription": "Anatomically molded protective groin cup with soft cushioned rubber edge border.",
    "description": "Ergonomically contoured cricket abdominal guard. Made from shatterproof poly-resin with dual perimeter rubber edging to disperse high-energy ball impact comfortably away from delicate body tissue.",
    "specifications": {
      "Cup Material": "High-Impact Rigid Polycarbonate",
      "Border": "Soft-Touch Shock Absorbent Thermoplastic Rubber (TPR)",
      "Design": "Ventilated Air-Channels for Moisture Dissipation",
      "Fit": "Compatible with all standard cricket supporter briefs and jockstraps",
      "Size Options": "Men Standard / Youth"
    }
  },
  {
    "id": "prod_bc_12",
    "sku": "EQP-DSC-NET12",
    "name": "Cricket Batting Net",
    "category": "equipment",
    "sport": "box_cricket",
    "compatibleSports": [
      "box_cricket"
    ],
    "brand": "DSC",
    "price": 4999,
    "costPrice": 3100,
    "gstPercent": 18,
    "stockQty": 10,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "UV-Stabilized Polyethylene Knotted Twine with Fiberglass Frame and Steel Anchors",
    "intendedUse": "Solo batting practice and bowling containment in turfs or backyards",
    "image": "/images/proshop/box-cricket/cricket-batting-net.svg",
    "shortDescription": "Portable 10ft x 10ft heavy-duty cricket batting enclosure with shock-corded poles.",
    "description": "Full-containment cricket practice net designed for batting and bowling drills. High-tenacity UV-resistant netting easily catches heavy tennis and leather ball drives. Sets up in under 10 minutes without tools.",
    "specifications": {
      "Dimensions": "10ft Wide x 10ft High x 10ft Depth",
      "Net Twine": "2.5mm Braided High-Density Polyethylene (HDPE)",
      "Mesh Size": "45mm Square Knotted Mesh",
      "Support Frame": "12.7mm Shock-Corded Heavy-Duty Fiberglass Rods",
      "Includes": "Carry Duffle Bag, 4 Guy Ropes, and 8 Heavy Ground Spikes"
    }
  },
  {
    "id": "prod_bad_1",
    "sku": "RKT-YNX-BGR1",
    "name": "Beginner Badminton Racket",
    "category": "rackets",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 1399,
    "costPrice": 850,
    "gstPercent": 12,
    "stockQty": 35,
    "reorderLevel": 8,
    "featured": true,
    "skillLevel": "Beginner",
    "material": "Tempered Aluminum Frame with Graphite Shaft",
    "intendedUse": "Recreational coaching and entry-level club play",
    "image": "/images/proshop/badminton/beginner-badminton-racket.svg",
    "shortDescription": "Durable lightweight badminton racket with isometric square head shape for easy sweet-spot timing.",
    "description": "Forgiving entry-level racket featuring Yonex Isometric head technology which expands the sweet spot by 7%. Pre-strung with durable synthetic gut at 20-22 lbs tension, ideal for learning proper overhead clears.",
    "specifications": {
      "Frame": "Aluminum Isometric Head",
      "Shaft": "Flexible Slim Carbon Graphite",
      "Weight": "U Grade (Approx. 95g)",
      "Grip Size": "G4 (3.25 inches)",
      "Factory String Tension": "20 - 22 lbs Pre-strung",
      "Balance": "Even Balance for All-Round Control"
    },
    "variants": [
      {
        "id": "v_bad1_1",
        "color": "Electric Blue",
        "stockQty": 20
      },
      {
        "id": "v_bad1_2",
        "color": "Laser Red",
        "stockQty": 15
      }
    ]
  },
  {
    "id": "prod_bad_2",
    "sku": "RKT-YNX-PRO2",
    "name": "Professional Badminton Racket",
    "category": "rackets",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 9499,
    "costPrice": 6200,
    "gstPercent": 12,
    "stockQty": 14,
    "reorderLevel": 3,
    "featured": true,
    "skillLevel": "Professional",
    "material": "HM Graphite with Nanomesh Neo and Tungsten Weight System",
    "intendedUse": "Tournament matches and aggressive offensive attacking play",
    "image": "/images/proshop/badminton/professional-badminton-racket.svg",
    "shortDescription": "High-modulus carbon graphite racket engineered for steep angle smashes and rapid head speed.",
    "description": "High-performance tournament racquet featuring Rotational Generator System balance distribution. The stiff carbon flex and aerodynamic frame slice through the air to deliver unreturnable steep smashes from the back court.",
    "specifications": {
      "Frame": "High Modulus Graphite + Tungsten Infusion",
      "Shaft": "Ultra Slim Stiff Graphite with Rexis Core",
      "Weight Class": "4U (83g ± 2g)",
      "Grip Size": "G5 (Thin Ergonomic Handle)",
      "Max Tension": "Up to 30 lbs string tension",
      "Balance Point": "Head-Heavy (305mm)"
    },
    "variants": [
      {
        "id": "v_bad2_1",
        "color": "Matte Black / Solar Orange",
        "stockQty": 9
      },
      {
        "id": "v_bad2_2",
        "color": "Midnight Navy / Gold",
        "stockQty": 5
      }
    ]
  },
  {
    "id": "prod_bad_3",
    "sku": "SHT-YNX-M350",
    "name": "Nylon Shuttlecock Set",
    "category": "balls",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 799,
    "costPrice": 510,
    "gstPercent": 12,
    "stockQty": 95,
    "reorderLevel": 25,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Virgin Nylon Polymer Skirt with Natural Portuguese Cork Base",
    "intendedUse": "Daily club social play and high-durability practice drills",
    "image": "/images/proshop/badminton/nylon-shuttlecock-set.svg",
    "shortDescription": "Tube of 6 precision-molded nylon shuttles with genuine cork base for natural flight trajectory.",
    "description": "The world benchmark for synthetic badminton shuttlecocks. Designed to simulate the recovery time and trajectory of feather shuttles with up to 5x longer durability on indoor wooden and synthetic courts.",
    "specifications": {
      "Quantity": "Tube of 6 Shuttlecocks",
      "Skirt Material": "Precision Fluted Virgin Nylon",
      "Base": "Solid Natural Portuguese Cork Tip",
      "Speed Rating": "Medium Speed (Blue Cap / 22°C - 33°C Indian conditions)",
      "Flight": "True Parabolic Flight Pattern"
    }
  },
  {
    "id": "prod_bad_4",
    "sku": "SHT-YNX-AS30",
    "name": "Feather Shuttlecock Set",
    "category": "balls",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 2199,
    "costPrice": 1520,
    "gstPercent": 12,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": true,
    "skillLevel": "Advanced",
    "material": "Grade A Selected Natural Goose Feathers with Dual-Density Portuguese Cork",
    "intendedUse": "Official state tournaments and advanced ranking matches",
    "image": "/images/proshop/badminton/feather-shuttlecock-set.svg",
    "shortDescription": "Tube of 12 tournament-grade goose feather shuttlecocks calibrated for precise flight stability.",
    "description": "BWF-standard goose feather shuttles offering unparalleled flight consistency, crisp acoustic response off the stringbed, and surgical touch control on tight net tumblers. Checked for rotational balance.",
    "specifications": {
      "Quantity": "Tube of 12 Shuttlecocks",
      "Feather Grade": "100% Grade A Selected Goose Feathers",
      "Cork Base": "Two-Layer Natural Composite Portuguese Cork",
      "Speed": "Speed 77 (Optimal for 25°C-30°C indoor halls)",
      "Flight Stability": "Tested for spin rate variance under 1.5%"
    }
  },
  {
    "id": "prod_bad_5",
    "sku": "STR-YNX-BG65",
    "name": "Badminton Racket Strings",
    "category": "strings",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 499,
    "costPrice": 280,
    "gstPercent": 12,
    "stockQty": 75,
    "reorderLevel": 20,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Polymer Multifilament Braided Nylon Fiber",
    "intendedUse": "Racket re-stringing for long-lasting tension retention and durability",
    "image": "/images/proshop/badminton/badminton-racket-strings.svg",
    "shortDescription": "10-meter packet of all-round badminton strings with 0.70mm gauge for maximum durability.",
    "description": "The most popular badminton string in the world. Features a specially braided high-tenacity nylon composite outer sheath that resists notched shearing during heavy off-center mishits.",
    "specifications": {
      "Length": "10 Meters (Single Racket Pack)",
      "Gauge / Diameter": "0.70 mm",
      "Core": "High-Polymer Multifilament Nylon",
      "Feel": "Medium Soft Impact Feel",
      "Key Metric": "Exceptional durability (10/10 rating)"
    },
    "variants": [
      {
        "id": "v_bg65_w",
        "color": "Optic White",
        "stockQty": 40
      },
      {
        "id": "v_bg65_y",
        "color": "Fluorescent Yellow",
        "stockQty": 35
      }
    ]
  },
  {
    "id": "prod_bad_6",
    "sku": "GRP-LN-REP6",
    "name": "Badminton Replacement Grip",
    "category": "grips",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Li-Ning",
    "price": 249,
    "costPrice": 130,
    "gstPercent": 12,
    "stockQty": 80,
    "reorderLevel": 20,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Cushioned Polyurethane with EVA Center Ridge and Self-Adhesive Backing",
    "intendedUse": "Base handle replacement for worn or hardened original grips",
    "image": "/images/proshop/badminton/badminton-replacement-grip.svg",
    "shortDescription": "Contoured thick polyurethane replacement grip with built-in EVA foam center spine.",
    "description": "Replaces the raw factory handle tape to restore plush palm cushioning and vibration dampening. Features beveled edge ridges that naturally guide fingers into correct forehand and backhand grip angles.",
    "specifications": {
      "Thickness": "1.8 mm Heavy Cushion",
      "Width": "25 mm",
      "Length": "1100 mm",
      "Backing": "Full Length Self-Adhesive Strip with End Taping",
      "Vibration Dampening": "High EVA Core Absorption"
    }
  },
  {
    "id": "prod_bad_7",
    "sku": "GRP-YNX-AC102",
    "name": "Badminton Overgrip Pack",
    "category": "grips",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 399,
    "costPrice": 220,
    "gstPercent": 12,
    "stockQty": 110,
    "reorderLevel": 30,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "High-Tack Polyurethane Elastomer",
    "intendedUse": "Sweat absorption and non-slip traction applied over base grip",
    "image": "/images/proshop/badminton/badminton-overgrip-pack.svg",
    "shortDescription": "Pack of 3 Super Grap ultra-tacky overgrips with moisture-absorbing micro-pores.",
    "description": "Yonex Super Grap enhances playability by absorbing sweat and preventing the racket handle from twisting in your fingers during lightning-fast defensive flat drives and overhead smashes.",
    "specifications": {
      "Pack Size": "3 Overgrips per Pack",
      "Thickness": "0.6 mm Ultra-Thin Tacky Feel",
      "Width": "25 mm",
      "Length": "1200 mm",
      "Finish": "Moisture Wicking Tacky Surface + Finishing Tape"
    },
    "variants": [
      {
        "id": "v_grp_w",
        "color": "White",
        "stockQty": 50
      },
      {
        "id": "v_grp_b",
        "color": "Black",
        "stockQty": 35
      },
      {
        "id": "v_grp_y",
        "color": "Neon Yellow",
        "stockQty": 25
      }
    ]
  },
  {
    "id": "prod_bad_8",
    "sku": "BAG-VIC-CVR8",
    "name": "Badminton Racket Cover",
    "category": "bags",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Victor",
    "price": 499,
    "costPrice": 260,
    "gstPercent": 18,
    "stockQty": 45,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Reinforced 420D Polyester with Foam Shock Lining and Adjustable Nylon Strap",
    "intendedUse": "Daily scratch and dust shielding for single badminton racket",
    "image": "/images/proshop/badminton/badminton-racket-cover.svg",
    "shortDescription": "Full-length padded thermal racket case with heavy zipper and shoulder carrying strap.",
    "description": "Protective individual badminton racquet sleeve. Features dense 5mm foam lining to guard graphite frames against chips and bumps during transport, plus an adjustable shoulder sling for hands-free commuting.",
    "specifications": {
      "Dimensions": "70 cm x 24 cm Full Racket Envelope",
      "Padding": "5mm Shock-Absorbing Open Cell Foam",
      "Shoulder Strap": "Adjustable Webbed Nylon Sling",
      "Closure": "Full-Length Heavy-Duty Metal Zipper",
      "Water Resistance": "Splash-Proof Coated Shell"
    }
  },
  {
    "id": "prod_bad_9",
    "sku": "BAG-YNX-KIT9",
    "name": "Badminton Racket Kit Bag",
    "category": "bags",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 3499,
    "costPrice": 2150,
    "gstPercent": 18,
    "stockQty": 20,
    "reorderLevel": 5,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "High-Density 900D Ballistic Polyester with Thermo-Guard Lining",
    "intendedUse": "Carrying 6 rackets, court shoes, apparel, and tournament supplies",
    "image": "/images/proshop/badminton/badminton-racket-kit-bag.svg",
    "shortDescription": "Double-compartment tournament kit bag holding 6 rackets with ventilated bottom shoe tunnel.",
    "description": "Tour-level tournament badminton bag with thermo-guard racquet compartment that insulates strings from extreme temperature fluctuations. Includes ergonomic backpack straps and separate dry/wet apparel divider.",
    "specifications": {
      "Capacity": "Holds up to 6 Rackets + Gear",
      "Compartments": "2 Main Dual Zips + 1 Front Organizer Pocket",
      "Shoe Pocket": "Dedicated Bottom Tunnel with Air Grommets",
      "Thermal Protection": "Silver Foil Thermo-Guard Lining in Racket Bay",
      "Carrying System": "Dual Padded Backpack Shoulder Straps + Grab Handle"
    }
  },
  {
    "id": "prod_bad_10",
    "sku": "EQP-VIC-NET10",
    "name": "Badminton Net",
    "category": "equipment",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Victor",
    "price": 1199,
    "costPrice": 720,
    "gstPercent": 18,
    "stockQty": 28,
    "reorderLevel": 6,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Knotted 18-Ply Braided Nylon Mesh with Heavy PVC Top Band and Steel Cable",
    "intendedUse": "Standard tournament and club wooden/synthetic badminton courts",
    "image": "/images/proshop/badminton/badminton-net.svg",
    "shortDescription": "Official BWF regulation 20ft x 2.5ft badminton net with reinforced double-stitched headband.",
    "description": "Regulation badminton court net constructed from high-tensile maroon nylon with 19mm square mesh. Fitted with an industrial 3.5mm vinyl-coated steel suspension cable that maintains net tension without sag.",
    "specifications": {
      "Dimensions": "6.10 Meters (20 ft) Length x 0.76 Meters (2.5 ft) Depth",
      "Mesh Size": "19mm Tournament Regulation Square Mesh",
      "Top Headband": "Double-Folded 38mm Heavy White PVC Canvas",
      "Cable": "Plastic Coated High-Tensile Steel Wire Cable",
      "Side & Bottom": "Overlocked Edge Binding with Reinforced Eyelets"
    }
  },
  {
    "id": "prod_bad_11",
    "sku": "EQP-STA-PST11",
    "name": "Badminton Net Post Set",
    "category": "equipment",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Stag",
    "price": 6499,
    "costPrice": 4100,
    "gstPercent": 18,
    "stockQty": 10,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Heavy-Gauge Tubular Steel with Powder Coating and Solid Cast Iron Wheel Bases",
    "intendedUse": "Free-standing tournament and club courts requiring mobile net tensioning",
    "image": "/images/proshop/badminton/badminton-net-post-set.svg",
    "shortDescription": "Pair of regulation 1.55m movable steel posts with 40kg weighted rubberized bases.",
    "description": "Free-standing wheelaway badminton court post set. Weighted heavy bases ensure firm net tension at exactly 1.55m regulation court height without drilling into wooden flooring. Fitted with non-marking nylon transport rollers.",
    "specifications": {
      "Post Height": "1.55 Meters (5 ft 1 in) Official Height",
      "Base Weight": "40 kg per post Solid Cast Ballast Counterweight",
      "Tensioning": "Integrated Heavy-Duty Ratchet Winch Mechanism",
      "Mobility": "Two Non-Marking Polyurethane Transport Wheels per Base",
      "Pulleys": "Grooved Solid Brass Top Cable Pulley"
    }
  },
  {
    "id": "prod_bad_12",
    "sku": "SHO-YNX-NM12",
    "name": "Non-Marking Badminton Shoes",
    "category": "shoes",
    "sport": "badminton",
    "compatibleSports": [
      "badminton"
    ],
    "brand": "Yonex",
    "price": 3899,
    "costPrice": 2450,
    "gstPercent": 18,
    "stockQty": 30,
    "reorderLevel": 6,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Breathable Double Russel Mesh Upper with True Gum Rubber Outsole",
    "intendedUse": "Indoor wooden and synthetic vinyl badminton court traction",
    "image": "/images/proshop/badminton/non-marking-badminton-shoes.svg",
    "shortDescription": "High-traction indoor court shoes with non-marking radial hexagrip gum rubber soles.",
    "description": "Engineered specifically for explosive multi-directional badminton footwork. Power Cushion foam absorbs jump landing shock while the lateral toe claw stabilizes fast lunges to prevent foot rollover.",
    "specifications": {
      "Outsole": "100% Non-Marking Pure Natural Gum Rubber (Hexagrip Pattern)",
      "Midsole": "Power Cushion EVA Shock Attenuation Foam",
      "Upper": "Synthetic Leather + High Ventilation Double Russel Mesh",
      "Court Suitability": "Certified for all indoor wooden & synthetic courts",
      "Weight": "Approx. 310g (UK Size 8)"
    },
    "variants": [
      {
        "id": "v_sho_7",
        "size": "UK 7 (EUR 40.5)",
        "stockQty": 6
      },
      {
        "id": "v_sho_8",
        "size": "UK 8 (EUR 42)",
        "stockQty": 10
      },
      {
        "id": "v_sho_9",
        "size": "UK 9 (EUR 43)",
        "stockQty": 8
      },
      {
        "id": "v_sho_10",
        "size": "UK 10 (EUR 44.5)",
        "stockQty": 6
      }
    ]
  },
  {
    "id": "prod_tt_1",
    "sku": "TT-GKI-KNG1",
    "name": "Beginner Table Tennis Bat",
    "category": "bats",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "GKI",
    "price": 699,
    "costPrice": 420,
    "gstPercent": 12,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": true,
    "skillLevel": "Beginner",
    "material": "5-Ply Selected Basswood Blade with 1.8mm Pips-In Control Sponge",
    "intendedUse": "Learning basic push, block, and forehand counter-drive technique",
    "image": "/images/proshop/table-tennis/beginner-table-tennis-bat.svg",
    "shortDescription": "Balanced beginner table tennis bat with flared ergonomic handle and high-control ITTF rubbers.",
    "description": "Ideal starter paddle offering high ball control and a forgiving sweet spot. High-friction pimples-in rubber allows recreational players to generate slice and basic topspin with consistent arc trajectory.",
    "specifications": {
      "Blade": "5-Ply Selected Light Basswood",
      "Rubber": "ITTF Approved GKI Kung-Fu Inverted Smooth Rubber",
      "Sponge Thickness": "1.8 mm High-Dampening Control Sponge",
      "Handle": "Flared Concave (FL) Ergonomic Grip",
      "Speed / Spin / Control": "Speed: 65 | Spin: 70 | Control: 92"
    }
  },
  {
    "id": "prod_tt_2",
    "sku": "TT-STG-CBN2",
    "name": "Professional Table Tennis Bat",
    "category": "bats",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 3799,
    "costPrice": 2400,
    "gstPercent": 12,
    "stockQty": 16,
    "reorderLevel": 4,
    "featured": true,
    "skillLevel": "Professional",
    "material": "5-Ply Wood + 2-Ply Koto Carbon Weave with 2.1mm Tensor Rubber",
    "intendedUse": "Aggressive looping, power drives, and competitive table tennis tournaments",
    "image": "/images/proshop/table-tennis/professional-table-tennis-bat.svg",
    "shortDescription": "High-speed carbon blade paddle with explosive tensor rubbers for heavy topspin loops.",
    "description": "Tournament-ready racket pairing high-modulus dual carbon plies with Stag Peter Karlsson ITTF rubber sheets. Generates blistering off-the-bounce speed and severe spin dynamics on both wings.",
    "specifications": {
      "Blade": "7-Ply (5 Wood Plies + 2 Micro-Carbon Layers)",
      "Rubbers": "Stag Official ITTF Approved Offensive Rubber (Red/Black)",
      "Sponge": "2.1 mm High Elasticity Spring Tension Foam",
      "Handle": "Anatomic Flared Handle with Vibration Absorber Tube",
      "Speed / Spin / Control": "Speed: 95 | Spin: 94 | Control: 80"
    }
  },
  {
    "id": "prod_tt_3",
    "sku": "TT-STG-3STR3",
    "name": "Three-Star Table Tennis Balls",
    "category": "balls",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 499,
    "costPrice": 290,
    "gstPercent": 12,
    "stockQty": 75,
    "reorderLevel": 20,
    "featured": true,
    "skillLevel": "Advanced",
    "material": "ITTF-Approved Non-Celluloid Seamless 40+ ABS Plastic",
    "intendedUse": "Tournament ranking matches and professional club leagues",
    "image": "/images/proshop/table-tennis/three-star-table-tennis-balls.svg",
    "shortDescription": "Pack of 6 ITTF-certified 3-star tournament 40+ ABS balls with true bounce sphericity.",
    "description": "Engineered for tournament play, these three-star balls undergo laser scanning for wall thickness uniformity and seam symmetry. Ensures completely predictable bounce and accurate spin response.",
    "specifications": {
      "Quantity": "Box of 6 Balls",
      "Star Rating": "3-Star (ITTF Approved for Tournament Play)",
      "Diameter": "40.0mm - 40.5mm (Regulation 40+)",
      "Weight": "2.7g Official Standard",
      "Material": "High Hardness ABS Poly Plastic (Non-Celluloid)",
      "Color": "Tournament Matte White"
    }
  },
  {
    "id": "prod_tt_4",
    "sku": "TT-GKI-PRC4",
    "name": "Practice Table Tennis Balls",
    "category": "balls",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "GKI",
    "price": 1199,
    "costPrice": 720,
    "gstPercent": 12,
    "stockQty": 50,
    "reorderLevel": 12,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Impact 40+ ABS Polymer",
    "intendedUse": "Multi-ball bucket training drills and automated robot feeders",
    "image": "/images/proshop/table-tennis/practice-table-tennis-balls.svg",
    "shortDescription": "Box of 60 training grade 40+ ABS table tennis balls with durable shatter-resistant casing.",
    "description": "Bulk training pack ideal for coaches running multi-ball footwork sessions or ball robot practice. Made from tough ABS polymer that withstands thousands of edge smashes without denting.",
    "specifications": {
      "Quantity": "Box of 60 Balls",
      "Grade": "Training / Practice 1-Star Standard",
      "Size": "40+ mm Regulation Standard",
      "Color": "High-Visibility Neon Orange / White",
      "Compatibility": "Universal fit for all table tennis robot feeders"
    }
  },
  {
    "id": "prod_tt_5",
    "sku": "TT-STG-NET5",
    "name": "Table Tennis Net and Post Set",
    "category": "equipment",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 1299,
    "costPrice": 780,
    "gstPercent": 18,
    "stockQty": 30,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Heavy-Duty Steel Clamp Posts with High-Density Cotton Mesh Net",
    "intendedUse": "Converting regulation TT tables with quick-mount screw or spring clamps",
    "image": "/images/proshop/table-tennis/table-tennis-net-and-post-set.svg",
    "shortDescription": "Tournament clamp-style table tennis post set with height adjustment gauge and beaded string.",
    "description": "ITTF-compliant table tennis net post set. Features spring-action heavy steel clamps with thick rubber inner jaws to protect table finish. Includes height-adjustment thumbscrews and ball-chain tensioning cord.",
    "specifications": {
      "Net Height": "15.25 cm (6 inches) Official ITTF Regulation",
      "Clamp Opening": "Fits table tops up to 45 mm thickness",
      "Net Material": "Heavy Knitted Cotton / Nylon Hybrid Mesh",
      "Post Material": "Powder Coated Heavy Gauge Steel",
      "Tensioning": "Ball Chain with Locking Slot on Post"
    }
  },
  {
    "id": "prod_tt_6",
    "sku": "TT-STG-RUB6",
    "name": "Table Tennis Rubber Sheet",
    "category": "accessories",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 1499,
    "costPrice": 920,
    "gstPercent": 12,
    "stockQty": 45,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "Intermediate",
    "material": "Natural High-Tack Rubber Topsheet with 2.0mm High-Elastic Sponge",
    "intendedUse": "Custom blade assembly and replacing worn paddle rubbers",
    "image": "/images/proshop/table-tennis/table-tennis-rubber-sheet.svg",
    "shortDescription": "ITTF-approved inverted rubber sheet engineered for heavy topspin and explosive counter-drives.",
    "description": "High-friction tensor inverted rubber sheet. Specially formulated tacky surface grabs the plastic 40+ ball to produce vicious dip on topspin loops and heavy backspin on chops.",
    "specifications": {
      "Rubber Type": "Inverted Pimples-In ITTF Certified",
      "Sponge Thickness": "2.0 mm High Rebound Orange Sponge",
      "Sponge Hardness": "Medium Hard (45° Shore)",
      "Suitability": "Forehand and Backhand Attacking Play",
      "Color Options": "Red / Black"
    },
    "variants": [
      {
        "id": "v_rub_r",
        "color": "Tournament Red",
        "stockQty": 25
      },
      {
        "id": "v_rub_b",
        "color": "Tournament Black",
        "stockQty": 20
      }
    ]
  },
  {
    "id": "prod_tt_7",
    "sku": "TT-GKI-CVR7",
    "name": "Table Tennis Bat Cover",
    "category": "bags",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "GKI",
    "price": 349,
    "costPrice": 180,
    "gstPercent": 18,
    "stockQty": 55,
    "reorderLevel": 12,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Padded Oxford Fabric with Ball Storage Pocket and Zipper Closure",
    "intendedUse": "Protecting paddle rubber sheets from dust, oxidation, and scratches",
    "image": "/images/proshop/table-tennis/table-tennis-bat-cover.svg",
    "shortDescription": "Foam-padded table tennis paddle case with zippered exterior pocket holding 3 balls.",
    "description": "Form-fitting bat wallet with 4mm protective foam sandwich lining. Shields rubber sheets from atmospheric oxidation and accidental scrapes inside sports bags, extending the lifespan of tacky rubbers.",
    "specifications": {
      "Capacity": "1 Table Tennis Racket + 3 Balls",
      "Material": "Water-Repellent 600D Polyester Outer",
      "Padding": "4mm Shock-Absorbing PE Foam",
      "Closure": "Heavy Duty Coil Zipper with Metal Puller",
      "Feature": "Integrated Ball Compartment with Elastic Mesh"
    }
  },
  {
    "id": "prod_tt_8",
    "sku": "TT-STG-TCV8",
    "name": "Table Tennis Table Cover",
    "category": "equipment",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 1899,
    "costPrice": 1150,
    "gstPercent": 18,
    "stockQty": 18,
    "reorderLevel": 4,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "420D Heavy Oxford Fabric with PU Waterproof Undercoating",
    "intendedUse": "Covering indoor or outdoor TT tables in both flat playing and folded positions",
    "image": "/images/proshop/table-tennis/table-tennis-table-cover.svg",
    "shortDescription": "All-weather waterproof table cover with side zipper and elastic windproof hem.",
    "description": "Heavyweight protective dust and water cover designed to fit standard 9ft regulation tables. Protects wooden composite playing tops from humidity warping, dust, spills, and UV color fading.",
    "specifications": {
      "Compatibility": "Fits standard 9ft x 5ft regulation tables (flat or folded)",
      "Dimensions": "165 cm x 70 cm x 185 cm (Folded Mode)",
      "Fastening": "Heavy-duty side zipper + Bottom buckle wind straps",
      "Weather Protection": "Waterproof, UV resistant, and dust-proof"
    }
  },
  {
    "id": "prod_tt_9",
    "sku": "TT-DON-CLN9",
    "name": "Table Tennis Racket Cleaning Kit",
    "category": "accessories",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Donic",
    "price": 499,
    "costPrice": 280,
    "gstPercent": 18,
    "stockQty": 50,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Anti-Static VOC-Free Foaming Cleanser (100ml) with Dual-Density Microfiber Sponge",
    "intendedUse": "Removing sweat, dust, and ball chalk from rubber sheets to maintain grip",
    "image": "/images/proshop/table-tennis/table-tennis-racket-cleaning-kit.svg",
    "shortDescription": "Anti-static VOC-free rubber foam cleaner with dual-density sponge to restore spin tackiness.",
    "description": "Specially formulated for table tennis rubber care. The VOC-free non-hazardous pump foam lifts dust and oil without drying out the natural rubber, rejuvenating optimum grip for spin generation.",
    "specifications": {
      "Cleanser Volume": "100 ml Foam Dispenser Bottle",
      "Formula": "VOC-Free Anti-Static Non-Flammable Cleaner",
      "Sponge": "Dual-Layer (Dense Chamois Side + Absorbent Sponge Side)",
      "Usage": "Apply 1 pump after each playing session and wipe dry"
    }
  },
  {
    "id": "prod_tt_10",
    "sku": "TT-STG-COL10",
    "name": "Table Tennis Ball Collector",
    "category": "equipment",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 2199,
    "costPrice": 1350,
    "gstPercent": 18,
    "stockQty": 22,
    "reorderLevel": 5,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Telescopic Aluminum Alloy Shaft with High-Tensile Spring Wire Basket",
    "intendedUse": "Rapid retrieval of practice balls from club floors without bending",
    "image": "/images/proshop/table-tennis/table-tennis-ball-collector.svg",
    "shortDescription": "Telescopic ball picker net holding up to 120 balls with effortless push-over retrieval.",
    "description": "Ergonomic ball gathering device designed for clubs and multi-ball coaching. Simply press the bottom basket over balls on the floor; spring wires spread to pull balls inside without damaging them.",
    "specifications": {
      "Capacity": "Holds up to 120 Table Tennis Balls",
      "Shaft": "Adjustable Aluminum Pole (Extends 60 cm to 110 cm)",
      "Basket Wire": "Rust-Resistant High-Tension Piano Steel Wire",
      "Weight": "Lightweight 680g Construction"
    }
  },
  {
    "id": "prod_tt_11",
    "sku": "TT-ROB-FDR11",
    "name": "Table Tennis Robot Feeder",
    "category": "equipment",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 14999,
    "costPrice": 9800,
    "gstPercent": 18,
    "stockQty": 8,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Engineered Polymer Housing with Dual Motor Friction Wheels and Digital Remote",
    "intendedUse": "Automated solo table tennis practice drills and stroke consistency training",
    "image": "/images/proshop/table-tennis/table-tennis-robot-feeder.svg",
    "shortDescription": "Table-mount automatic ball machine with 360-degree oscillation and adjustable spin controls.",
    "description": "Programmable electronic table tennis partner. Clamps to the end of any regulation table, delivering topspin, backspin, sidespin, and no-spin balls at variable frequencies from 28 to 80 balls per minute.",
    "specifications": {
      "Ball Capacity": "Holds 110 Balls in Transparent Hopper",
      "Spin Modes": "Topspin, Backspin, Left Sidespin, Right Sidespin, Flat",
      "Frequency": "Adjustable 28 to 80 Balls / Minute",
      "Oscillation": "Wide Sweep 360° Horizontal Sweeping Range",
      "Control": "Wired Digital Remote Control with Speed Dials",
      "Power Supply": "100V - 240V Indian Plug Adapter Included"
    }
  },
  {
    "id": "prod_tt_12",
    "sku": "TT-STG-TBL12",
    "name": "Foldable Table Tennis Table",
    "category": "equipment",
    "sport": "table_tennis",
    "compatibleSports": [
      "table_tennis"
    ],
    "brand": "Stag",
    "price": 21999,
    "costPrice": 15500,
    "gstPercent": 18,
    "stockQty": 6,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "18mm High-Density Engineered Wood Top with 40mm Steel Under-Frame and 75mm Wheels",
    "intendedUse": "Official club recreation, tournament practice, and solo playback training",
    "image": "/images/proshop/table-tennis/foldable-table-tennis-table.svg",
    "shortDescription": "Regulation 9ft x 5ft foldable table with 18mm precision top and independent playback halves.",
    "description": "Championship-grade indoor table tennis table featuring a glare-resistant 18mm composite playing top for true ball bounce. Two independent halves fold vertically for compact storage or solo half-table playback drills.",
    "specifications": {
      "Playing Surface": "18mm Specially Treated High-Density Composite Board",
      "Dimensions": "274 cm (L) x 152.5 cm (W) x 76 cm (H) - ITTF Regulation 9x5 ft",
      "Frame & Legs": "40mm Heavy-Gauge Square Steel Tubing with Levelers",
      "Wheels": "8 Heavy-Duty 75mm Caster Wheels with Integrated Brakes",
      "Playback Mode": "Yes (Fold one side upright for solo practice)",
      "Includes": "Stag Tournament Clip Net and Post Set"
    }
  },
  {
    "id": "prod_vb_1",
    "sku": "VLB-CSC-IND1",
    "name": "Indoor Volleyball",
    "category": "balls",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Cosco",
    "price": 1299,
    "costPrice": 780,
    "gstPercent": 12,
    "stockQty": 30,
    "reorderLevel": 8,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Microfiber Composite Synthetic Leather with Cushioned Foam Backing",
    "intendedUse": "Indoor wooden and synthetic court practice and club matches",
    "image": "/images/proshop/volleyball/indoor-volleyball.svg",
    "shortDescription": "Soft-touch composite leather indoor volleyball with 18-panel laminated construction.",
    "description": "Designed for high-level indoor play. Features a supple composite leather cover that cushions intense spikes and high-velocity digs, reducing forearm sting while providing true flight stability.",
    "specifications": {
      "Construction": "18-Panel Laminated Composite",
      "Bladder": "Dual-Layer Butyl Rubber Bladder",
      "Size & Weight": "FIVB Official Size 5 (260g - 280g, 65-67cm circumference)",
      "Touch": "Extra-Soft Cushioned Impact Cover",
      "Pressure Spec": "4.26 - 4.61 PSI (0.30 - 0.325 kgf/cm²)"
    }
  },
  {
    "id": "prod_vb_2",
    "sku": "VLB-NIV-OUT2",
    "name": "Outdoor Volleyball",
    "category": "balls",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Nivia",
    "price": 899,
    "costPrice": 540,
    "gstPercent": 12,
    "stockQty": 45,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Machine-Stitched Water-Resistant Polyurethane (PU) with Reinforced Fabric Layer",
    "intendedUse": "Outdoor sand, mud, and hard court recreation",
    "image": "/images/proshop/volleyball/outdoor-volleyball.svg",
    "shortDescription": "All-weather heavy-duty outdoor volleyball with water-repellent stitched panels.",
    "description": "Engineered to withstand abrasive outdoor surfaces like sand, concrete, and rough grass. Machine-stitched seams and weather-proof synthetic PU skin ensure shape retention in harsh tropical conditions.",
    "specifications": {
      "Construction": "18-Panel Precision Machine Stitched",
      "Material": "Tear-Resistant Micro-Textured PU",
      "Water Resistance": "Water-Repellent Sealing on Seams",
      "Size": "Official Size 5 Standard",
      "Suitability": "Beach volleyball, mud ground, and concrete surfaces"
    }
  },
  {
    "id": "prod_vb_3",
    "sku": "VLB-MIK-MTC3",
    "name": "Volleyball Match Ball",
    "category": "balls",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Mikasa",
    "price": 3499,
    "costPrice": 2250,
    "gstPercent": 12,
    "stockQty": 18,
    "reorderLevel": 4,
    "featured": true,
    "skillLevel": "Professional",
    "material": "Double-Dimpled Microfiber Cover with Anti-Sweat Nano Technology",
    "intendedUse": "Tournament championship matches and official league play",
    "image": "/images/proshop/volleyball/volleyball-match-ball.svg",
    "shortDescription": "Official tournament match volleyball featuring aerodynamic dimpled panels for anti-turbulence.",
    "description": "The pinnacle of volleyball engineering. Features patented aerodynamic double-dimple surface that stabilizes ball trajectory through the air and prevents hand slippage during intense setter actions.",
    "specifications": {
      "Certification": "FIVB Official Game Ball Standards",
      "Aerodynamics": "Double-Dimple Engineered Surface Pattern",
      "Panels": "Curved 8-Panel Precision Thermo-Bonded Design",
      "Bladder": "Leak-Proof Butyl Air Lock Core",
      "Grip": "Nano-Coated Moisture Absorbing Cover"
    }
  },
  {
    "id": "prod_vb_4",
    "sku": "VLB-CSC-TRN4",
    "name": "Volleyball Training Ball",
    "category": "balls",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Cosco",
    "price": 1199,
    "costPrice": 740,
    "gstPercent": 12,
    "stockQty": 30,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "Intermediate",
    "material": "Weighted Multi-Ply Rubberized Leather Core (Approx. 450g)",
    "intendedUse": "Setter finger conditioning, wrist power, and blocking drills",
    "image": "/images/proshop/volleyball/volleyball-training-ball.svg",
    "shortDescription": "Heavyweight setter practice volleyball designed to build wrist and forearm setting power.",
    "description": "Heavier than standard match balls (450g vs standard 270g), this training volleyball forces setters to engage core and hand strength. Helps players develop soft, fast setting hands and solid block resistance.",
    "specifications": {
      "Weight": "450g ± 15g (Weighted Strength Builder)",
      "Size": "Standard Size 5 Circumference (66cm)",
      "Cover": "Durable Synthetic Laminated Leather",
      "Focus": "Finger, wrist, and forearm strengthening",
      "Recommended Usage": "Pre-match setting warm-up and conditioning"
    }
  },
  {
    "id": "prod_vb_5",
    "sku": "EQP-CSC-NET5",
    "name": "Volleyball Net",
    "category": "equipment",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Cosco",
    "price": 1699,
    "costPrice": 1050,
    "gstPercent": 18,
    "stockQty": 25,
    "reorderLevel": 6,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Knotted 3.0mm Polyethylene Square Mesh with 7cm PVC Headband and Aircraft Steel Wire",
    "intendedUse": "Standard tournament and club volleyball courts",
    "image": "/images/proshop/volleyball/volleyball-net.svg",
    "shortDescription": "Regulation 9.5m x 1m volleyball net with heavy steel tension cable and reinforced side hems.",
    "description": "Championship-grade volleyball net built to official FIVB specifications. Features heavy 10cm square black mesh with a dual-stitched white PVC coated headband and plastic-jacketed steel tensioning cable.",
    "specifications": {
      "Dimensions": "9.50 Meters Length x 1.00 Meter Height",
      "Mesh Type": "10 cm Square Knotted Black Polyethylene Mesh",
      "Top Band": "7 cm Heavy-Duty White Tarpaulin Headband",
      "Bottom Band": "5 cm Reinforced Bottom Webbing",
      "Tension Cable": "4mm Aircraft Grade Steel Cable (12.5m total length)"
    }
  },
  {
    "id": "prod_vb_6",
    "sku": "EQP-STA-ANT6",
    "name": "Volleyball Antenna Set",
    "category": "equipment",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Stag",
    "price": 1499,
    "costPrice": 920,
    "gstPercent": 18,
    "stockQty": 20,
    "reorderLevel": 5,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "High-Flex Fiberglass Rods with Alternating Red & White Enamel and Fabric Sleeves",
    "intendedUse": "Official match court boundary marking on the volleyball net",
    "image": "/images/proshop/volleyball/volleyball-antenna-set.svg",
    "shortDescription": "Pair of 1.80m regulation red & white striped fiberglass antennas with pocket clamps.",
    "description": "FIVB-compliant volleyball court net antennas. Composed of two flexible 1.80m fiberglass rods with 10cm alternating red and white bands. Includes heavy-duty hook-and-loop clamp sleeves that secure firmly to net sides.",
    "specifications": {
      "Length": "1.80 Meters (Official Regulation Length)",
      "Diameter": "10 mm High-Tensile Flexible Fiberglass",
      "Coloring": "Alternating 10cm High-Visibility Red & White Stripes",
      "Attachments": "Includes 2 Heavy-Duty Net Sheath Pockets with Velcro",
      "Flexibility": "Bends on impact without snapping or splintering"
    }
  },
  {
    "id": "prod_vb_7",
    "sku": "EQP-NIV-BND7",
    "name": "Volleyball Net Boundary Tape",
    "category": "equipment",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Nivia",
    "price": 499,
    "costPrice": 280,
    "gstPercent": 18,
    "stockQty": 35,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Heavy-Duty 5cm Coated PVC Fabric with Metal Eyelets and Fastening Cords",
    "intendedUse": "Attaching vertically to net to demarcate side boundary lines",
    "image": "/images/proshop/volleyball/volleyball-net-boundary-tape.svg",
    "shortDescription": "Pair of 5cm wide white net side boundary bands for official court alignment.",
    "description": "White side marker bands fastened vertically to the net above each sideline. Features heavy-duty PVC tarpaulin with rust-proof metal grommets and tie cords for quick adjustment.",
    "specifications": {
      "Width": "5 cm Regulation Sideline Width",
      "Length": "1.00 Meter (Full Net Height)",
      "Material": "Weatherproof White PVC Coated Polyester",
      "Fastening": "Reinforced Brass Eyelets with Nylon Tie Cords",
      "Set": "Pair of 2 Bands"
    }
  },
  {
    "id": "prod_vb_8",
    "sku": "PRT-NIV-KNE8",
    "name": "Volleyball Knee Pads",
    "category": "protective",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Nivia",
    "price": 749,
    "costPrice": 420,
    "gstPercent": 12,
    "stockQty": 50,
    "reorderLevel": 12,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "High-Density Contoured EVA Foam Core with Elastic Knit Sleeve",
    "intendedUse": "Floor burn prevention and patella impact cushioning during floor dives",
    "image": "/images/proshop/volleyball/volleyball-knee-pads.svg",
    "shortDescription": "Ergonomic padded knee sleeves with shock-absorbing foam for floor defense dives.",
    "description": "Anatomically molded volleyball knee pads engineered for liberos and floor diggers. Thick EVA foam protects the patella and lateral meniscus from hard court collisions while the breathable sleeve prevents slippage.",
    "specifications": {
      "Padding": "22mm High-Density Contoured EVA Foam",
      "Sleeve": "Moisture-Wicking Elastic Poly-Cotton Blend",
      "Anti-Slip": "Silicone Wave Grip Ring on Inner Upper Band",
      "Protection Area": "Patella, Tibial Tuberosity, and Meniscus Margins",
      "Pack": "Sold as a Matching Pair (2 Pads)"
    },
    "variants": [
      {
        "id": "v_kne_m",
        "size": "Medium (Thigh 34-40cm)",
        "stockQty": 25
      },
      {
        "id": "v_kne_l",
        "size": "Large (Thigh 40-46cm)",
        "stockQty": 25
      }
    ]
  },
  {
    "id": "prod_vb_9",
    "sku": "PRT-CSC-ANK9",
    "name": "Volleyball Ankle Support",
    "category": "protective",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Cosco",
    "price": 649,
    "costPrice": 380,
    "gstPercent": 12,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Breathable Perforated Neoprene with Bilateral Flexible Spiral Stabilizers",
    "intendedUse": "Stabilizing ankle ligaments and preventing rollover during net jumps",
    "image": "/images/proshop/volleyball/volleyball-ankle-support.svg",
    "shortDescription": "Figure-8 strapping ankle brace with flexible side stays for jump landing protection.",
    "description": "Volleyball ankle support featuring criss-cross figure-8 tension straps. Replicates athletic taping to restrict inward inversion rolls during aggressive block landings without limiting running agility.",
    "specifications": {
      "Support System": "Figure-8 Elasticated Tension Straps + Spiral Stays",
      "Material": "3mm Breathable Perforated Neoprene with Nylon Lining",
      "Heel Design": "Open Heel for Natural Foot Flexion and Shoe Fit",
      "Fit": "Universal (Can be worn on Left or Right foot)"
    },
    "variants": [
      {
        "id": "v_ank_m",
        "size": "Medium (Shoe UK 6-8)",
        "stockQty": 22
      },
      {
        "id": "v_ank_l",
        "size": "Large (Shoe UK 9-11)",
        "stockQty": 18
      }
    ]
  },
  {
    "id": "prod_vb_10",
    "sku": "PRT-TYK-FNG10",
    "name": "Volleyball Finger Support",
    "category": "protective",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Tyka",
    "price": 299,
    "costPrice": 150,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Seamless Elastic Compression Spandex Knit with Soft Padded Joint Layer",
    "intendedUse": "Protecting finger joints from hyperextension during blocking and spiking",
    "image": "/images/proshop/volleyball/volleyball-finger-support.svg",
    "shortDescription": "Pack of 10 elastic compression finger sleeve braces for block and spike impact.",
    "description": "Set of 10 compression sleeves designed for volleyball spikers and blockers. Protects interphalangeal joints against dislocation, sprains, and ball shock without requiring sticky athletic tape.",
    "specifications": {
      "Pack Size": "10 Finger Sleeves per Pack",
      "Material": "80% Nylon, 20% High-Stretch Spandex",
      "Length": "4.5 cm (Fits standard adult finger joints)",
      "Compression": "Mild Joint Stabilizing Compression",
      "Washable": "Machine Washable and Fast Drying"
    }
  },
  {
    "id": "prod_vb_11",
    "sku": "EQP-CSC-CRT11",
    "name": "Volleyball Ball Cart",
    "category": "equipment",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Cosco",
    "price": 4799,
    "costPrice": 3100,
    "gstPercent": 18,
    "stockQty": 12,
    "reorderLevel": 3,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Collapsible Aluminum Alloy Scissors Frame with Heavy-Duty 600D Canvas Hammock",
    "intendedUse": "Holding up to 24 inflated volleyballs during club serving and spiking drills",
    "image": "/images/proshop/volleyball/volleyball-ball-cart.svg",
    "shortDescription": "Collapsible hammock-style ball carrier on 360-degree wheels holding 24 volleyballs.",
    "description": "Coach-preferred training equipment. Elevated waist-height hammock design allows rapid ball feeding during serving and spiking drills without having to stoop down. Folds umbrella-style for storage.",
    "specifications": {
      "Ball Capacity": "Holds 20-24 Inflated Size 5 Volleyballs",
      "Dimensions": "65 cm x 65 cm x 100 cm (Open Height)",
      "Frame": "Lightweight High-Strength Aluminum Accordion Frame",
      "Mobility": "4 Heavy-Duty 360° Smooth Swivel Wheels with Brakes",
      "Includes": "Zippered Shoulder Travel Duffle Bag"
    }
  },
  {
    "id": "prod_vb_12",
    "sku": "ACC-NIV-GGE12",
    "name": "Volleyball Ball Pressure Gauge",
    "category": "accessories",
    "sport": "volleyball",
    "compatibleSports": [
      "volleyball"
    ],
    "brand": "Nivia",
    "price": 599,
    "costPrice": 340,
    "gstPercent": 18,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Machined Solid Brass Body with Dial Pressure Scale and Bleed Valve",
    "intendedUse": "Checking and adjusting exact ball inflation to regulation standards",
    "image": "/images/proshop/volleyball/volleyball-ball-pressure-gauge.svg",
    "shortDescription": "Analog dial ball pressure gauge with release valve reading 0-20 PSI / 0-1.4 Bar.",
    "description": "Precision mechanical dial gauge with built-in push-button air release valve. Allows referees and coaches to measure and bleed excess pressure to dial in exact FIVB match inflation specs.",
    "specifications": {
      "Dial Scale": "Dual Scale: 0-20 PSI / 0-1.4 Bar (0.1 PSI accuracy)",
      "Mechanism": "Precision Bourdon Spring Movement",
      "Pressure Release": "Push-Button Air Bleed Valve on Body",
      "Needles": "Includes 2 Standard Threaded Stainless Steel Needles",
      "Compatibility": "Universal for Volleyball, Football, Basketball"
    }
  },
  {
    "id": "prod_kk_1",
    "sku": "KHO-VNX-POL1",
    "name": "Kho Kho Playing Pole Set",
    "category": "equipment",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Vinex",
    "price": 3499,
    "costPrice": 2200,
    "gstPercent": 18,
    "stockQty": 15,
    "reorderLevel": 4,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Seasoned Sal Wood / Tubular Steel with Smooth Rounded Domed Tops",
    "intendedUse": "Official ground installation for Kho Kho courts",
    "image": "/images/proshop/kho-kho/kho-kho-playing-pole-set.svg",
    "shortDescription": "Pair of regulation wooden Kho Kho upright posts with smooth domed tops and ground sleeves.",
    "description": "Regulation Kho Kho playing post set. Built to Kho Kho Federation of India (KKFI) specifications with height between 120cm-125cm above ground and diameter of 9-10cm. Features rounded snag-free wooden tops to protect turning chasers.",
    "specifications": {
      "Height Above Ground": "120 cm - 125 cm (Official KKFI Regulation)",
      "Diameter": "9.5 cm - 10.0 cm Cylindrical Section",
      "Top Finish": "Smooth Domed Top without sharp edges",
      "Ground Sockets": "Pair of 45cm Deep Galvanized Steel Ground Sleeves",
      "Set": "Pair of 2 Official Poles with End Caps"
    }
  },
  {
    "id": "prod_kk_2",
    "sku": "KHO-NEL-PBL2",
    "name": "Portable Kho Kho Pole Set",
    "category": "equipment",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Nelco",
    "price": 4999,
    "costPrice": 3250,
    "gstPercent": 18,
    "stockQty": 10,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Powder-Coated Tubular Steel Posts with 35kg Rubberized Cast Iron Base Plates",
    "intendedUse": "Temporary Kho Kho setups on synthetic turfs, indoor wooden courts and grass fields",
    "image": "/images/proshop/kho-kho/portable-kho-kho-pole-set.svg",
    "shortDescription": "Free-standing movable Kho Kho poles mounted on heavy cast iron ballast discs.",
    "description": "Engineered for venues where digging ground sockets is not permitted. Sturdy 35kg counterweight bases ensure upright poles do not shift or topple when chasers grapple during 360-degree high-speed turnarounds.",
    "specifications": {
      "Post Height": "1.20 Meters Official Playing Height",
      "Base Type": "Low-Profile Circular Cast Iron Discs with Rubber Underside",
      "Base Weight": "35 kg per pole for extreme stability",
      "Floor Protection": "Non-Marking Heavy Rubber Base Padding",
      "Assembly": "Heavy Threaded Screw-in Mounting System"
    }
  },
  {
    "id": "prod_kk_3",
    "sku": "KHO-AVR-MRK3",
    "name": "Kho Kho Ground Marking Kit",
    "category": "equipment",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Avaro",
    "price": 1899,
    "costPrice": 1100,
    "gstPercent": 18,
    "stockQty": 25,
    "reorderLevel": 6,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Powder Applicator Hopper with 50m Braided Cord and Stencil Markers",
    "intendedUse": "Laying out the 8 cross lanes, central lane, and chaser boxes on soil/mud grounds",
    "image": "/images/proshop/kho-kho/kho-kho-ground-marking-kit.svg",
    "shortDescription": "Complete court marking apparatus with dry line spreader, cord reel, and box templates.",
    "description": "Everything required to mark an official 27m x 16m senior or junior Kho Kho ground. Includes adjustable line spreader for dry eco lime powder, heavy twine guide cord, and 35cm x 30cm chaser box stencils.",
    "specifications": {
      "Includes": "Dispenser Cart + 100m Twisted Marking Twine + 8 Metal Pegs",
      "Line Width": "Standard 5cm Boundary and Cross Lane Spreading",
      "Templates": "Standard Chaser Sitting Square Stencils Included",
      "Compatibility": "Clay, Soil, and Natural Grass Surfaces"
    }
  },
  {
    "id": "prod_kk_4",
    "sku": "KHO-VNX-TAP4",
    "name": "Kho Kho Boundary Marking Tape",
    "category": "equipment",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Vinex",
    "price": 1299,
    "costPrice": 780,
    "gstPercent": 18,
    "stockQty": 30,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Tensile Woven Vinyl-Coated Webbing with Brass Eyelets and Ground Stakes",
    "intendedUse": "Court perimeter boundary and lobby line marking for multi-purpose turfs",
    "image": "/images/proshop/kho-kho/kho-kho-boundary-marking-tape.svg",
    "shortDescription": "Heavy-duty 50mm non-tear court boundary tape set with flush ground anchor pins.",
    "description": "Durable anti-slip woven marking tape roll. Eliminates lime powder re-marking between tournament turns. Anchors firmly into ground with flush steel stakes to prevent tripping sprinting defenders.",
    "specifications": {
      "Roll Length": "100 Meters Total Length",
      "Tape Width": "50 mm (2 inches) Regulation Width",
      "Material": "Reinforced Tear-Proof Woven PVC Webbing",
      "Color": "High-Contrast Bright White with Yellow Accents",
      "Fasteners": "Includes 20 Flush Steel Ground Anchor Pegs"
    }
  },
  {
    "id": "prod_kk_5",
    "sku": "KHO-CSC-FMS5",
    "name": "Kho Kho Field Measuring Tape",
    "category": "accessories",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Cosco",
    "price": 699,
    "costPrice": 380,
    "gstPercent": 18,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "50-Meter Fiberglass Non-Stretch Tape with Open ABS Reel and Folding Winding Handle",
    "intendedUse": "Precision measuring of court perimeter (27m x 16m) and 8 cross-lane intervals",
    "image": "/images/proshop/kho-kho/kho-kho-field-measuring-tape.svg",
    "shortDescription": "50-meter open reel fiberglass measuring tape with metal claw end and rapid rewinder.",
    "description": "Essential field official measuring tool. Non-stretch fiberglass tape withstands muddy outdoor grounds and humidity without expansion, guaranteeing exact distances between poles and cross lanes.",
    "specifications": {
      "Length": "50 Meters / 165 Feet Dual Metric & Imperial Markings",
      "Blade Width": "13 mm High-Strength Non-Stretch Fiberglass",
      "Case": "Open 4-Spoke Impact-Resistant ABS Reel with Ground Spike",
      "Winding": "High-Speed 3:1 Planetary Gear Rapid Retract Handle",
      "Hook": "Heavy-Duty Folding Metal End Ring with Stake Claw"
    }
  },
  {
    "id": "prod_kk_6",
    "sku": "KHO-STA-SCB6",
    "name": "Kho Kho Scoreboard",
    "category": "equipment",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Stag",
    "price": 2499,
    "costPrice": 1550,
    "gstPercent": 18,
    "stockQty": 18,
    "reorderLevel": 4,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Foldable Metal Stand with Waterproof Vinyl Number Cards (0-99)",
    "intendedUse": "Scoring Kho Kho match innings, turns, running points, and chaser outs",
    "image": "/images/proshop/kho-kho/kho-kho-scoreboard.svg",
    "shortDescription": "Multi-indicator manual flip scoreboard customized for Kho Kho innings, turns, and points.",
    "description": "Customized tournament scoreboard designed specifically for Kho Kho scoring conventions. Features dedicated flip sections for Inning (1-2), Turn (1-4), Points Scored (0-99), and Out Defenders (0-9).",
    "specifications": {
      "Indicators": "Inning (1-2), Turn (1-4), Points (0-99), Outs (0-9)",
      "Dimensions": "60 cm x 30 cm Foldable Desktop Table Stand",
      "Card Material": "Heavy Tear-Proof PVC Waterproof Plastic Cards",
      "Visibility": "Large 12cm Digits Visible from 50 Meters Across Ground",
      "Portability": "Folds completely flat with carry handles"
    }
  },
  {
    "id": "prod_kk_7",
    "sku": "ACC-FOX-WHS7",
    "name": "Sports Whistle with Lanyard",
    "category": "accessories",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Fox 40",
    "price": 499,
    "costPrice": 260,
    "gstPercent": 18,
    "stockQty": 80,
    "reorderLevel": 20,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Impact Polycarbonate Pealess Whistle with Silicone Mouthgrip and Breakaway Lanyard",
    "intendedUse": "Loud turn calls, Kho touch alerts, and match referee whistles across noisy arenas",
    "image": "/images/proshop/kho-kho/sports-whistle-with-lanyard.svg",
    "shortDescription": "Pealess 115 dB referee whistle with cushioned mouth grip and breakaway neck lanyard.",
    "description": "High-decibel pealess referee whistle. Emits a piercing 115-decibel sound that cuts cleanly through loud crowd noise and screams on the Kho Kho ground without jamming on saliva or dirt.",
    "specifications": {
      "Sound Output": "115 Decibels (High Pitch Triple Chamber Sound)",
      "Design": "Pealess Construction (No moving parts or pea to freeze)",
      "Mouthpiece": "Cushioned Mouth Grip (CMG) Thermoplastic Overmold",
      "Lanyard": "Braided Heavy Nylon Neck Lanyard with Spring Snap Hook",
      "Durability": "100% Waterproof and Shockproof ABS"
    }
  },
  {
    "id": "prod_kk_8",
    "sku": "ACC-CSC-STP8",
    "name": "Digital Sports Stopwatch",
    "category": "accessories",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Cosco",
    "price": 799,
    "costPrice": 450,
    "gstPercent": 18,
    "stockQty": 50,
    "reorderLevel": 12,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Shock-Resistant Sealed ABS Casing with LCD Display and Nylon Neck Cord",
    "intendedUse": "Accurate 9-minute turn countdowns and defender elimination timings",
    "image": "/images/proshop/kho-kho/digital-sports-stopwatch.svg",
    "shortDescription": "Precision 1/100-sec digital timer with 9-minute countdown timer for official Kho Kho turns.",
    "description": "Digital match timer configured for Kho Kho rules. Includes 9-minute turn countdown with alarm beep, split-second defender survival tracking, split lap memory, and calendar clock.",
    "specifications": {
      "Accuracy": "1/100th Second Precision up to 10 Hours",
      "Turn Timer": "Programmable 9-Minute Countdown with End Buzzer",
      "Memory": "Dual Split & Lap Time Recall",
      "Water Resistance": "Splash-Proof and Sweat-Resistant Construction",
      "Battery": "Long-Life CR2032 Lithium Button Cell Included"
    }
  },
  {
    "id": "prod_kk_9",
    "sku": "KHO-TYK-HRD9",
    "name": "Agility Training Hurdles",
    "category": "equipment",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Tyka",
    "price": 1599,
    "costPrice": 960,
    "gstPercent": 18,
    "stockQty": 25,
    "reorderLevel": 6,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Shatterproof Fluorescent PVC Tubing with Anti-Tip Curved Feet",
    "intendedUse": "Fast lateral dodges, pole turn acceleration, and rapid chaser footwork drills",
    "image": "/images/proshop/kho-kho/agility-training-hurdles.svg",
    "shortDescription": "Set of 6 high-visibility step hurdles for explosive chaser footwork and dodge reaction.",
    "description": "Essential conditioning equipment for Kho Kho athletes. Training over low hurdles sharpens foot speed, lateral hurdle hopping, and rapid stride recovery vital for evading diving chasers.",
    "specifications": {
      "Quantity": "Set of 6 Step Hurdles",
      "Height Options": "6-Inch (15 cm) / 9-Inch (22 cm) Step Height",
      "Width": "45 cm Wide Base",
      "Material": "Shatterproof Flexible PVC Tubing",
      "Safety": "Bends flat when stepped on without snapping"
    }
  },
  {
    "id": "prod_kk_10",
    "sku": "APP-SN-BIB10",
    "name": "Kho Kho Team Bibs Set",
    "category": "apparel",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Shiv Naresh",
    "price": 1199,
    "costPrice": 680,
    "gstPercent": 12,
    "stockQty": 30,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Breathable 100% Micro-Mesh Polyester with Reinforced Contrast Binding",
    "intendedUse": "Distinguishing chaser teams from defender batches (batch of 3)",
    "image": "/images/proshop/kho-kho/kho-kho-team-bibs-set.svg",
    "shortDescription": "Pack of 12 fluorescent lightweight training pinnies with large numbers 1 to 12.",
    "description": "High-contrast training scrimmage pinnies. Allows coaches and referees to easily identify defender batches of 3 and tracking chasers. Loose side cut ensures complete freedom during sudden directional pivots.",
    "specifications": {
      "Set Count": "Set of 12 Numbered Bibs (1 through 12)",
      "Fabric": "Quick-Dry Micro-Eyelet Polyester Mesh",
      "Fit": "Generous Athletic Cut with Reinforced Armholes",
      "Color Options": "Fluorescent Lime Green / Neon Orange"
    },
    "variants": [
      {
        "id": "v_bib_grn",
        "color": "Neon Lime Green",
        "stockQty": 18
      },
      {
        "id": "v_bib_org",
        "color": "Electric Orange",
        "stockQty": 12
      }
    ]
  },
  {
    "id": "prod_kk_11",
    "sku": "APP-SN-JRS11",
    "name": "Kho Kho Training Jersey",
    "category": "apparel",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Shiv Naresh",
    "price": 699,
    "costPrice": 380,
    "gstPercent": 12,
    "stockQty": 45,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Quick-Dry 180 GSM Interlock Moisture-Wicking Polyester with Flatlock Seams",
    "intendedUse": "Friction-resistant athletic wear for continuous diving and crawling",
    "image": "/images/proshop/kho-kho/kho-kho-training-jersey.svg",
    "shortDescription": "Durable anti-friction sports jersey designed for high-intensity dives and sudden turns.",
    "description": "Specially constructed for Kho Kho players who frequently dive on clay or turf. Features abrasion-resistant polyester weave and smooth flatlock stitching that prevents chafing and fabric tears during ground slides.",
    "specifications": {
      "Fabric": "180 GSM Interlock Hydrophilic Microfiber",
      "Breathability": "Dual Underarm Air Ventilation Mesh Panels",
      "Seams": "Reinforced Flatlock 4-Needle Seams",
      "Neckline": "Ribbed Crew Collar with Stretch Binding"
    },
    "variants": [
      {
        "id": "v_kk_jrs_s",
        "size": "Small (36 in)",
        "stockQty": 10
      },
      {
        "id": "v_kk_jrs_m",
        "size": "Medium (38 in)",
        "stockQty": 20
      },
      {
        "id": "v_kk_jrs_l",
        "size": "Large (40 in)",
        "stockQty": 15
      }
    ]
  },
  {
    "id": "prod_kk_12",
    "sku": "EQP-VNX-KIT12",
    "name": "Kho Kho Ground Equipment Kit",
    "category": "equipment",
    "sport": "kho_kho",
    "compatibleSports": [
      "kho_kho"
    ],
    "brand": "Vinex",
    "price": 5499,
    "costPrice": 3500,
    "gstPercent": 18,
    "stockQty": 8,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Canvas Duffle containing 8 Corner Flags, Ground Stakes, Rubber Mallet, Measuring Cord and Whistle",
    "intendedUse": "Complete field marshal toolkit for laying out and managing tournament grounds",
    "image": "/images/proshop/kho-kho/kho-kho-ground-equipment-kit.svg",
    "shortDescription": "Comprehensive field setup kit with 8 corner flags, anchoring stakes, mallet, and storage bag.",
    "description": "All-in-one tournament organizers field kit. Includes 8 bright corner flags with steel spring poles, heavy ground stakes, nylon measuring line, rubber mallet, referee whistle, and heavy canvas travel duffle.",
    "specifications": {
      "Flags Included": "8 High-Visibility Fluorescent PVC Corner Flags with Spring Bases",
      "Tools": "Solid Rubber Setting Mallet + 16 Heavy Steel Ground Pins",
      "Measuring": "100m Twisted Ground Guide Cord on Spool Reel",
      "Bag": "Heavy 600D Weather-Resistant Canvas Duffel Bag"
    }
  },
  {
    "id": "prod_hk_1",
    "sku": "HCK-ALF-BGN1",
    "name": "Beginner Field Hockey Stick",
    "category": "bats",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Alfa",
    "price": 1499,
    "costPrice": 920,
    "gstPercent": 12,
    "stockQty": 30,
    "reorderLevel": 6,
    "featured": true,
    "skillLevel": "Beginner",
    "material": "Select Solid Mulberry Wood Reinforced with Laminated Glass-Fiber Roving",
    "intendedUse": "Grass and turf coaching for school and entry-level club hockey",
    "image": "/images/proshop/hockey/beginner-field-hockey-stick.svg",
    "shortDescription": "Traditional mulberry wood field hockey stick with Maxi curved head for easy ball trapping.",
    "description": "Forgiving field hockey stick designed to teach clean trapping, pushing, and slapshot fundamentals. Crafted from select Indian mulberry wood reinforced with fiberglass tape on the curved head face.",
    "specifications": {
      "Material": "100% Seasoned Mulberry Hardwood + Fiberglass Coating",
      "Head Shape": "Maxi Head (Optimal for stopping and sweet-spot ball control)",
      "Bow Type": "Standard Mid Bow (20mm curve at 300mm from heel)",
      "Length Options": "34\", 36\", 36.5\"",
      "Playing Surface": "Natural Grass and Synthetic Sand/Water Turf"
    },
    "variants": [
      {
        "id": "v_hk1_34",
        "size": "34 Inch (Junior)",
        "stockQty": 10
      },
      {
        "id": "v_hk1_36",
        "size": "36.5 Inch (Senior Standard)",
        "stockQty": 20
      }
    ]
  },
  {
    "id": "prod_hk_2",
    "sku": "HCK-FLS-CMP2",
    "name": "Composite Field Hockey Stick",
    "category": "bats",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Flash",
    "price": 6999,
    "costPrice": 4400,
    "gstPercent": 12,
    "stockQty": 15,
    "reorderLevel": 3,
    "featured": true,
    "skillLevel": "Professional",
    "material": "70% Japanese Carbon Fiber, 25% Fiberglass, 5% Kevlar Reinforcement",
    "intendedUse": "High-speed synthetic water turf matches, drag flicking, and 3D aerial dribbling",
    "image": "/images/proshop/hockey/composite-field-hockey-stick.svg",
    "shortDescription": "High-power 70% carbon composite low-bow stick engineered for explosive drag-flicks.",
    "description": "Elite competitive field hockey stick. Incorporates 70% high-modulus Japanese Toray carbon weave for supreme ball propulsion, with Kevlar inserts along the backhand strike zone for vibration dampening.",
    "specifications": {
      "Carbon Ratio": "70% Carbon, 25% Fiberglass, 5% Aramid Kevlar",
      "Bow Profile": "Pro Low Bow (24.75mm curve positioned at 200mm from head)",
      "Head Profile": "Micro Head with Textured Touch-Grip Surface",
      "Weight": "Light (520g - 540g)",
      "Balance Point": "38.5 cm for Ultra-Fast Head Whip"
    },
    "variants": [
      {
        "id": "v_hk2_365",
        "size": "36.5 Inch",
        "stockQty": 10
      },
      {
        "id": "v_hk2_375",
        "size": "37.5 Inch",
        "stockQty": 5
      }
    ]
  },
  {
    "id": "prod_hk_3",
    "sku": "HCK-KOK-MTC3",
    "name": "Field Hockey Match Ball",
    "category": "balls",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Kookaburra",
    "price": 699,
    "costPrice": 410,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Dimpled Seamless PVC Casing around Compressed Solid Cork and Rubber Center",
    "intendedUse": "Official match play on wet and dry synthetic turf pitches",
    "image": "/images/proshop/hockey/field-hockey-match-ball.svg",
    "shortDescription": "FIH-compliant dimpled field hockey match ball for true roll on synthetic turf.",
    "description": "Championship-standard field hockey ball featuring a dimpled exterior golf-style surface. The micro-indentations break water surface tension on synthetic water turfs, maintaining true rolling velocity.",
    "specifications": {
      "Certification": "Meets FIH Official Match Standards",
      "Surface": "Precision Multi-Dimple Pattern for Hydroplaning Control",
      "Core": "Layered Compressed Cork & Rubber Core",
      "Weight": "156g - 163g Regulation Weight",
      "Circumference": "224mm - 235mm Match Specification",
      "Color": "Tournament Fluorescent White"
    }
  },
  {
    "id": "prod_hk_4",
    "sku": "HCK-ALF-TRN4",
    "name": "Field Hockey Training Balls",
    "category": "balls",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Alfa",
    "price": 1399,
    "costPrice": 840,
    "gstPercent": 12,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Solid Smooth High-Durability Hollow PVC Plastic",
    "intendedUse": "Daily shooting drills, penalty corner practice, and goalkeeper deflection training",
    "image": "/images/proshop/hockey/field-hockey-training-balls.svg",
    "shortDescription": "Box of 6 smooth fluorescent training field hockey balls for high-volume practice.",
    "description": "Pack of 6 smooth field hockey balls built to handle thousands of high-impact shots against boards and goalposts without splitting. Bright high-visibility color stands out under evening floodlights.",
    "specifications": {
      "Quantity": "Box of 6 Balls",
      "Surface": "Smooth High-Visibility Gloss Finish",
      "Weight": "158g Match Standard Weight",
      "Material": "Non-Cracking All-Weather Rotomolded PVC",
      "Color": "High-Visibility Electric Yellow"
    }
  },
  {
    "id": "prod_hk_5",
    "sku": "HCK-RK-SHN5",
    "name": "Field Hockey Shin Guards",
    "category": "protective",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Rakshak",
    "price": 1199,
    "costPrice": 720,
    "gstPercent": 12,
    "stockQty": 45,
    "reorderLevel": 10,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Anatomical Polypropylene Hard Shell with Airflow Vents and Dual-Layer EVA Foam",
    "intendedUse": "Shielding shins, ankles, and malleolus bones against stick and ball strikes",
    "image": "/images/proshop/hockey/field-hockey-shin-guards.svg",
    "shortDescription": "Full-wrap anatomical field hockey shin guards with extended ankle bone protection cups.",
    "description": "Heavy-duty shin guards specifically shaped for field hockey impact hazards. The high-rigidity ventilated plastic shield absorbs direct ball strikes up to 120 km/h, while extended foam cuffs cushion the ankles.",
    "specifications": {
      "Shell": "Reinforced Impact-Resistant Polypropylene (PP)",
      "Lining": "12mm Shock-Dispersing Breathable EVA Foam",
      "Ankle Guard": "Integrated Padded Ankle Discs with Elastic Stirrup",
      "Ventilation": "14 Aerodynamic Cooling Slots",
      "Fastening": "Dual Adjustable Elasticated Velcro Straps"
    },
    "variants": [
      {
        "id": "v_shn_s",
        "size": "Small (Under 5 ft 3 in)",
        "stockQty": 15
      },
      {
        "id": "v_shn_m",
        "size": "Medium (5 ft 3 in - 5 ft 9 in)",
        "stockQty": 20
      },
      {
        "id": "v_shn_l",
        "size": "Large (Above 5 ft 9 in)",
        "stockQty": 10
      }
    ]
  },
  {
    "id": "prod_hk_6",
    "sku": "HCK-GRY-GLV6",
    "name": "Field Hockey Gloves",
    "category": "protective",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Grays",
    "price": 999,
    "costPrice": 580,
    "gstPercent": 12,
    "stockQty": 35,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "Intermediate",
    "material": "Molded High-Density Foam with Spandex Mesh and Open Palm Silicone Grip",
    "intendedUse": "Guarding left hand and knuckles against turf friction and stick tackles",
    "image": "/images/proshop/hockey/field-hockey-gloves.svg",
    "shortDescription": "Protective left-hand field hockey glove with molded knuckle armor and open palm.",
    "description": "Designed for field players defending low stick tackles. Features articulated high-density foam padding over the fingers and thumb, with an open-palm silicone pattern for unhindered stick feel.",
    "specifications": {
      "Hand": "Left Hand Glove (Primary Ground Tackling Hand)",
      "Armor": "Segmented High-Density Foam Shields on Fingers & Thumb",
      "Palm": "Open-Palm Design with Textured Silicone Grip Strips",
      "Closure": "Neoprene Wrist Band with Adjustable Velcro Tab"
    },
    "variants": [
      {
        "id": "v_glv_m",
        "size": "Medium",
        "stockQty": 20
      },
      {
        "id": "v_glv_l",
        "size": "Large",
        "stockQty": 15
      }
    ]
  },
  {
    "id": "prod_hk_7",
    "sku": "HCK-SHK-MTH7",
    "name": "Field Hockey Mouthguard",
    "category": "protective",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Shock Doctor",
    "price": 499,
    "costPrice": 260,
    "gstPercent": 12,
    "stockQty": 50,
    "reorderLevel": 12,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Medical Grade Dual-Layer Thermopolymer with Shock-Absorbing Jaw Frame",
    "intendedUse": "Dental and jaw protection against high sticks and deflected balls",
    "image": "/images/proshop/hockey/field-hockey-mouthguard.svg",
    "shortDescription": "Custom boil-and-bite gum shield with dual-layer shock frame and antimicrobial case.",
    "description": "Essential field hockey dental armor. Features a boil-and-bite custom moldable inner gel channel that locks tightly onto upper teeth, distributing jaw impact forces away from incisors.",
    "specifications": {
      "Type": "Boil & Bite Custom Fit Mouthguard",
      "Construction": "Dual-Layer Polymer (Rigid Outer Frame + Gel Interior)",
      "Breathing": "Center Air Flow Channels for Easy Breathing during Sprints",
      "Safety": "BPA, Latex, and Phthalate Free",
      "Case": "Includes Ventilated Antimicrobial Storage Case"
    }
  },
  {
    "id": "prod_hk_8",
    "sku": "HCK-FLS-GRP8",
    "name": "Field Hockey Stick Grip Tape",
    "category": "grips",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Flash",
    "price": 349,
    "costPrice": 180,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Natural Chamois Leather / Microfiber Hydrophilic Fleece",
    "intendedUse": "Overwrapping hockey stick handle for non-slip grip in wet rain or sweat",
    "image": "/images/proshop/hockey/field-hockey-stick-grip-tape.svg",
    "shortDescription": "Absorbent chamois overgrip tape providing slip-free control on wet synthetic turfs.",
    "description": "Chamois grip tape favored by international hockey players. Unlike conventional rubber grips, hydrophilic chamois fabric becomes even tackier when wet, preventing handle twist in heavy sweat or rainy matches.",
    "specifications": {
      "Material": "Premium Synthetic Hydro-Chamois Microfiber",
      "Length": "160 cm x 3.5 cm (Full Handle Wrap)",
      "Performance in Wet": "Increases tackiness and friction when moist",
      "Texture": "Velvety Soft Non-Chafing Surface Feel"
    },
    "variants": [
      {
        "id": "v_grp_chm_ylw",
        "color": "Optic Yellow",
        "stockQty": 35
      },
      {
        "id": "v_grp_chm_blu",
        "color": "Royal Blue",
        "stockQty": 25
      }
    ]
  },
  {
    "id": "prod_hk_9",
    "sku": "HCK-RK-BAG9",
    "name": "Field Hockey Stick Bag",
    "category": "bags",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "Rakshak",
    "price": 1899,
    "costPrice": 1150,
    "gstPercent": 18,
    "stockQty": 22,
    "reorderLevel": 5,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Heavy-Duty 600D Diamond Ripstop Polyester with Waterproof Base",
    "intendedUse": "Transporting up to 4 hockey sticks, shin guards, shoes, and match balls",
    "image": "/images/proshop/hockey/field-hockey-stick-bag.svg",
    "shortDescription": "Multi-compartment hockey kit bag holding up to 4 sticks with ventilated shoe tunnel.",
    "description": "Full-size hockey stick bag with elongated stick pocket holding up to 4 sticks securely. Features a ventilated front tunnel for muddy turf shoes and wet shin guards, plus padded backpack shoulder straps.",
    "specifications": {
      "Capacity": "Holds 3-4 Field Hockey Sticks (up to 38.5\")",
      "Compartments": "Main Stick Bay + Front Gear Pocket + Valuables Zip",
      "Shoe Pocket": "Ventilated Bottom Pocket with Drainage Grommets",
      "Carrying System": "Dual Padded Ergonomic Backpack Straps + Grab Hook",
      "Dimensions": "102 cm x 20 cm x 18 cm"
    }
  },
  {
    "id": "prod_hk_10",
    "sku": "HCK-OBO-LEG10",
    "name": "Hockey Goalkeeper Leg Guards",
    "category": "protective",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "OBO",
    "price": 11999,
    "costPrice": 7900,
    "gstPercent": 18,
    "stockQty": 6,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Ultra-High-Density Closed Cell Polyethylene Foam with Contoured Deflector Wings",
    "intendedUse": "Field hockey goalkeeper penalty corner and open-play shot stopping",
    "image": "/images/proshop/hockey/hockey-goalkeeper-leg-guards.svg",
    "shortDescription": "Dual-density foam goalkeeper legguards with anatomical knee wings for rapid kick rebounds.",
    "description": "Championship-level field hockey goalkeeper legguards. Made from ultra-lightweight closed-cell foam that rebounds high-velocity shots far away from the circle. Pre-shaped anatomical curve allows rapid sliding.",
    "specifications": {
      "Material": "Dual-Density Closed-Cell Nitrogen Blown Foam",
      "Weight": "Extremely Lightweight (approx. 1100g per pair)",
      "Wings": "Extended Lateral Wings for Five-Hole Protection",
      "Straps": "Quick-Release Heavy Webbing Straps with Steel Buckles",
      "Target Sport": "Field Hockey Only (Not Ice Hockey)"
    },
    "variants": [
      {
        "id": "v_gk_leg_m",
        "size": "Medium (User Height 5 ft 3 in - 5 ft 10 in)",
        "stockQty": 4
      },
      {
        "id": "v_gk_leg_l",
        "size": "Large (User Height 5 ft 10 in & Above)",
        "stockQty": 2
      }
    ]
  },
  {
    "id": "prod_hk_11",
    "sku": "HCK-OBO-KCK11",
    "name": "Hockey Goalkeeper Kickers",
    "category": "protective",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "OBO",
    "price": 6499,
    "costPrice": 4200,
    "gstPercent": 18,
    "stockQty": 8,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "High-Rebound Molded Closed Cell Foam with Hard Toe Insert and Under-Shoe Strapping",
    "intendedUse": "Goalkeeper footwear protection and power kicking clearances off penalty corners",
    "image": "/images/proshop/hockey/hockey-goalkeeper-kickers.svg",
    "shortDescription": "High-rebound goalkeeper kickers with flat front face and secure harness straps.",
    "description": "Field hockey goalie kickers designed to strap securely over turf shoes. Features flat front and side faces to ensure accurate directional kicking of low shots out of the danger zone.",
    "specifications": {
      "Material": "High-Rebound Multi-Layer Polyethylene Foam",
      "Design": "Flat Front Profile for Controlled Directional Kicks",
      "Harness": "Adjustable Under-Shoe and Rear Heel Nylon Webbing",
      "Protection": "Dense Foam Wrap over Toes, Instep, and Ankle Sides",
      "Safety": "Tested against 130 km/h slapshots"
    },
    "variants": [
      {
        "id": "v_kck_m",
        "size": "Medium (Shoe UK 6-8.5)",
        "stockQty": 5
      },
      {
        "id": "v_kck_l",
        "size": "Large (Shoe UK 9-11.5)",
        "stockQty": 3
      }
    ]
  },
  {
    "id": "prod_hk_12",
    "sku": "HCK-OBO-HLM12",
    "name": "Hockey Goalkeeper Helmet",
    "category": "protective",
    "sport": "hockey",
    "compatibleSports": [
      "hockey"
    ],
    "brand": "OBO",
    "price": 8499,
    "costPrice": 5600,
    "gstPercent": 18,
    "stockQty": 8,
    "reorderLevel": 2,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "High-Impact ABS Polycarbonate Shell with Carbon Steel Cage Grille and 5-Point Harness",
    "intendedUse": "Full head, facial, and throat protection for field hockey goalkeepers",
    "image": "/images/proshop/hockey/hockey-goalkeeper-helmet.svg",
    "shortDescription": "Full-coverage field hockey goalie mask with high-tensile steel cage and throat flare.",
    "description": "FIH-approved field hockey goalkeeper helmet. Features impact-deflecting angular shell geometry, high-visibility cat-eye steel grille, and adjustable 5-point backplate harness for a snug fit.",
    "specifications": {
      "Shell": "Impact-Resistant Polycarbonate Composite",
      "Grille": "Powder-Coated High-Tensile Carbon Steel Wire Cage",
      "Foam Liner": "Dual-Density Closed Cell Foam with Washable Sweatband",
      "Rear Harness": "5-Point Fully Adjustable Elasticated Straps",
      "Safety Certification": "Compliant with FIH Field Hockey Headgear Regulations"
    },
    "variants": [
      {
        "id": "v_gk_hlm_m",
        "size": "Medium (Head 54-58 cm)",
        "stockQty": 5
      },
      {
        "id": "v_gk_hlm_l",
        "size": "Large (Head 58-62 cm)",
        "stockQty": 3
      }
    ]
  },
  {
    "id": "prod_fb_1",
    "sku": "FTB-NIV-SZ3",
    "name": "Size 3 Football",
    "category": "balls",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 599,
    "costPrice": 350,
    "gstPercent": 12,
    "stockQty": 35,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "Beginner",
    "material": "Machine-Stitched Synthetic TPU Leather with Multi-Layer Polyester Backing",
    "intendedUse": "Grassroots training and soccer drills for junior players aged 8 and under",
    "image": "/images/proshop/football/size-3-football.svg",
    "shortDescription": "Youth size 3 football (300g) with soft-touch panels for young academy players.",
    "description": "Designed specifically for grassroots academies. Lightweight size 3 construction prevents head and foot strain in young children while teaching proper passing technique and first touch control.",
    "specifications": {
      "Size": "Official Size 3 (Circumference 58 - 60 cm)",
      "Weight": "Lightweight 300g - 320g",
      "Construction": "32-Panel Machine Stitched TPU",
      "Bladder": "Reinforced Synthetic Rubber Bladder",
      "Age Group": "Under 8 Years Junior Coaching"
    }
  },
  {
    "id": "prod_fb_2",
    "sku": "FTB-CSC-SZ4",
    "name": "Size 4 Football",
    "category": "balls",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Cosco",
    "price": 749,
    "costPrice": 440,
    "gstPercent": 12,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "Intermediate",
    "material": "Textured PU Outer Skin with High-Rebound EVA Foam Cushion Layer",
    "intendedUse": "Youth football leagues and training for players aged 8 to 12 years",
    "image": "/images/proshop/football/size-4-football.svg",
    "shortDescription": "Youth regulation size 4 football with textured casing for accurate curve and flight.",
    "description": "The standard transition ball for growing youth players. Features abrasion-resistant textured PU leather that handles grass and artificial turf, offering true flight predictability and soft reception.",
    "specifications": {
      "Size": "Official Size 4 (Circumference 63.5 - 66 cm)",
      "Weight": "350g - 390g Youth Regulation",
      "Panels": "32 Panels with Deep Machine-Stitching",
      "Age Group": "Ages 8 to 12 Years Academy League Standard",
      "Recommended Pressure": "6 - 8 PSI (0.4 - 0.6 bar)"
    }
  },
  {
    "id": "prod_fb_3",
    "sku": "FTB-NIV-SZ5",
    "name": "Size 5 Football",
    "category": "balls",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 1299,
    "costPrice": 780,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": true,
    "skillLevel": "Advanced",
    "material": "Micro-Textured PU Synthetic Leather with Thermal Bonding and Butyl Bladder",
    "intendedUse": "Senior 11-a-side and 7-a-side matches, club tournaments, and league play",
    "image": "/images/proshop/football/size-5-football.svg",
    "shortDescription": "Full-size match football with thermally bonded seamless panels for zero water absorption.",
    "description": "Tournament-ready size 5 match football. Thermally bonded seamless technology prevents water uptake on wet turfs, ensuring the ball maintains official 420g weight and true aerodynamics throughout 90 minutes.",
    "specifications": {
      "Size": "FIFA Quality Standard Size 5 (Circumference 68 - 70 cm)",
      "Weight": "420g - 440g Official Match Weight",
      "Technology": "Thermally Bonded Seamless 14-Panel Panel Structure",
      "Bladder": "Taiwanese Butyl Core with Air-Lock Valve",
      "Water Absorption": "Under 1% in heavy rain conditions"
    }
  },
  {
    "id": "prod_fb_4",
    "sku": "FTB-NIV-TRF4",
    "name": "Artificial Turf Football",
    "category": "balls",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 999,
    "costPrice": 600,
    "gstPercent": 12,
    "stockQty": 50,
    "reorderLevel": 12,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Heavy-Duty Anti-Abrasive Grain PU with Reinforced Polyester Liners",
    "intendedUse": "Commercial 5-a-side and 7-a-side synthetic turf pitches and caged turfs",
    "image": "/images/proshop/football/artificial-turf-football.svg",
    "shortDescription": "Reinforced artificial turf football engineered to resist rubber crumb friction and abrasions.",
    "description": "Specially engineered for artificial turf facilities. The thick grain PU skin resists heat and abrasive friction from synthetic grass blades and rubber infill crumb, delivering twice the lifespan of normal balls.",
    "specifications": {
      "Size": "Official Size 5 (68.5 cm circumference)",
      "Cover": "High-Grip Anti-Abrasion Heavy Grain PU",
      "Rebound": "Controlled Low-Bounce Tuning for Tight Turf Spaces",
      "Stitching": "Hand-Stitched with High-Tensile Waxed Polyester Thread",
      "Durability": "Engineered specifically for caged artificial grass"
    }
  },
  {
    "id": "prod_fb_5",
    "sku": "FTB-KIP-GLV5",
    "name": "Football Goalkeeper Gloves",
    "category": "protective",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Kipsta",
    "price": 1599,
    "costPrice": 980,
    "gstPercent": 12,
    "stockQty": 30,
    "reorderLevel": 8,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "3.5mm German Latex Palm with Embossed Latex Backhand and Full Wrist Wrap",
    "intendedUse": "Match goalkeeping, shot-stopping, and punch clearances in dry and wet weather",
    "image": "/images/proshop/football/football-goalkeeper-gloves.svg",
    "shortDescription": "Padded goalkeeper gloves with 3.5mm German latex palm and removable finger spines.",
    "description": "High-grip goalkeeper gloves engineered for shot-stoppers. Features professional 3.5mm German grip latex palm for reliable ball control, negative cut fingers for a snug fit, and removable finger save spines.",
    "specifications": {
      "Palm": "3.5mm German Contact Grip Latex Foam",
      "Cut": "Negative Cut (Internal seams for close ball feel)",
      "Finger Protection": "Removable Polypropylene Finger Spines (4 Fingers)",
      "Wrist Closure": "Elastic Bandage with Full-Wrap Latex Strap",
      "Backhand": "3mm Embossed Latex with Punch Zone Ridges"
    },
    "variants": [
      {
        "id": "v_gk_fb_8",
        "size": "Size 8 (Small/Med)",
        "stockQty": 10
      },
      {
        "id": "v_gk_fb_9",
        "size": "Size 9 (Medium/Large)",
        "stockQty": 12
      },
      {
        "id": "v_gk_fb_10",
        "size": "Size 10 (Large/XL)",
        "stockQty": 8
      }
    ]
  },
  {
    "id": "prod_fb_6",
    "sku": "FTB-NIV-SHN6",
    "name": "Football Shin Guards",
    "category": "protective",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 499,
    "costPrice": 280,
    "gstPercent": 12,
    "stockQty": 55,
    "reorderLevel": 12,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Hard Polypropylene Protective Front Shell with Shock-Absorbing EVA Foam Backing",
    "intendedUse": "Tibia bone protection during slide tackles and contested football challenges",
    "image": "/images/proshop/football/football-shin-guards.svg",
    "shortDescription": "Ergonomic slip-in football shin guards with impact-resistant shell and EVA padding.",
    "description": "Anatomically contoured slip-in shin guards. Provides low-profile tibia shielding without weighing down sprinting wingers or bulky midfields. Perforated back foam vents heat during 90-minute matches.",
    "specifications": {
      "Shell": "High-Impact Resistant Polypropylene Shield",
      "Backing": "5mm Perforated Breathable EVA Foam Cushion",
      "Profile": "Low-Profile Asymmetrical Left/Right Contoured Fit",
      "Ventilation": "Laser Cut Micro Air Holes for Heat Release"
    },
    "variants": [
      {
        "id": "v_fb_shn_s",
        "size": "Small (Height 120-145cm)",
        "stockQty": 15
      },
      {
        "id": "v_fb_shn_m",
        "size": "Medium (Height 145-175cm)",
        "stockQty": 25
      },
      {
        "id": "v_fb_shn_l",
        "size": "Large (Height 175cm+)",
        "stockQty": 15
      }
    ]
  },
  {
    "id": "prod_fb_7",
    "sku": "FTB-KIP-SLV7",
    "name": "Football Shin Guard Sleeves",
    "category": "protective",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Kipsta",
    "price": 349,
    "costPrice": 180,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Breathable Elastane Compression Mesh with Front Guard Slip Pocket",
    "intendedUse": "Securing slip-in shin guards tightly without restrictive adhesive tape",
    "image": "/images/proshop/football/football-shin-guard-sleeves.svg",
    "shortDescription": "Pair of compression calf sleeves with built-in front pocket to hold shin guards.",
    "description": "Elastic compression calf sleeves that lock slip-in shin guards firmly in place. Eliminates the need for uncomfortable sock tape that cuts off circulation, while wicking sweat away from calf muscles.",
    "specifications": {
      "Pack": "Pair of 2 Compression Sleeves",
      "Pocket": "Integrated Seamless Front Pocket for Shin Guards",
      "Material": "85% Breathable Polyester, 15% High-Stretch Elastane",
      "Compression": "Calf Muscle Support to Reduce Fatigue"
    },
    "variants": [
      {
        "id": "v_slv_m",
        "size": "Medium (Calf 30-36 cm)",
        "stockQty": 30
      },
      {
        "id": "v_slv_l",
        "size": "Large (Calf 36-42 cm)",
        "stockQty": 30
      }
    ]
  },
  {
    "id": "prod_fb_8",
    "sku": "SHO-NIV-TRF8",
    "name": "Artificial Turf Football Shoes",
    "category": "shoes",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 2499,
    "costPrice": 1580,
    "gstPercent": 18,
    "stockQty": 35,
    "reorderLevel": 8,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Synthetic Textured Microfiber Upper with Multi-Stud Rubber Outsole and EVA Midsole",
    "intendedUse": "Synthetic turf pitches (cages / 5-a-side / 7-a-side) and 3G/4G artificial grass",
    "image": "/images/proshop/football/artificial-turf-football-shoes.svg",
    "shortDescription": "Multi-studded turf shoes (TF sole) engineered for traction on synthetic artificial grass.",
    "description": "Designed specifically for Indian artificial turf pitches. Features dozens of short, low-profile multi-directional rubber studs that grip 3G/4G grass fibers without catching in rubber infill, protecting knees and ankles.",
    "specifications": {
      "Sole Type": "TF (Turf Ground Multi-Studded High-Traction Rubber)",
      "Upper": "Lightweight Textured Synthetic Microfiber with Toe Stitching",
      "Cushioning": "Die-Cut EVA Midsole for Impact Shock Absorption",
      "Surface Recommendation": "Synthetic Turf, Artificial Grass, Hard Court",
      "Weight": "Approx. 265g (UK Size 8)"
    },
    "variants": [
      {
        "id": "v_trf_7",
        "size": "UK 7 (EUR 41)",
        "stockQty": 8
      },
      {
        "id": "v_trf_8",
        "size": "UK 8 (EUR 42)",
        "stockQty": 12
      },
      {
        "id": "v_trf_9",
        "size": "UK 9 (EUR 43)",
        "stockQty": 10
      },
      {
        "id": "v_trf_10",
        "size": "UK 10 (EUR 44)",
        "stockQty": 5
      }
    ]
  },
  {
    "id": "prod_fb_9",
    "sku": "SHO-NIV-FG9",
    "name": "Firm-Ground Football Boots",
    "category": "shoes",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 2799,
    "costPrice": 1750,
    "gstPercent": 18,
    "stockQty": 25,
    "reorderLevel": 6,
    "featured": true,
    "skillLevel": "Intermediate",
    "material": "Durable PU Synthetic Leather with Molded TPU Stud Soleplate",
    "intendedUse": "Natural grass pitches and dry to firm natural ground outdoor stadiums",
    "image": "/images/proshop/football/firm-ground-football-boots.svg",
    "shortDescription": "Molded firm-ground boots (FG sole) with conical studs for natural grass pitches.",
    "description": "Classic football cleats with molded TPU conical and bladed studs. Provides superior acceleration, deceleration, and rotational pivot release on dry natural grass without slipping.",
    "specifications": {
      "Soleplate": "FG (Firm Ground Molded TPU Plate with 12 Studs)",
      "Stud Configuration": "Bladed Forefoot Studs + Conical Heel Studs",
      "Upper": "Padded Synthetic Leather with Texturized Ball Strike Zone",
      "Recommended Surface": "Natural Grass / Firm Soil Outdoor Grounds",
      "Safety": "Distributes pressure evenly across the plant foot"
    },
    "variants": [
      {
        "id": "v_fg_7",
        "size": "UK 7 (EUR 41)",
        "stockQty": 6
      },
      {
        "id": "v_fg_8",
        "size": "UK 8 (EUR 42)",
        "stockQty": 10
      },
      {
        "id": "v_fg_9",
        "size": "UK 9 (EUR 43)",
        "stockQty": 6
      },
      {
        "id": "v_fg_10",
        "size": "UK 10 (EUR 44)",
        "stockQty": 3
      }
    ]
  },
  {
    "id": "prod_fb_10",
    "sku": "EQP-CSC-NET10",
    "name": "Football Goal Net",
    "category": "equipment",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Cosco",
    "price": 3499,
    "costPrice": 2200,
    "gstPercent": 18,
    "stockQty": 12,
    "reorderLevel": 3,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "4.0mm High-Tenacity Braided Knotless Polypropylene (PP) with UV Stabilizers",
    "intendedUse": "Full-size regulation 11-a-side goalposts (24ft x 8ft) on stadium grounds",
    "image": "/images/proshop/football/football-goal-net.svg",
    "shortDescription": "Pair of full-size 24ft x 8ft x 6ft regulation goal nets with 4mm weather-proof cord.",
    "description": "Championship-standard soccer goal nets. Constructed from 4mm high-tenacity braided polypropylene square mesh with overlocked border cords. Resists heavy monsoon rains, rot, and high-velocity strikes.",
    "specifications": {
      "Dimensions": "24 ft (7.32m) Wide x 8 ft (2.44m) High x 6 ft (1.8m) Depth",
      "Mesh Size": "120 mm Hexagonal / Square Knotless Braided Mesh",
      "Cord Diameter": "4.0 mm Heavy-Duty Weather-Proof Twine",
      "Quantity": "Pair of 2 Complete Goal Nets",
      "Fastening": "Includes 50 Net Ties and Lacing Cord"
    }
  },
  {
    "id": "prod_fb_11",
    "sku": "APP-NIV-BIB11",
    "name": "Football Training Bibs Set",
    "category": "apparel",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 1399,
    "costPrice": 820,
    "gstPercent": 12,
    "stockQty": 35,
    "reorderLevel": 8,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "100% Breathable Micro-Mesh Polyester with Reinforced Arm and Neck Openings",
    "intendedUse": "Dividing squads in 5v5, 7v7, and 11v11 tactical training drills",
    "image": "/images/proshop/football/football-training-bibs-set.svg",
    "shortDescription": "Set of 10 fluorescent team scrimmage bibs with quick-drying breathable mesh.",
    "description": "Essential equipment for training sessions. Breathable fluorescent bibs slip over match jerseys. Reinforced stitching along the neck and armholes withstands shirt tugging and slide tackles.",
    "specifications": {
      "Pack Size": "Pack of 10 Bibs of Single Color",
      "Fabric": "130 GSM Lightweight Micro-Eyelet Polyester",
      "Cut": "Generous Loose Silhouette for Full Running Freedom",
      "Color Options": "Fluorescent Neon Green / Solar Orange / Electric Blue"
    },
    "variants": [
      {
        "id": "v_fbib_grn",
        "color": "Fluorescent Green",
        "stockQty": 18
      },
      {
        "id": "v_fbib_org",
        "color": "Solar Orange",
        "stockQty": 17
      }
    ]
  },
  {
    "id": "prod_fb_12",
    "sku": "ACC-NIV-PMP12",
    "name": "Football Ball Pump with Needle",
    "category": "accessories",
    "sport": "football",
    "compatibleSports": [
      "football"
    ],
    "brand": "Nivia",
    "price": 349,
    "costPrice": 180,
    "gstPercent": 18,
    "stockQty": 75,
    "reorderLevel": 20,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Impact Dual-Action Plastic Cylinder with Flexible Extension Hose and Brass Pins",
    "intendedUse": "Inflating footballs, volleyballs, and basketballs with continuous push-pull action",
    "image": "/images/proshop/football/football-ball-pump-with-needle.svg",
    "shortDescription": "Dual-action continuous hand air pump with flexible hose and 3 stainless steel needles.",
    "description": "Double-action hand pump that delivers continuous air on both the push and pull strokes, inflating balls in half the time. Includes a flexible extension tube that prevents needle breakage in the valve.",
    "specifications": {
      "Action": "Dual Action (Pumps air on both forward push and backward pull)",
      "Accessories": "Includes Flexible Rubber Hose + 3 Stainless Steel Inflation Needles",
      "Needle Thread": "Standard 5/16\" Brass Thread",
      "Storage": "Integrated Needle Clip on Pump Body",
      "Length": "22 cm Compact Travel Size"
    }
  },
  {
    "id": "prod_kbd_1",
    "sku": "KBD-PRK-MAT1",
    "name": "Kabaddi Training Mat",
    "category": "equipment",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Pro Kabaddi Official",
    "price": 3999,
    "costPrice": 2600,
    "gstPercent": 18,
    "stockQty": 20,
    "reorderLevel": 4,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "High-Density 35mm Interlocking Cross-Linked EVA Foam with Tatami Anti-Slip Texture",
    "intendedUse": "Shock-absorbing indoor practice area for raids, ankle tackles, and heavy landings",
    "image": "/images/proshop/kabaddi/kabaddi-training-mat.svg",
    "shortDescription": "High-density 35mm interlocking EVA foam mat tile with anti-slip tatami texture.",
    "description": "Championship-standard interlocking kabaddi training mat tile. 35mm thick dual-layer EVA foam absorbs extreme impacts from diving raiders, while the non-abrasive tatami embossed surface prevents mat burns.",
    "specifications": {
      "Dimensions": "1 Meter x 1 Meter Interlocking Tile (With 4 Edge Strips)",
      "Thickness": "35 mm Heavy Shock Absorption (110 kg/m³ density)",
      "Surface Pattern": "Anti-Skid Tatami Weave Grip Texture",
      "Reversible": "Dual-Color Reversible (Blue on one side, Red on reverse)",
      "Safety": "Shock absorption tested to minimize joint injury during body slams"
    }
  },
  {
    "id": "prod_kbd_2",
    "sku": "KBD-PRK-TAP2",
    "name": "Kabaddi Mat Boundary Tape",
    "category": "equipment",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Pro Kabaddi Official",
    "price": 699,
    "costPrice": 420,
    "gstPercent": 18,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Heavy-Duty Cloth-Backed Adhesive Vinyl with High-Tensile Rubber Adhesive",
    "intendedUse": "Marking the baulk line, bonus line, court boundaries, and lobby on kabaddi mats",
    "image": "/images/proshop/kabaddi/kabaddi-mat-boundary-tape.svg",
    "shortDescription": "50mm cloth-backed adhesive boundary tape for Baulk, Bonus, and Mid-line court marking.",
    "description": "Specialized mat marking tape with heavy cloth backing. Adheres securely to textured EVA foam mats without peeling during drag tackles, and removes cleanly without leaving gummy adhesive residue.",
    "specifications": {
      "Width": "50 mm (2 inches) Regulation Line Width",
      "Length": "50-Meter Heavy-Duty Roll",
      "Backing": "High-Density Woven Cotton-Cloth Reinforced Vinyl",
      "Adhesion": "Residue-Free Clean Peel Formula Safe for EVA Mats",
      "Colors": "High-Contrast White / Yellow"
    },
    "variants": [
      {
        "id": "v_ktap_w",
        "color": "Matte White",
        "stockQty": 25
      },
      {
        "id": "v_ktap_y",
        "color": "Tournament Yellow",
        "stockQty": 15
      }
    ]
  },
  {
    "id": "prod_kbd_3",
    "sku": "PRT-NIV-KBD3",
    "name": "Kabaddi Knee Pads",
    "category": "protective",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Nivia",
    "price": 899,
    "costPrice": 520,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "25mm Dual-Density EVA/PU Cushion with Neoprene Sleeve and Silicone Friction Rings",
    "intendedUse": "Patella cushioning and friction burn defense during ankle catches and dashes",
    "image": "/images/proshop/kabaddi/kabaddi-knee-pads.svg",
    "shortDescription": "Thick 25mm padded knee protection sleeves engineered for high-impact kabaddi tackles.",
    "description": "Kabaddi-specific protective knee sleeves. Molded dual-density foam wraps around the patella and shin to absorb bone-jarring contact when diving to trap raiders or escaping ankle holds.",
    "specifications": {
      "Padding": "25mm Contoured High-Density Foam Sandwich",
      "Sleeve": "Heavy Compression Elasticated Poly-Spandex Sleeve",
      "Grip": "Internal Wave Silicone Grippers Prevent Sliding Down",
      "Protection": "Shields patella, surrounding ligaments, and upper tibia",
      "Pack": "Sold as a Pair (2 Knee Sleeves)"
    },
    "variants": [
      {
        "id": "v_kkne_m",
        "size": "Medium (Thigh 36-42 cm)",
        "stockQty": 30
      },
      {
        "id": "v_kkne_l",
        "size": "Large (Thigh 42-48 cm)",
        "stockQty": 30
      }
    ]
  },
  {
    "id": "prod_kbd_4",
    "sku": "PRT-TYK-ANK4",
    "name": "Kabaddi Ankle Support",
    "category": "protective",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Tyka",
    "price": 549,
    "costPrice": 320,
    "gstPercent": 12,
    "stockQty": 55,
    "reorderLevel": 12,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Dual-Layer Interlocking Elastic Compression Band with Open Heel and Ankle Stabilizer",
    "intendedUse": "Stabilizing ankle joint against twisting during sudden toe touches and corner thrusts",
    "image": "/images/proshop/kabaddi/kabaddi-ankle-support.svg",
    "shortDescription": "Compression ankle sleeve with cross-tension strapping for sudden directional cuts.",
    "description": "Provides targeted compressive reinforcement to the talofibular ligaments. Allows full barefoot mat flexion while providing crucial joint stability when pivoting or evading defender chains.",
    "specifications": {
      "Design": "Open-Heel and Open-Toe Barefoot Mat Compatible Fit",
      "Support": "Cross-Weave Elastic Compression Straps",
      "Fabric": "Breathable Sweat-Wicking Nylon Elastane Knit",
      "Pack": "Sold as a Pair (2 Supports)"
    },
    "variants": [
      {
        "id": "v_kank_m",
        "size": "Medium (Men Shoe 6-8)",
        "stockQty": 28
      },
      {
        "id": "v_kank_l",
        "size": "Large (Men Shoe 9-11)",
        "stockQty": 27
      }
    ]
  },
  {
    "id": "prod_kbd_5",
    "sku": "PRT-NIV-ELB5",
    "name": "Kabaddi Elbow Pads",
    "category": "protective",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Nivia",
    "price": 649,
    "costPrice": 380,
    "gstPercent": 12,
    "stockQty": 45,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Molded Contoured Foam with High-Elasticity Breathable Knit Sleeve",
    "intendedUse": "Elbow tip and olecranon shielding against floor impact during diving raids",
    "image": "/images/proshop/kabaddi/kabaddi-elbow-pads.svg",
    "shortDescription": "Padded elbow guards with contoured foam shield against mat abrasion and impacts.",
    "description": "Protects the elbow joint against friction burns and bruises when defenders fall backward or raiders reach out for the midline. The snug compressive sleeve keeps pads firmly seated.",
    "specifications": {
      "Padding": "18mm Anatomical Contoured Foam",
      "Fit": "Snug Elastic Sleeve with Ribbed Edge Cuffs",
      "Target Protection": "Olecranon, Elbow Joint, and Tricep Tendon",
      "Pack": "Sold as a Pair (2 Pads)"
    },
    "variants": [
      {
        "id": "v_kelb_m",
        "size": "Medium (Bicep 26-32 cm)",
        "stockQty": 25
      },
      {
        "id": "v_kelb_l",
        "size": "Large (Bicep 32-38 cm)",
        "stockQty": 20
      }
    ]
  },
  {
    "id": "prod_kbd_6",
    "sku": "PRT-TYK-WRS6",
    "name": "Kabaddi Wrist Support",
    "category": "protective",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Tyka",
    "price": 349,
    "costPrice": 190,
    "gstPercent": 12,
    "stockQty": 60,
    "reorderLevel": 15,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Neoprene with Reinforced Thumb Loop and Dual Adjustable Hook-and-Loop Tension Straps",
    "intendedUse": "Reinforcing wrist tendons and resisting hand twisting during raider escapes",
    "image": "/images/proshop/kabaddi/kabaddi-wrist-support.svg",
    "shortDescription": "Adjustable neoprene wrist brace with thumb loop for raider wrist reinforcement.",
    "description": "Wraps securely around the wrist with an anchoring thumb loop. Restricts painful hyperextension when defenders pull raiders by the wrists, allowing players to pull their arm back across the midline.",
    "specifications": {
      "Thumb Anchor": "Reinforced Ergonomic Thumb Loop",
      "Closure": "Dual Overlapping Heavy-Duty Velcro Straps",
      "Material": "3mm Heat-Retaining Supportive Neoprene",
      "Fit": "One Size Fits All (Adjustable Tension on Left or Right Hand)"
    }
  },
  {
    "id": "prod_kbd_7",
    "sku": "ACC-NIV-TAP7",
    "name": "Kabaddi Sports Tape",
    "category": "accessories",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Nivia",
    "price": 499,
    "costPrice": 280,
    "gstPercent": 18,
    "stockQty": 70,
    "reorderLevel": 20,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Rigid 100% Bleached Cotton Fabric with Medical-Grade Zinc Oxide Adhesive",
    "intendedUse": "Joint immobilization, finger buddy taping, and ankle support strapping",
    "image": "/images/proshop/kabaddi/kabaddi-sports-tape.svg",
    "shortDescription": "Pack of 4 rolls rigid zinc oxide 100% cotton athletic tape with serrated tear edges.",
    "description": "Essential strapping tape for competitive kabaddi players. High tensile strength zinc oxide adhesive resists heavy sweat and intense grappling, providing rigid support for fingers, thumbs, and wrists.",
    "specifications": {
      "Quantity": "Pack of 4 Rolls",
      "Dimensions": "3.8 cm (1.5 inches) Width x 10 Meters per Roll",
      "Tape Type": "Non-Elastic Rigid Zinc Oxide Adhesive Strapping",
      "Edge": "Serrated Zig-Zag Edge for Easy Clean Hand Tearing without Scissors",
      "Skin Friendly": "Breathable, Hypoallergenic, and Latex-Free"
    }
  },
  {
    "id": "prod_kbd_8",
    "sku": "APP-SN-KJR8",
    "name": "Kabaddi Training Jersey",
    "category": "apparel",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Shiv Naresh",
    "price": 799,
    "costPrice": 460,
    "gstPercent": 12,
    "stockQty": 40,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "Heavy-Duty 240 GSM Tear-Resistant Poly-Spandex with Anti-Rip Stitching",
    "intendedUse": "High-intensity kabaddi practice resisting defender pulling and grabbing",
    "image": "/images/proshop/kabaddi/kabaddi-training-jersey.svg",
    "shortDescription": "Heavy-duty tear-resistant 240 GSM stretch training jersey with reinforced collar.",
    "description": "Engineered specifically for the intense pulling and tugging of kabaddi defenders. Made from high-density 240 GSM stretch poly-spandex that holds its shape and refuses to rip when grabbed during raids.",
    "specifications": {
      "Fabric Weight": "Heavy-Duty 240 GSM Anti-Tear Interlock Stretch Fabric",
      "Seam Strength": "Triple-Stitched Reinforced Collar and Armholes",
      "Fit": "Athletic Contoured Fit (Minimizes defender grabbing surface)",
      "Moisture Management": "Quick-Drying Breathable Yarn"
    },
    "variants": [
      {
        "id": "v_kjrs_s",
        "size": "Small (Chest 36\")",
        "stockQty": 10
      },
      {
        "id": "v_kjrs_m",
        "size": "Medium (Chest 38\")",
        "stockQty": 18
      },
      {
        "id": "v_kjrs_l",
        "size": "Large (Chest 40\")",
        "stockQty": 12
      }
    ]
  },
  {
    "id": "prod_kbd_9",
    "sku": "APP-SN-SHT9",
    "name": "Kabaddi Match Shorts",
    "category": "apparel",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Shiv Naresh",
    "price": 649,
    "costPrice": 380,
    "gstPercent": 12,
    "stockQty": 45,
    "reorderLevel": 10,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "4-Way Stretch Hydrophobic Polyester with Reinforced Gusset and Elastic Drawstring",
    "intendedUse": "Match apparel allowing unrestricted leg kicks, squats, and acrobatic jumps",
    "image": "/images/proshop/kabaddi/kabaddi-match-shorts.svg",
    "shortDescription": "High-cut 4-way stretch kabaddi match shorts with reinforced diamond crotch gusset.",
    "description": "Designed specifically for kabaddi leg mobility. Higher cut inseam and flexible diamond crotch gusset ensure zero resistance during deep defensive squats, high frog jumps, and split leg catches.",
    "specifications": {
      "Fabric": "92% Polyester, 8% Spandex 4-Way Stretch Weave",
      "Crotch Design": "Reinforced Diamond Mobility Gusset",
      "Waistband": "Wide 50mm Ribbed Elastic with Internal Tubular Drawstring",
      "Side Slits": "Reinforced 4cm Side Slits for Unhindered Leg Extensions"
    },
    "variants": [
      {
        "id": "v_ksht_m",
        "size": "Medium (Waist 30-32\")",
        "stockQty": 22
      },
      {
        "id": "v_ksht_l",
        "size": "Large (Waist 32-34\")",
        "stockQty": 23
      }
    ]
  },
  {
    "id": "prod_kbd_10",
    "sku": "APP-TYK-BIB10",
    "name": "Kabaddi Team Bibs Set",
    "category": "apparel",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Tyka",
    "price": 1199,
    "costPrice": 690,
    "gstPercent": 12,
    "stockQty": 28,
    "reorderLevel": 6,
    "featured": false,
    "skillLevel": "All Levels",
    "material": "High-Strength Polyester Mesh with Double-Reinforced Neck and Hem Seams",
    "intendedUse": "Scoring and identifying raiders and defensive court units in practice matches",
    "image": "/images/proshop/kabaddi/kabaddi-team-bibs-set.svg",
    "shortDescription": "Pack of 10 heavy-mesh scrimmage bibs with bold numbered fronts and backs (1-10).",
    "description": "High-contrast training scrimmage pinnies built with reinforced stitching to withstand aggressive grappling. Clearly numbered 1 through 10 on both chest and back for referee tracking.",
    "specifications": {
      "Pack Size": "Set of 10 Numbered Bibs (1 through 10)",
      "Fabric": "Heavy-Duty 150 GSM Tear-Resistant Mesh",
      "Printing": "Fade-Proof Sublimated Black Numbers Front and Back",
      "Color Options": "Bright Golden Yellow / Crimson Red"
    },
    "variants": [
      {
        "id": "v_kbib_ylw",
        "color": "Golden Yellow",
        "stockQty": 15
      },
      {
        "id": "v_kbib_red",
        "color": "Crimson Red",
        "stockQty": 13
      }
    ]
  },
  {
    "id": "prod_kbd_11",
    "sku": "APP-PRK-SCK11",
    "name": "Kabaddi Grip Socks",
    "category": "apparel",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Pro Kabaddi Official",
    "price": 399,
    "costPrice": 220,
    "gstPercent": 12,
    "stockQty": 75,
    "reorderLevel": 20,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Combed Cotton Knit with Hexagonal Silicone Traction Pad Sole",
    "intendedUse": "Non-slip traction on indoor synthetic kabaddi mats and turf training floors",
    "image": "/images/proshop/kabaddi/kabaddi-grip-socks.svg",
    "shortDescription": "Anti-slip silicone grip socks with arch compression for explosive mat traction.",
    "description": "High-grip athletic socks for indoor kabaddi mats. Dense silicone grip cushions on the bottom sole lock onto EVA mats, preventing slipping during rapid footwork while keeping feet clean.",
    "specifications": {
      "Grip Technology": "High-Density Non-Skid Hexagonal Silicone Grip Elements",
      "Fabric": "80% Combed Cotton, 15% Polyester, 5% Spandex Elastic",
      "Arch Band": "Mid-Foot Arch Elastic Compression Band for Snug Lock",
      "Cushioning": "Padded Terry Cotton Heel and Toe Protection"
    },
    "variants": [
      {
        "id": "v_sck_m",
        "size": "Medium (Shoe UK 6-8)",
        "stockQty": 40
      },
      {
        "id": "v_sck_l",
        "size": "Large (Shoe UK 9-11)",
        "stockQty": 35
      }
    ]
  },
  {
    "id": "prod_kbd_12",
    "sku": "EQP-PRK-KIT12",
    "name": "Kabaddi Training Equipment Kit",
    "category": "equipment",
    "sport": "kabaddi",
    "compatibleSports": [
      "kabaddi"
    ],
    "brand": "Pro Kabaddi Official",
    "price": 4499,
    "costPrice": 2850,
    "gstPercent": 18,
    "stockQty": 12,
    "reorderLevel": 3,
    "featured": true,
    "skillLevel": "All Levels",
    "material": "Heavy Duffle Bag with 2 Tape Rolls, 4 Knee Sleeves, 2 Ankle Supports, Stopwatch, and Ice Bags",
    "intendedUse": "Complete team practice kit for marking court boundaries and immediate joint protection",
    "image": "/images/proshop/kabaddi/kabaddi-training-equipment-kit.svg",
    "shortDescription": "Dedicated kabaddi training duffle containing mat tapes, knee sleeves, supports, and timer.",
    "description": "Complete team kit for kabaddi coaches and club organizers. Contains 2 rolls of 50m mat boundary tape, 4 pairs of heavy-duty knee pads, 2 pairs of ankle supports, digital countdown stopwatch, ice packs, and sports strapping tape.",
    "specifications": {
      "Kit Contents": "2x Mat Boundary Tape, 4x Knee Pad Pairs, 2x Ankle Supports, 2x Sports Tape, 1x Digital Stopwatch, 2x Reusable Cold Packs",
      "Bag": "Heavy 800D Water-Resistant Barrel Duffle with Shoulder Strap",
      "Utility": "Supports training squad of 14 players"
    }
  }
];
