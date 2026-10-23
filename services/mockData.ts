
import { Property } from '../types';

export const MOCK_PROPERTIES: Property[] = [
  // --- RIYADH VILLAS ---
  {
    id: "RYD-V-001",
    title: "Modern Designer Villa in Al Nakheel",
    titleAr: "فيلا مودرن بتصميم عالمي في النخيل",
    price: 6500000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Nakheel",
    districtAr: "حي النخيل",
    beds: 5,
    baths: 7,
    area: 600,
    highlights: ["Smart Home", "Elevator", "Overflow Pool", "Corner Plot"],
    highlightsAr: ["نظام ذكي", "مصعد", "مسبح طفح", "موقع زاوية"],
    images: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-002",
    title: "Classic Mansion in Hittin",
    titleAr: "قصر كلاسيكي فاخر في حطين",
    price: 12000000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Hittin",
    districtAr: "حي حطين",
    beds: 7,
    baths: 9,
    area: 1200,
    highlights: ["Marble Floors", "Home Cinema", "Guest House", "Large Garden"],
    highlightsAr: ["أرضيات رخام", "سينما منزلية", "ملحق ضيوف", "حديقة واسعة"],
    images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-003",
    title: "Contemporary Villa Al Malqa",
    titleAr: "فيلا معاصرة في الملقا",
    price: 4200000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Malqa",
    districtAr: "حي الملقا",
    beds: 4,
    baths: 5,
    area: 375,
    highlights: ["Double Height Ceiling", "Driver Room", "Close to KAFD"],
    highlightsAr: ["سقف دبل هايت", "غرفة سائق", "قريبة من المركز المالي"],
    images: [
        "https://images.unsplash.com/photo-1600596542815-22b5d7200ba6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-004",
    title: "Brand New Villa Al Narjis",
    titleAr: "فيلا جديدة (مودرن) في النرجس",
    price: 3100000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Narjis",
    districtAr: "حي النرجس",
    beds: 4,
    baths: 5,
    area: 300,
    highlights: ["Rooftop Terrace", "Maid Room", "Warranty Included"],
    highlightsAr: ["سطح وتراس", "غرفة خادمة", "ضمانات شاملة"],
    images: [
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-005",
    title: "Restored Villa Al Olaya",
    titleAr: "فيلا مجددة بالكامل في العليا",
    price: 2800000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Olaya",
    districtAr: "حي العليا",
    beds: 5,
    baths: 4,
    area: 500,
    highlights: ["Prime Location", "Large Lot", "Renovated 2023"],
    highlightsAr: ["موقع مميز", "أرض واسعة", "تجديد 2023"],
    images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // --- RIYADH APARTMENTS ---
  {
    id: "RYD-A-001",
    title: "Luxury Apt in KAFD",
    titleAr: "شقة فاخرة في المركز المالي",
    price: 180000,
    listingType: "Rent",
    type: "Apartment",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Aqiq",
    districtAr: "حي العقيق",
    beds: 2,
    baths: 2,
    area: 135,
    highlights: ["KAFD View", "Gym & Pool", "Valet Parking"],
    highlightsAr: ["إطلالة على المركز المالي", "نادي ومسبح", "خدمة صف السيارات"],
    images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-A-002",
    title: "Majdoul Tower Apartment",
    titleAr: "شقة في برج مجدول",
    price: 3500000,
    listingType: "Buy",
    type: "Apartment",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Olaya",
    districtAr: "حي العليا",
    beds: 3,
    baths: 4,
    area: 210,
    highlights: ["High Floor", "Panoramic View", "Smart AC"],
    highlightsAr: ["طابق مرتفع", "إطلالة بانورامية", "تكييف ذكي"],
    images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-A-003",
    title: "Al Majdiyah Residence Al Malqa",
    titleAr: "شقة الماجدية ريزيدنس الملقا",
    price: 85000,
    listingType: "Rent",
    type: "Apartment",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Malqa",
    districtAr: "حي الملقا",
    beds: 3,
    baths: 3,
    area: 145,
    highlights: ["Smart Entry", "Private Parking", "Integrated Kitchen"],
    highlightsAr: ["دخول ذكي", "موقف خاص", "مطبخ راكب"],
    images: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-A-004",
    title: "Cozy Studio in As Sulimaniyah",
    titleAr: "ستوديو أنيق في السليمانية",
    price: 45000,
    listingType: "Rent",
    type: "Apartment",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "As Sulimaniyah",
    districtAr: "حي السليمانية",
    beds: 1,
    baths: 1,
    area: 55,
    highlights: ["Fully Furnished", "Inclusive Bills", "Near Tahlia St"],
    highlightsAr: ["مؤثث بالكامل", "شامل الفواتير", "قريب من التحلية"],
    images: [
        "https://images.unsplash.com/photo-1522771753035-1a5b65d9fbed?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-A-005",
    title: "Family Apartment Qurtubah",
    titleAr: "شقة عائلية في قرطبة",
    price: 1100000,
    listingType: "Buy",
    type: "Apartment",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Qurtubah",
    districtAr: "حي قرطبة",
    beds: 3,
    baths: 3,
    area: 165,
    highlights: ["Compound Living", "Kids Area", "24/7 Security"],
    highlightsAr: ["سكن مجمع", "منطقة ألعاب", "أمن 24/7"],
    images: [
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // --- JEDDAH ---
  {
    id: "JED-V-001",
    title: "Beachfront Villa Obhur",
    titleAr: "فيلا شاطئية في أبحر الشمالية",
    price: 5800000,
    listingType: "Buy",
    type: "Villa",
    city: "Jeddah",
    cityAr: "جدة",
    district: "Obhur Al Shamaliyah",
    districtAr: "أبحر الشمالية",
    beds: 5,
    baths: 6,
    area: 550,
    highlights: ["Private Beach Access", "Jetty", "Pool"],
    highlightsAr: ["شاطئ خاص", "مرسى", "مسبح"],
    images: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "JED-A-001",
    title: "Sea View Apt Al Shati",
    titleAr: "شقة بإطلالة بحرية في الشاطئ",
    price: 2600000,
    listingType: "Buy",
    type: "Apartment",
    city: "Jeddah",
    cityAr: "جدة",
    district: "Al Shati",
    districtAr: "حي الشاطئ",
    beds: 3,
    baths: 3,
    area: 190,
    highlights: ["F1 Track View", "Balcony", "High-end Finishes"],
    highlightsAr: ["إطلالة على الفورمولا", "بلكونة", "تشطيب فاخر"],
    images: [
        "https://images.unsplash.com/photo-1512918760530-772752699e9b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "JED-A-002",
    title: "Luxury Penthouse Al Hamra",
    titleAr: "بنتهاوس فاخر في الحمراء",
    price: 150000,
    listingType: "Rent",
    type: "Apartment",
    city: "Jeddah",
    cityAr: "جدة",
    district: "Al Hamra",
    districtAr: "حي الحمراء",
    beds: 4,
    baths: 4,
    area: 280,
    highlights: ["Fountain View", "Maid Room", "Terrace"],
    highlightsAr: ["إطلالة النافورة", "غرفة خادمة", "تراس"],
    images: [
        "https://images.unsplash.com/photo-1502005229766-939cb6a505e4?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "JED-V-002",
    title: "Modern Duplex Al Rawdah",
    titleAr: "دوبلكس مودرن في الروضة",
    price: 3200000,
    listingType: "Buy",
    type: "Villa",
    city: "Jeddah",
    cityAr: "جدة",
    district: "Al Rawdah",
    districtAr: "حي الروضة",
    beds: 4,
    baths: 4,
    area: 320,
    highlights: ["Central Location", "Small Garden", "Garage"],
    highlightsAr: ["موقع مركزي", "حديقة صغيرة", "كراج"],
    images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // --- KHOBAR / DAMMAM ---
  {
    id: "KHO-A-001",
    title: "Seaside Apt Al Khobar",
    titleAr: "شقة بحرية في الخبر",
    price: 90000,
    listingType: "Rent",
    type: "Apartment",
    city: "Khobar",
    cityAr: "الخبر",
    district: "Al Corniche",
    districtAr: "الكورنيش",
    beds: 2,
    baths: 2,
    area: 120,
    highlights: ["Sea View", "Walking Distance to Sea", "Furnished"],
    highlightsAr: ["إطلالة بحر", "مشيا للكورنيش", "مؤثثة"],
    images: [
        "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "KHO-V-001",
    title: "Villa in Al Rakah",
    titleAr: "فيلا في الراكة الجنوبية",
    price: 2400000,
    listingType: "Buy",
    type: "Villa",
    city: "Khobar",
    cityAr: "الخبر",
    district: "Al Rakah Al Janubiyah",
    districtAr: "الراكة الجنوبية",
    beds: 5,
    baths: 5,
    area: 450,
    highlights: ["Quiet Area", "Spacious Majlis", "Near Schools"],
    highlightsAr: ["حي هادئ", "مجلس واسع", "قريبة من المدارس"],
    images: [
        "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  
  // --- LAND ---
  {
    id: "RYD-L-001",
    title: "Commercial Land King Fahd Rd",
    titleAr: "أرض تجارية طريق الملك فهد",
    price: 45000000,
    listingType: "Buy",
    type: "Land",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Olaya",
    districtAr: "حي العليا",
    area: 1200,
    highlights: ["High Density", "Corner", "Permit 20 Floors"],
    highlightsAr: ["كثافة عالية", "زاوية", "تصريح 20 دور"],
    images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-L-002",
    title: "Residential Plot Al Qirawan",
    titleAr: "قطعة سكنية في القيروان",
    price: 3800000,
    listingType: "Buy",
    type: "Land",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Qirawan",
    districtAr: "حي القيروان",
    area: 600,
    highlights: ["Ready for Construction", "Utilities Available", "North Facing"],
    highlightsAr: ["جاهزة للبناء", "خدمات متوفرة", "واجهة شمالية"],
    images: [
        "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "KHO-L-001",
    title: "Seafront Land Half Moon",
    titleAr: "أرض شاطئية في نصف القمر",
    price: 1500000,
    listingType: "Buy",
    type: "Land",
    city: "Khobar",
    cityAr: "الخبر",
    district: "Half Moon Bay",
    districtAr: "شاطئ نصف القمر",
    area: 800,
    highlights: ["Resort Zoning", "Direct Beach", "Investment Opportunity"],
    highlightsAr: ["تصريح منتجع", "شاطئ مباشر", "فرصة استثمارية"],
    images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // --- OFFICES ---
  {
    id: "RYD-O-001",
    title: "Premium Office Olaya Towers",
    titleAr: "مكتب بريميوم أبراج العليا",
    price: 250000,
    listingType: "Rent",
    type: "Office",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Olaya",
    districtAr: "حي العليا",
    area: 180,
    highlights: ["Fitted", "Meeting Rooms", "City View"],
    highlightsAr: ["مؤثث", "غرف اجتماعات", "إطلالة مدينة"],
    images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-O-002",
    title: "Start-up Hub Office",
    titleAr: "مكتب للشركات الناشئة",
    price: 45000,
    listingType: "Rent",
    type: "Office",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Malqa",
    districtAr: "حي الملقا",
    area: 60,
    highlights: ["Shared Amenities", "Internet Included", "Coffee Shop"],
    highlightsAr: ["مرافق مشتركة", "انترنت شامل", "كوفي شوب"],
    images: [
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "JED-O-001",
    title: "Jeddah Business Park Office",
    titleAr: "مكتب مجمع جدة للأعمال",
    price: 110000,
    listingType: "Rent",
    type: "Office",
    city: "Jeddah",
    cityAr: "جدة",
    district: "Al Rawdah",
    districtAr: "حي الروضة",
    area: 120,
    highlights: ["Shell & Core", "Parking", "Security"],
    highlightsAr: ["بدون تشطيب", "مواقف", "أمن"],
    images: [
        "https://images.unsplash.com/photo-1504384308090-c54be3852f33?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // --- TOWNHOUSES & MORE ---
  {
    id: "RYD-T-001",
    title: "Sedra Community Townhouse",
    titleAr: "تاون هاوس في سدرة (روشن)",
    price: 1850000,
    listingType: "Buy",
    type: "Townhouse",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Qurtubah",
    districtAr: "قرطبة (سدرة)",
    beds: 3,
    baths: 4,
    area: 250,
    highlights: ["Walkable Community", "Parks", "Modern Style"],
    highlightsAr: ["مجتمع مشاة", "حدائق", "طراز حديث"],
    images: [
        "https://images.unsplash.com/photo-1600596542815-22b5d7200ba6?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-T-002",
    title: "Luxury Townhouse Hittin",
    titleAr: "تاون هاوس فاخر حطين",
    price: 2900000,
    listingType: "Buy",
    type: "Townhouse",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Hittin",
    districtAr: "حي حطين",
    beds: 4,
    baths: 5,
    area: 310,
    highlights: ["Corner Unit", "Smart System", "Private Entrance"],
    highlightsAr: ["وحدة زاوية", "نظام ذكي", "مدخل خاص"],
    images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-006",
    title: "Traditional Villa Al Mogaizib",
    titleAr: "فيلا تقليدية واسعة في المغرزات",
    price: 2100000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Mughrizat",
    districtAr: "حي المغرزات",
    beds: 6,
    baths: 5,
    area: 600,
    highlights: ["Renovation Potential", "Large Courtyard", "Quiet Street"],
    highlightsAr: ["فرصة للتجديد", "حوش واسع", "شارع هادئ"],
    images: [
        "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-A-006",
    title: "Rooftop Apt Al Yasmin",
    titleAr: "شقة سطح (روف) في الياسمين",
    price: 950000,
    listingType: "Buy",
    type: "Apartment",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Yasmin",
    districtAr: "حي الياسمين",
    beds: 3,
    baths: 3,
    area: 180,
    highlights: ["Large Terrace", "Private Elevator", "New Building"],
    highlightsAr: ["تراس كبير", "مصعد خاص", "عمارة جديدة"],
    images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-007",
    title: "Diplomatic Quarter Villa",
    titleAr: "فيلا في حي السفارات",
    price: 15000000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Safarat",
    districtAr: "حي السفارات",
    beds: 6,
    baths: 8,
    area: 900,
    highlights: ["High Security", "Walking Trails", "Exclusive"],
    highlightsAr: ["أمان عالي", "ممرات مشاة", "حي حصري"],
    images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-008",
    title: "Affordable Villa Al Remal",
    titleAr: "فيلا بسعر مناسب في الرمال",
    price: 1250000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Remal",
    districtAr: "حي الرمال",
    beds: 4,
    baths: 4,
    area: 250,
    highlights: ["East Riyadh", "Near Airport", "New Construction"],
    highlightsAr: ["شرق الرياض", "قريبة من المطار", "بناء جديد"],
    images: [
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-A-007",
    title: "Apartment Al Narjis Rent",
    titleAr: "شقة للإيجار في النرجس",
    price: 55000,
    listingType: "Rent",
    type: "Apartment",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Narjis",
    districtAr: "حي النرجس",
    beds: 3,
    baths: 2,
    area: 130,
    highlights: ["Ground Floor", "Private Entrance", "Kitchen Installed"],
    highlightsAr: ["دور أرضي", "مدخل خاص", "مطبخ راكب"],
    images: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RYD-V-009",
    title: "Chalet Al Ammariyah",
    titleAr: "شاليه فاخر في العمارية",
    price: 4500000,
    listingType: "Buy",
    type: "Villa",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Ammariyah",
    districtAr: "العمارية",
    beds: 3,
    baths: 4,
    area: 2000,
    highlights: ["Huge Farm", "Swimming Pool", "Privacy"],
    highlightsAr: ["مزرعة كبيرة", "مسبح", "خصوصية تامة"],
    images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80"
    ]
  }
];
