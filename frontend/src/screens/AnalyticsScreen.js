import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { WebView } from 'react-native-webview';

const merchantData = [
  {
    id: 'featured1',
    name: 'Mak Cik Fatimah\'s Traditional Stall',
    category: 'Traditional Food',
    distance: '0.1 km',
    rating: 4.9,
    reviewCount: 234,
    badges: ['women', 'traditional'],
    story: 'Single mother of three selling traditional kuih for 5+ years. Fresh kuih made daily at 4 AM - authentic taste that supports her children\'s education.',
    image: require('../../assets/singlemotherstall.png'),
    socialCause: 'Women entrepreneurs + Family support',
    culturalHeritage: 'Traditional Malaysian kuih',
    coordinate: {
      latitude: 3.1380,
      longitude: 101.6860
    },
    contact: {
      phone: '+60 12-987 6543',
      email: 'fatimah.kuih@traditional.my',
      address: '12, Jalan Tradisional, Kuala Lumpur'
    },
    hours: {
      monday: '5:00 AM - 1:00 PM',
      tuesday: '5:00 AM - 1:00 PM',
      wednesday: '5:00 AM - 1:00 PM',
      thursday: '5:00 AM - 1:00 PM',
      friday: '5:00 AM - 1:00 PM',
      saturday: '5:00 AM - 2:00 PM',
      sunday: 'Closed'
    },
    menu: [
      { name: 'Ondeh-ondeh', price: 'RM 2.00', description: 'Fresh pandan coconut balls' },
      { name: 'Kuih Lapis', price: 'RM 1.50', description: 'Traditional layered cake' },
      { name: 'Seri Muka', price: 'RM 2.50', description: 'Coconut glutinous rice cake' },
      { name: 'Kuih Talam', price: 'RM 1.80', description: 'Two-layer steamed cake' }
    ],
    specialOffers: [
      { title: 'Early Bird Special', description: 'Buy 6 kuih, get 2 free (before 8 AM)' },
      { title: 'Student Discount', description: '20% off for students with ID' }
    ],
    sustainabilityScore: 88,
    communityImpact: 'Supports single mothers, preserves traditional recipes',
    paymentMethods: ['Cash', 'QR Pay', 'SatuPay'],
    accessibility: 'Ground level stall, friendly service',
    languages: ['Malay', 'English'],
    certifications: ['Halal', 'Traditional Recipe Preservation']
  },
  {
    id: 'featured2',
    name: 'Encik Ahmad\'s Batik Gallery',
    category: 'Traditional Crafts',
    distance: '0.15 km',
    rating: 4.7,
    reviewCount: 189,
    badges: ['oku', 'traditional', 'sustainable'],
    story: 'Wheelchair entrepreneur creating beautiful hand-painted batik for 8+ years. Proves that accessibility barriers cannot stop artistic passion and business success.',
    image: require('../../assets/wheelchairsellbatik.png'),
    socialCause: 'Disability inclusion + Traditional crafts',
    culturalHeritage: 'Malaysian batik art',
    coordinate: {
      latitude: 3.1360,
      longitude: 101.6880
    },
    contact: {
      phone: '+60 12-456 7890',
      email: 'ahmad.batik@accessible.my',
      address: '34, Jalan Seni Warisan, Kuala Lumpur'
    },
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 7:00 PM',
      sunday: '10:00 AM - 5:00 PM'
    },
    menu: [
      { name: 'Batik Scarf', price: 'RM 65', description: 'Hand-painted silk scarf' },
      { name: 'Batik Wall Art', price: 'RM 120', description: 'Traditional motif canvas' },
      { name: 'Batik Coasters', price: 'RM 25', description: 'Set of 4 decorative coasters' },
      { name: 'Custom Batik', price: 'RM 200+', description: 'Personalized batik design' }
    ],
    specialOffers: [
      { title: 'Accessibility Workshop', description: 'Learn batik techniques - wheelchair accessible' },
      { title: 'Bulk Orders', description: '15% discount for orders above RM 500' }
    ],
    sustainabilityScore: 92,
    communityImpact: 'Disability advocacy, traditional art preservation, eco-friendly dyes',
    paymentMethods: ['Cash', 'QR Pay', 'SatuPay', 'Card'],
    accessibility: 'Fully wheelchair accessible, adaptive tools available',
    languages: ['Malay', 'English', 'Sign Language (basic)'],
    certifications: ['Accessible Business Certified', 'Traditional Art Preservation', 'Eco-friendly Materials']
  },
  {
    id: 2,
    badges: ['women', 'traditional'],
    story: 'Auntie Salmah learned these traditional kuih recipes from her grandmother in Sarawak. Each piece is handmade with love and carries 60 years of heritage. Every morning at 5 AM, she prepares fresh kuih using traditional methods passed down through three generations.',
    image: require('../../assets/default.jpg'),
    socialCause: 'Women entrepreneurs',
    culturalHeritage: 'Sarawak traditional kuih',
    coordinate: {
      latitude: 3.1390,
      longitude: 101.6869
    },
    contact: {
      phone: '+60 12-345 6789',
      email: 'salmah.kuih@gmail.com',
      address: '23, Jalan Tradisi, Kuala Lumpur'
    },
    hours: {
      monday: '6:00 AM - 2:00 PM',
      tuesday: '6:00 AM - 2:00 PM',
      wednesday: '6:00 AM - 2:00 PM',
      thursday: '6:00 AM - 2:00 PM',
      friday: '6:00 AM - 2:00 PM',
      saturday: '6:00 AM - 3:00 PM',
      sunday: 'Closed'
    },
    menu: [
      { name: 'Kuih Lapis', price: 'RM 1.50', description: 'Traditional layered cake' },
      { name: 'Ondeh-ondeh', price: 'RM 2.00', description: 'Pandan balls with palm sugar' },
      { name: 'Kuih Talam', price: 'RM 1.80', description: 'Two-layer coconut cake' },
      { name: 'Seri Muka', price: 'RM 2.50', description: 'Glutinous rice with pandan custard' }
    ],
    specialOffers: [
      { title: 'Morning Special', description: 'Buy 5 kuih, get 1 free (before 10 AM)' },
      { title: 'Cultural Package', description: 'Try 6 different traditional kuih for RM 10' }
    ],
    sustainabilityScore: 85,
    communityImpact: 'Employs 3 local women, preserves traditional recipes',
    paymentMethods: ['Cash', 'QR Pay', 'SatuPay'],
    accessibility: 'Wheelchair accessible entrance',
    languages: ['Malay', 'English', 'Chinese'],
    certifications: ['Halal', 'Traditional Recipe Certified']
  },
  {
    id: 2,
    name: 'Kak Ros Batik Gallery',
    category: 'Traditional Crafts',
    distance: '0.5 km',
    rating: 4.9,
    reviewCount: 89,
    badges: ['women', 'sustainable', 'traditional'],
    story: 'Hand-painted batik using traditional techniques passed down through generations. Supporting local artisans and eco-friendly practices. Kak Ros learned batik from her mother and now teaches workshops to preserve this beautiful art form.',
    image: require('../../assets/default.jpg'),
    socialCause: 'Women entrepreneurs + Sustainable',
    culturalHeritage: 'Traditional Malaysian batik',
    coordinate: {
      latitude: 3.1420,
      longitude: 101.6890
    },
    contact: {
      phone: '+60 12-678 9012',
      email: 'rossbatik@artisan.my',
      address: '45, Jalan Seni, Kuala Lumpur'
    },
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 7:00 PM',
      sunday: '10:00 AM - 5:00 PM'
    },
    menu: [
      { name: 'Batik Sarong', price: 'RM 120', description: 'Hand-painted traditional sarong' },
      { name: 'Batik Scarf', price: 'RM 45', description: 'Silk scarf with batik patterns' },
      { name: 'Batik Shirt', price: 'RM 85', description: 'Cotton shirt with modern batik design' },
      { name: 'Batik Workshop', price: 'RM 150', description: '3-hour hands-on batik painting class' }
    ],
    specialOffers: [
      { title: 'Cultural Workshop', description: 'Learn traditional batik techniques - RM 150 (includes materials)' },
      { title: 'Eco-Friendly Bundle', description: 'Buy 2 items, get 10% off sustainable packaging' }
    ],
    sustainabilityScore: 92,
    communityImpact: 'Trains 15 local artisans, uses natural dyes, zero-waste process',
    paymentMethods: ['Cash', 'Card', 'QR Pay', 'SatuPay'],
    accessibility: 'Ground floor access, wide doorways',
    languages: ['Malay', 'English'],
    certifications: ['Eco-Friendly', 'Traditional Craft Certified', 'Fair Trade']
  },
  {
    id: 3,
    name: 'Abang Farid\'s Wheelchair Repair',
    category: 'OKU Services',
    distance: '0.3 km',
    rating: 4.7,
    reviewCount: 234,
    badges: ['oku', 'community'],
    story: 'Abang Farid, a wheelchair user himself, repairs and maintains mobility equipment for the OKU community at affordable prices. His workshop has become a hub for the disabled community, offering not just repairs but also support and advocacy.',
    image: require('../../assets/default.jpg'),
    socialCause: 'OKU-owned business',
    culturalHeritage: 'Community support services',
    coordinate: {
      latitude: 3.1400,
      longitude: 101.6880
    },
    contact: {
      phone: '+60 12-890 1234',
      email: 'farid.repair@community.my',
      address: '12, Jalan Harapan, Kuala Lumpur'
    },
    hours: {
      monday: '8:00 AM - 5:00 PM',
      tuesday: '8:00 AM - 5:00 PM',
      wednesday: '8:00 AM - 5:00 PM',
      thursday: '8:00 AM - 5:00 PM',
      friday: '8:00 AM - 5:00 PM',
      saturday: '8:00 AM - 2:00 PM',
      sunday: 'Emergency only'
    },
    menu: [
      { name: 'Wheelchair Repair', price: 'RM 50-200', description: 'Comprehensive wheelchair maintenance' },
      { name: 'Mobility Aid Rental', price: 'RM 10/day', description: 'Wheelchair, crutches, walker rental' },
      { name: 'Custom Modifications', price: 'RM 100-500', description: 'Personalized accessibility solutions' },
      { name: 'Home Visit Service', price: 'RM 30', description: 'On-site repair and consultation' }
    ],
    specialOffers: [
      { title: 'Community Support', description: 'Free repairs for low-income families' },
      { title: 'Student Discount', description: '20% off for students with disabilities' }
    ],
    sustainabilityScore: 78,
    communityImpact: 'Serves 500+ OKU individuals, advocates for accessibility rights',
    paymentMethods: ['Cash', 'Card', 'QR Pay', 'SatuPay', 'Installment Plans'],
    accessibility: 'Fully wheelchair accessible, sign language support',
    languages: ['Malay', 'English', 'Sign Language'],
    certifications: ['OKU Enterprise Certified', 'Community Service Award']
  },
  {
    id: 4,
    name: 'Youth Eco Cafe',
    category: 'Sustainable Dining',
    distance: '0.8 km',
    rating: 4.6,
    reviewCount: 312,
    badges: ['youth', 'sustainable'],
    story: 'Started by university students, this cafe serves organic local produce and uses only biodegradable packaging. The founders wanted to create a space that promotes environmental awareness while supporting local farmers.',
    image: require('../../assets/youthecocafe.png'),
    socialCause: 'Youth-led + Sustainable',
    culturalHeritage: 'Modern sustainable dining',
    coordinate: {
      latitude: 3.1400,
      longitude: 101.6840
    },
    contact: {
      phone: '+60 12-567 8901',
      email: 'hello@youtheco.cafe',
      address: '78, Jalan Hijau, Kuala Lumpur'
    },
    hours: {
      monday: '7:00 AM - 9:00 PM',
      tuesday: '7:00 AM - 9:00 PM',
      wednesday: '7:00 AM - 9:00 PM',
      thursday: '7:00 AM - 9:00 PM',
      friday: '7:00 AM - 10:00 PM',
      saturday: '8:00 AM - 10:00 PM',
      sunday: '8:00 AM - 8:00 PM'
    },
    menu: [
      { name: 'Organic Breakfast Bowl', price: 'RM 18', description: 'Local fruits, granola, organic yogurt' },
      { name: 'Sustainable Smoothie', price: 'RM 12', description: 'Seasonal fruits, zero-waste preparation' },
      { name: 'Plant-Based Burger', price: 'RM 22', description: 'Locally sourced vegetables, compostable packaging' },
      { name: 'Fair Trade Coffee', price: 'RM 8', description: 'Ethically sourced, reusable cup discount' }
    ],
    specialOffers: [
      { title: 'Student Discount', description: '15% off with student ID' },
      { title: 'Eco Warrior', description: 'Bring your own cup, get RM 2 off drinks' },
      { title: 'Weekly Sustainability Workshop', description: 'Free workshops on sustainable living' }
    ],
    sustainabilityScore: 96,
    communityImpact: 'Partners with 20 local farms, zero-waste initiative, climate education',
    paymentMethods: ['Cash', 'Card', 'QR Pay', 'SatuPay', 'Loyalty Points'],
    accessibility: 'Wheelchair accessible, braille menu available',
    languages: ['Malay', 'English', 'Mandarin'],
    certifications: ['Organic Certified', 'Zero Waste Certified', 'Fair Trade Partner']
  },
  {
    id: 5,
    name: 'Nek Minah\'s Heritage Kitchen',
    category: 'Cultural Dining',
    distance: '0.4 km',
    rating: 4.9,
    reviewCount: 78,
    badges: ['women', 'traditional', 'community'],
    story: 'Nek Minah preserves Peranakan culinary traditions in her family kitchen. Each dish tells a story of cultural fusion and heritage, with recipes unchanged for over 100 years.',
    image: require('../../assets/nekminahkitchen.png'),
    socialCause: 'Cultural preservation + Women entrepreneurs',
    culturalHeritage: 'Peranakan cuisine tradition',
    coordinate: {
      latitude: 3.1365,
      longitude: 101.6900
    },
    contact: {
      phone: '+60 12-456 7890',
      email: 'heritage@nekminah.my',
      address: '56, Jalan Warisan, Kuala Lumpur'
    },
    hours: {
      monday: 'Closed',
      tuesday: '11:00 AM - 3:00 PM, 6:00 PM - 9:00 PM',
      wednesday: '11:00 AM - 3:00 PM, 6:00 PM - 9:00 PM',
      thursday: '11:00 AM - 3:00 PM, 6:00 PM - 9:00 PM',
      friday: '11:00 AM - 3:00 PM, 6:00 PM - 9:00 PM',
      saturday: '11:00 AM - 3:00 PM, 6:00 PM - 9:00 PM',
      sunday: '11:00 AM - 3:00 PM'
    },
    menu: [
      { name: 'Ayam Pongteh', price: 'RM 25', description: 'Traditional Peranakan chicken curry' },
      { name: 'Assam Fish', price: 'RM 28', description: 'Spicy tamarind fish curry' },
      { name: 'Kuih Pie Tee', price: 'RM 15', description: 'Crispy cups with vegetable filling' },
      { name: 'Cendol Heritage', price: 'RM 8', description: 'Traditional dessert with pandan and coconut' }
    ],
    specialOffers: [
      { title: 'Cultural Experience', description: 'Full Peranakan meal with cultural storytelling' },
      { title: 'Heritage Cooking Class', description: 'Learn traditional recipes - RM 200' }
    ],
    sustainabilityScore: 82,
    communityImpact: 'Preserves Peranakan culture, employs elderly chefs, cultural education',
    paymentMethods: ['Cash', 'QR Pay', 'SatuPay'],
    accessibility: 'Ground floor seating, senior-friendly facilities',
    languages: ['Malay', 'English', 'Hokkien', 'Teochew'],
    certifications: ['Halal', 'Cultural Heritage Certified', 'Traditional Recipe Preservation']
  },
  {
    id: 6,
    name: 'Adik Haziq\'s Tech Repair',
    category: 'Youth Technology',
    distance: '0.6 km',
    rating: 4.5,
    reviewCount: 167,
    badges: ['youth', 'community'],
    story: 'At just 19, Haziq started this tech repair service to make technology accessible to everyone. He offers affordable repairs and teaches digital literacy to seniors and underprivileged communities.',
    image: require('../../assets/default.jpg'),
    socialCause: 'Youth entrepreneurship + Digital inclusion',
    culturalHeritage: 'Modern community service',
    coordinate: {
      latitude: 3.1370,
      longitude: 101.6855
    },
    contact: {
      phone: '+60 12-234 5678',
      email: 'haziq.tech@youth.my',
      address: '34, Jalan Teknologi, Kuala Lumpur'
    },
    hours: {
      monday: '10:00 AM - 8:00 PM',
      tuesday: '10:00 AM - 8:00 PM',
      wednesday: '10:00 AM - 8:00 PM',
      thursday: '10:00 AM - 8:00 PM',
      friday: '10:00 AM - 8:00 PM',
      saturday: '10:00 AM - 9:00 PM',
      sunday: '12:00 PM - 6:00 PM'
    },
    menu: [
      { name: 'Phone Screen Repair', price: 'RM 80-150', description: 'All smartphone models' },
      { name: 'Laptop Repair', price: 'RM 100-400', description: 'Hardware and software issues' },
      { name: 'Data Recovery', price: 'RM 50-200', description: 'Recover lost files and photos' },
      { name: 'Digital Literacy Class', price: 'RM 30', description: 'Learn basic smartphone/computer skills' }
    ],
    specialOffers: [
      { title: 'Student Special', description: '30% off repairs with student ID' },
      { title: 'Senior Citizen Support', description: 'Free basic tech support for seniors' },
      { title: 'Community Workshop', description: 'Monthly free digital literacy sessions' }
    ],
    sustainabilityScore: 75,
    communityImpact: 'Reduces e-waste, digital inclusion programs, youth mentorship',
    paymentMethods: ['Cash', 'Card', 'QR Pay', 'SatuPay', 'Installment Plans'],
    accessibility: 'Wheelchair accessible, patient service for elderly',
    languages: ['Malay', 'English', 'Mandarin'],
    certifications: ['Authorized Repair Center', 'Youth Enterprise Award']
  }
];

const badgeIcons = {
  women: '👩‍💼',
  youth: '💡',
  oku: '🦾',
  sustainable: '🌱',
  traditional: '🏛️',
  community: '🤝'
};

const badgeColors = {
  women: '#E91E63',
  youth: '#FF9800',
  oku: '#9C27B0',
  sustainable: '#4CAF50',
  traditional: '#FF5722',
  community: '#2196F3'
};

export default function AnalyticsScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  // Map mode removed - focusing only on social impact merchants
  const [showMap, setShowMap] = useState(true);
  
  const { width } = Dimensions.get('window');
  const carouselRef = useRef(null);

  // Carousel data
  const carouselData = [
    {
      id: 'featured1',
      name: 'Mak Cik Fatimah\'s Traditional Stall',
      description: 'Traditional kuih maker • 5+ years • Fresh daily at 4 AM',
      tag: '👩‍💼 Women Entrepreneur',
      image: require('../../assets/singlemotherstall.png')
    },
    {
      id: 'featured2',
      name: 'Encik Ahmad\'s Batik Gallery',
      description: 'Wheelchair entrepreneur • Hand-painted batik • 8+ years experience',
      tag: '🦽 Accessible Business',
      image: require('../../assets/wheelchairsellbatik.png')
    }
  ];

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const nextIndex = (currentCarouselIndex + 1) % carouselData.length;
        carouselRef.current.scrollTo({
          x: nextIndex * (width - 40),
          animated: true
        });
        setCurrentCarouselIndex(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentCarouselIndex, width]);

  // Handle carousel scroll
  const handleCarouselScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setCurrentCarouselIndex(pageNum);
  };

  // Only show the 4 specified merchants
  const allowedMerchantIds = ['featured1', 'featured2', 4, 5];
  
  const filteredMerchants = merchantData.filter(merchant => {
    // First filter by allowed merchants
    if (!allowedMerchantIds.includes(merchant.id)) {
      return false;
    }
    
    const matchesSearch = merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         merchant.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || merchant.badges.includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: 'all', label: 'All', icon: 'apps', color: '#2196F3', lightColor: '#E3F2FD' },
    { key: 'women', label: 'Women', icon: 'woman', color: '#E91E63', lightColor: '#FCE4EC' },
    { key: 'sustainable', label: 'Eco', icon: 'leaf', color: '#4CAF50', lightColor: '#E8F5E8' },
    { key: 'oku', label: 'OKU', icon: 'accessibility', color: '#00BCD4', lightColor: '#E0F2F1' },
    { key: 'youth', label: 'Youth', icon: 'bulb', color: '#FF9800', lightColor: '#FFF3E0' },
    
    { key: 'traditional', label: 'Heritage', icon: 'library', color: '#795548', lightColor: '#EFEBE9' }
  ];

  const handleMerchantPress = (merchant) => {
    setSelectedMerchant(merchant);
    setShowStoryModal(true);
  };

  const getMarkerColor = (badges) => {
    if (badges.includes('women')) return badgeColors.women;
    if (badges.includes('youth')) return badgeColors.youth;
    if (badges.includes('oku')) return badgeColors.oku;
    if (badges.includes('sustainable')) return badgeColors.sustainable;
    return Colors.primary;
  };

  const renderCustomMarker = (merchant) => (
    <View style={[styles.customMarker, { backgroundColor: getMarkerColor(merchant.badges) }]}>
      <Text style={styles.markerText}>{badgeIcons[merchant.badges[0]]}</Text>
    </View>
  );

  const generateMapHTML = () => {
    const markers = filteredMerchants.map((merchant, index) => {
      const color = getMarkerColor(merchant.badges).replace('#', '');
      const badgeIcon = badgeIcons[merchant.badges[0]];
      
      // Create special markers for featured merchants with their profile pictures
      if (merchant.id === 'featured1' || merchant.id === 'featured2') {
        const imageUrl = merchant.id === 'featured1' 
          ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // placeholder for singlemotherstall.png
          : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='; // placeholder for wheelchairsellbatik.png
        
        return `
          {
            position: { lat: ${merchant.coordinate.latitude}, lng: ${merchant.coordinate.longitude} },
            title: "${merchant.name}",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                <svg width="50" height="70" viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="featuredShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="3" dy="5" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>
                    </filter>
                    <clipPath id="circleClip">
                      <circle cx="25" cy="25" r="18"/>
                    </clipPath>
                  </defs>
                  <!-- Outer ring with gradient -->
                  <circle cx="25" cy="25" r="22" fill="url(#grad1)" filter="url(#featuredShadow)"/>
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <!-- White inner circle -->
                  <circle cx="25" cy="25" r="20" fill="white"/>
                  <!-- Profile picture circle -->
                  <circle cx="25" cy="25" r="18" fill="#${color}" clip-path="url(#circleClip)"/>
                  <!-- Badge icon in center -->
                  <text x="25" y="31" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" fill="white">${badgeIcon}</text>
                  <!-- Featured star badge -->
                  <circle cx="38" cy="12" r="8" fill="#FFD700" stroke="white" stroke-width="2"/>
                  <text x="38" y="17" text-anchor="middle" font-size="10" font-family="Arial, sans-serif">⭐</text>
                  <!-- Pointer tail -->
                  <path d="M25 45 L25 70 L30 55 Z" fill="url(#grad1)" filter="url(#featuredShadow)"/>
                  <!-- Name label -->
                  <rect x="5" y="52" width="40" height="12" rx="6" fill="rgba(0,0,0,0.8)"/>
                  <text x="25" y="60" text-anchor="middle" font-size="8" font-family="Arial, sans-serif" fill="white">${merchant.name.split(' ')[0]} ${merchant.name.split(' ')[1]}</text>
                </svg>
              \`),
              scaledSize: new google.maps.Size(50, 70),
              anchor: new google.maps.Point(25, 70)
            },
            data: ${JSON.stringify(merchant)},
            featured: true
          }
        `;
      }
      
      // Regular merchant markers
      return `
        {
          position: { lat: ${merchant.coordinate.latitude}, lng: ${merchant.coordinate.longitude} },
          title: "${merchant.name}",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
              <svg width="40" height="60" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="4" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                  </filter>
                </defs>
                <!-- Pin shape -->
                <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20c2.2 0 4.2-0.4 6-1.2L20 60L14 38.8c1.8 0.8 3.8 1.2 6 1.2c11.046 0 20-8.954 20-20S31.046 0 20 0z" fill="#${color}" filter="url(#shadow)"/>
                <!-- Inner circle -->
                <circle cx="20" cy="20" r="14" fill="white" stroke="#${color}" stroke-width="2"/>
                <!-- Icon text -->
                <text x="20" y="26" text-anchor="middle" font-size="16" font-family="Arial, sans-serif">${badgeIcon}</text>
              </svg>
            \`),
            scaledSize: new google.maps.Size(40, 60),
            anchor: new google.maps.Point(20, 60)
          },
          data: ${JSON.stringify(merchant)}
        }
      `;
    }).join(',');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          #map { height: 100%; width: 100%; }
          .info-window { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            padding: 0px;
            max-width: 280px;
            margin: 0;
          }
          .merchant-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 4px;
            margin-top: 0;
            padding: 6px;
          }
          .merchant-name { 
            font-weight: 600; 
            font-size: 16px; 
            color: #1a1a1a; 
            flex: 1;
          }
          .merchant-rating { 
            display: flex; 
            align-items: center; 
            gap: 2px;
            font-size: 12px;
          }
          .star { font-size: 12px; }
          .rating-value { font-weight: 600; color: #1a1a1a; }
          .rating-count { color: #666; }
          .merchant-category { 
            color: #666; 
            font-size: 13px; 
            margin-bottom: 8px;
            padding: 0 6px;
          }
          .merchant-badges { 
            display: flex; 
            gap: 4px; 
            margin-bottom: 8px; 
            flex-wrap: wrap;
            padding: 0 6px;
          }
          .badge { 
            padding: 2px 6px; 
            border-radius: 10px; 
            font-size: 10px; 
            color: white;
            font-weight: 500;
          }
          .merchant-description {
            color: #666;
            font-size: 12px;
            line-height: 1.4;
            margin-bottom: 12px;
            padding: 0 6px;
          }
          .info-actions {
            display: flex;
            gap: 8px;
            padding: 6px;
          }
          .action-btn {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
          }
          .action-btn:hover {
            background: #e0e0e0;
          }
          .story-btn {
            background: #E91E63;
            color: white;
            border: 1px solid #E91E63;
          }
          .story-btn:hover {
            background: #C2185B;
          }
          .directions-btn {
            background: #4285f4;
            color: white;
            border: 1px solid #4285f4;
          }
          .directions-btn:hover {
            background: #3367d6;
          }
          .btn-icon {
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            const map = new google.maps.Map(document.getElementById("map"), {
              zoom: 15,
              center: { lat: 3.1380, lng: 101.6870 },
              mapTypeId: 'roadmap',
              mapTypeControl: false,
              streetViewControl: false,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }]
                }
              ]
            });

            // Add user location marker
            new google.maps.Marker({
              position: { lat: 3.1390, lng: 101.6869 },
              map: map,
              title: "Your Location",
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="userShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="rgba(0,0,0,0.4)"/>
                      </filter>
                    </defs>
                    <!-- Outer pulse ring -->
                    <circle cx="16" cy="16" r="15" fill="none" stroke="#E91E63" stroke-width="1" opacity="0.3">
                      <animate attributeName="r" values="8;15;8" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <!-- Main dot -->
                    <circle cx="16" cy="16" r="8" fill="#E91E63" stroke="white" stroke-width="2" filter="url(#userShadow)"/>
                    <!-- Person icon -->
                    <path d="M16 10c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm0 9c-2.7 0-5.8 1.29-6 2.01h12c-0.2-0.71-3.3-2.01-6-2.01z" fill="white" transform="scale(0.6) translate(5.3, 5.3)"/>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
              },
              animation: google.maps.Animation.DROP
            });

            const markers = [${markers}];
            
            markers.forEach(markerData => {
              const marker = new google.maps.Marker({
                position: markerData.position,
                map: map,
                title: markerData.title,
                icon: markerData.icon,
                animation: google.maps.Animation.DROP
              });

              const infoWindow = new google.maps.InfoWindow({
                content: \`
                  <div class="info-window">
                    <div class="merchant-header">
                      <div class="merchant-name">\${markerData.data.name}</div>
                      <div class="merchant-rating">
                        <span class="star">⭐</span>
                        <span class="rating-value">\${markerData.data.rating}</span>
                        <span class="rating-count">(\${markerData.data.reviewCount})</span>
                      </div>
                    </div>
                    <div class="merchant-category">\${markerData.data.category} • \${markerData.data.distance}</div>
                    <div class="merchant-badges">
                      \${markerData.data.badges.map(badge => \`<span class="badge" style="background-color: \${getBadgeColor(badge)}">\${getBadgeIcon(badge)}</span>\`).join('')}
                    </div>
                    <div class="merchant-description">\${markerData.data.story.substring(0, 100)}...</div>
                    <div class="info-actions">
                      <button class="action-btn directions-btn" onclick="getDirections(\${markerData.data.coordinate.latitude}, \${markerData.data.coordinate.longitude})">
                        <span class="btn-icon">🗺️</span> Directions
                      </button>
                      <button class="action-btn story-btn" onclick="viewStory('\${markerData.data.id}')">
                        <span class="btn-icon">📖</span> View Story
                      </button>
                    </div>
                  </div>
                \`,
                maxWidth: 300
              });

              marker.addListener('click', () => {
                // Close any open info windows
                if (window.currentInfoWindow) {
                  window.currentInfoWindow.close();
                }
                infoWindow.open(map, marker);
                window.currentInfoWindow = infoWindow;
              });

              // Add marker hover effect
              marker.addListener('mouseover', () => {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => {
                  marker.setAnimation(null);
                }, 750);
              });
            });
          }

          function getBadgeColor(badge) {
            const colors = {
              'women': '#E91E63',
              'youth': '#FF9800',
              'oku': '#9C27B0',
              'sustainable': '#4CAF50',
              'traditional': '#FF5722',
              'community': '#2196F3'
            };
            return colors[badge] || '#E91E63';
          }

          function getBadgeIcon(badge) {
            const icons = {
              'women': '👩‍💼',
              'youth': '💡',
              'oku': '🦾',
              'sustainable': '🌱',
              'traditional': '🏛️',
              'community': '🤝'
            };
            return icons[badge] || '🏪';
          }

          function viewStory(merchantId) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewStory',
              merchantId: merchantId
            }));
          }

          function getDirections(lat, lng) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'getDirections',
              latitude: lat,
              longitude: lng
            }));
          }

          window.addEventListener('load', initMap);
        </script>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD4VCvFqKJ2nncIB8pFJFL9KZsJgqx6N3g&callback=initMap"></script>
      </body>
      </html>
    `;
  };

  const renderMap = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapHeader}>
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color={Colors.primary} />
          <Text style={styles.locationText}>Kuala Lumpur, Malaysia</Text>
        </View>
        <TouchableOpacity
          style={styles.mapToggleButton}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons name="list" size={20} color="white" />
          </TouchableOpacity>
        </View>

      <WebView
        style={styles.webMapView}
        source={{ html: generateMapHTML() }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'viewStory') {
              const merchant = merchantData.find(m => m.id === data.merchantId || m.id === Number(data.merchantId));
              if (merchant) {
                handleMerchantPress(merchant);
              } else {
                console.log('Merchant not found:', data.merchantId);
              }
            } else if (data.type === 'getDirections') {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;
              console.log('Opening directions:', url);
            }
          } catch (error) {
            console.log('Error parsing WebView message:', error);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );

  const renderMerchantCard = (merchant) => (
    <TouchableOpacity
      key={merchant.id}
      style={styles.merchantCard}
      onPress={() => handleMerchantPress(merchant)}
    >
      <Image source={merchant.image} style={styles.merchantImage} />
      <View style={styles.merchantInfo}>
        <View style={styles.merchantHeader}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          <View style={styles.distanceContainer}>
            <Ionicons name="location" size={12} color={Colors.textSecondary} />
            <Text style={styles.distanceText}>{merchant.distance}</Text>
            </View>
        </View>
        <Text style={styles.merchantCategory}>{merchant.category}</Text>
        <View style={styles.badgeContainer}>
          {merchant.badges.map((badge, index) => (
            <View key={index} style={[styles.badge, { backgroundColor: badgeColors[badge] }]}>
              <Text style={styles.badgeText}>{badgeIcons[badge]}</Text>
                </View>
              ))}
            </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{merchant.rating}</Text>
          </View>
        </View>
    </TouchableOpacity>
  );

  const renderStoryModal = () => (
    <Modal
      visible={showStoryModal}
      animationType="slide"
      onRequestClose={() => setShowStoryModal(false)}
    >
      <View style={styles.modalContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStoryModal(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedMerchant?.name}</Text>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="share-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedMerchant && (
            <View style={styles.storyContent}>
              <Image source={selectedMerchant.image} style={styles.storyImage} />
              
              {/* Basic Info */}
              <View style={styles.basicInfo}>
                <View style={styles.nameRatingRow}>
                  <Text style={styles.storyMerchantName}>{selectedMerchant.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{selectedMerchant.rating} ({selectedMerchant.reviewCount})</Text>
                  </View>
                </View>
                <Text style={styles.merchantCategory}>{selectedMerchant.category} • {selectedMerchant.distance}</Text>
                <View style={styles.badgeContainer}>
                  {selectedMerchant.badges.map((badge, index) => (
                    <View key={index} style={[styles.badge, { backgroundColor: badgeColors[badge] }]}>
                      <Text style={styles.badgeText}>{badgeIcons[badge]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Story Section */}
        <View style={styles.section}>
                <Text style={styles.sectionTitle}>Our Story</Text>
                <Text style={styles.storyText}>{selectedMerchant.story}</Text>
                <View style={styles.impactMetrics}>
                  <View style={styles.impactItem}>
                    <Text style={styles.impactLabel}>Community Impact</Text>
                    <Text style={styles.impactValue}>{selectedMerchant.communityImpact}</Text>
                  </View>
                  <View style={styles.impactItem}>
                    <Text style={styles.impactLabel}>Sustainability Score</Text>
                    <View style={styles.sustainabilityScore}>
                      <Text style={styles.scoreValue}>{selectedMerchant.sustainabilityScore}%</Text>
                      <View style={styles.scoreBar}>
                        <View style={[styles.scoreProgress, { width: `${selectedMerchant.sustainabilityScore}%` }]} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Menu Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menu & Services</Text>
                {selectedMerchant.menu.map((item, index) => (
                  <View key={index} style={styles.menuItem}>
                    <View style={styles.menuItemHeader}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemPrice}>{item.price}</Text>
                    </View>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  </View>
                ))}
              </View>

              {/* Special Offers */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Special Offers</Text>
                {selectedMerchant.specialOffers.map((offer, index) => (
                  <View key={index} style={styles.offerCard}>
                    <Ionicons name="gift" size={20} color={Colors.primary} />
                    <View style={styles.offerContent}>
                      <Text style={styles.offerTitle}>{offer.title}</Text>
                      <Text style={styles.offerDescription}>{offer.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Contact & Hours */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact & Hours</Text>
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={20} color={Colors.primary} />
                    <Text style={styles.contactText}>{selectedMerchant.contact.address}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={20} color={Colors.primary} />
                    <Text style={styles.contactText}>{selectedMerchant.contact.phone}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={20} color={Colors.primary} />
                    <Text style={styles.contactText}>{selectedMerchant.contact.email}</Text>
                  </View>
                </View>
                
                <View style={styles.hoursContainer}>
                  <Text style={styles.hoursTitle}>Opening Hours</Text>
                  {Object.entries(selectedMerchant.hours).map(([day, hours]) => (
                    <View key={day} style={styles.hoursRow}>
                      <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                      <Text style={styles.hoursText}>{hours}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Additional Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="card" size={20} color={Colors.primary} />
                    <Text style={styles.infoLabel}>Payment Methods</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.paymentMethods.join(', ')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="accessibility" size={20} color={Colors.primary} />
                    <Text style={styles.infoLabel}>Accessibility</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.accessibility}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="language" size={20} color={Colors.primary} />
                    <Text style={styles.infoLabel}>Languages</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.languages.join(', ')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                    <Text style={styles.infoLabel}>Certifications</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.certifications.join(', ')}</Text>
                  </View>
                </View>
              </View>

              {/* Cultural Heritage */}
              <View style={styles.heritageSection}>
                <Text style={styles.heritageTitle}>Cultural Heritage</Text>
                <Text style={styles.heritageText}>{selectedMerchant.culturalHeritage}</Text>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="navigate" size={20} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="call" size={20} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="bookmark" size={20} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
              </View>

              <LinearGradient
                colors={Colors.gradientPink}
                style={styles.supportButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity style={styles.supportButtonInner}>
                  <Text style={styles.supportButtonText}>Support This Business</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <ScreenSafeArea style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Modern Header */}
            <LinearGradient
          colors={['#FFFFFF', '#F5F5F5']}
          style={styles.modernHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.modernHeaderTitle}>Discovery</Text>
              <Text style={styles.modernHeaderSubtitle}>Find impact businesses near you</Text>
                </View>
            <TouchableOpacity onPress={() => setShowMap(!showMap)} style={styles.mapToggleButton}>
              <Ionicons name={showMap ? 'list' : 'map'} size={20} color="white" />
            </TouchableOpacity>
              </View>
            </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Find merchants, stories, heritage..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterPill,
                {
                  backgroundColor: selectedFilter === filter.key ? filter.color : filter.lightColor,
                  borderColor: filter.color,
                }
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Ionicons 
                name={filter.icon} 
                size={14} 
                color={selectedFilter === filter.key ? 'white' : filter.color} 
                style={styles.filterIcon}
              />
              <Text style={[
                styles.filterText,
                {
                  color: selectedFilter === filter.key ? 'white' : filter.color,
                  fontWeight: selectedFilter === filter.key ? '700' : '600'
                }
              ]}>
                {filter.label}
              </Text>
          </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Daily Highlights Carousel */}
        <View style={styles.highlightSection}>
          <Text style={styles.sectionTitle}>🌟 Daily Highlights</Text>
          
          <ScrollView 
            ref={carouselRef}
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.heroCarousel}
            contentContainerStyle={styles.heroCarouselContent}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={width - 40}
            snapToAlignment="start"
          >
            {carouselData.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.compactHeroCard,
                  { 
                    marginRight: index === carouselData.length - 1 ? 0 : 0,
                    transform: [{ 
                      scale: currentCarouselIndex === index ? 1 : 0.95 
                    }],
                    opacity: currentCarouselIndex === index ? 1 : 0.8
                  }
                ]}
              >
                <Image 
                  source={item.image} 
                  style={styles.compactHeroImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                />
                <View style={styles.compactHeroContent}>
                  <View style={styles.heroTagContainer}>
                    <Text style={styles.heroTag}>{item.tag}</Text>
        </View>
                  <Text style={styles.compactHeroTitle}>{item.name}</Text>
                  <Text style={styles.compactHeroDescription}>
                    {item.description}
                  </Text>
                  <View style={styles.heroActions}>
                    <TouchableOpacity style={styles.heroActionButton}>
                      <Ionicons name="location" size={14} color="white" />
                      <Text style={styles.heroActionText}>Visit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.heroActionButton}>
                      <Ionicons name="heart" size={14} color="white" />
                      <Text style={styles.heroActionText}>Support</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Dynamic Carousel Indicators */}
          <View style={styles.carouselIndicators}>
            {carouselData.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.indicator, 
                  currentCarouselIndex === index && styles.activeIndicator
                ]} 
              />
            ))}
          </View>
        </View>



        {/* Interactive Map or Merchant List */}
        {showMap ? renderMap() : (
        <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Nearby Impact Merchants</Text>
          <Text style={styles.sectionSubtitle}>
            All registered MSMEs with social impact badges
          </Text>
            
            {filteredMerchants.map(renderMerchantCard)}
          </View>
        )}
        
        {/* Legend for Map */}
        {showMap && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗺️ Map Legend</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={[styles.legendMarker, { backgroundColor: badgeColors.women }]}>
                  <Text style={styles.legendMarkerText}>{badgeIcons.women}</Text>
        </View>
                <Text style={styles.legendLabel}>Women Entrepreneurs</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendMarker, { backgroundColor: badgeColors.youth }]}>
                  <Text style={styles.legendMarkerText}>{badgeIcons.youth}</Text>
                </View>
                <Text style={styles.legendLabel}>Youth-led Businesses</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendMarker, { backgroundColor: badgeColors.oku }]}>
                  <Text style={styles.legendMarkerText}>{badgeIcons.oku}</Text>
                </View>
                <Text style={styles.legendLabel}>OKU-owned/friendly</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendMarker, { backgroundColor: badgeColors.sustainable }]}>
                  <Text style={styles.legendMarkerText}>{badgeIcons.sustainable}</Text>
                </View>
                <Text style={styles.legendLabel}>Sustainable/Eco-certified</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendMarker, { backgroundColor: badgeColors.traditional }]}>
                  <Text style={styles.legendMarkerText}>{badgeIcons.traditional}</Text>
                </View>
                <Text style={styles.legendLabel}>Traditional/Heritage</Text>
              </View>
            </View>
          </View>
        )}

        {/* Community Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Happening Nearby?</Text>
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.eventTitle}>Night Market Cultural Festival</Text>
              <Text style={styles.eventTime}>Today, 7:00 PM</Text>
              </View>
            <Text style={styles.eventDescription}>
              Tonight at Pasar Malam Taman Tun - Indigenous crafts, traditional food, and live cultural performances
            </Text>
            <View style={styles.eventBadges}>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Traditional Crafts</Text>
          </View>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Local Food</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.eventButton}>
              <Text style={styles.eventButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Ionicons name="school" size={20} color={Colors.primary} />
              <Text style={styles.eventTitle}>Batik Workshop with Kak Ros</Text>
              <Text style={styles.eventTime}>Tomorrow, 2:00 PM</Text>
            </View>
            <Text style={styles.eventDescription}>
              Learn traditional batik painting techniques. All materials provided. Limited to 8 participants.
            </Text>
            <View style={styles.eventBadges}>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Workshop</Text>
              </View>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Women-led</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.eventButton}>
              <Text style={styles.eventButtonText}>Book Now - RM 150</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Collections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Collections</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionScroll}>
            <View style={styles.collectionCard}>
              <LinearGradient colors={['#E91E63', '#AD1457']} style={styles.collectionGradient}>
                <Text style={styles.collectionTitle}>Heritage Heroes</Text>
                <Text style={styles.collectionSubtitle}>Preserving Malaysia's culinary traditions</Text>
                <Text style={styles.collectionCount}>5 businesses</Text>
              </LinearGradient>
          </View>
            <View style={styles.collectionCard}>
              <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.collectionGradient}>
                <Text style={styles.collectionTitle}>Eco Warriors</Text>
                <Text style={styles.collectionSubtitle}>Zero waste, maximum impact</Text>
                <Text style={styles.collectionCount}>8 businesses</Text>
              </LinearGradient>
            </View>
            <View style={styles.collectionCard}>
              <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.collectionGradient}>
                <Text style={styles.collectionTitle}>Young Innovators</Text>
                <Text style={styles.collectionSubtitle}>Next generation entrepreneurs</Text>
                <Text style={styles.collectionCount}>12 businesses</Text>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>

        

        {/* Community Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Challenges</Text>
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Ionicons name="medal" size={24} color={Colors.primary} />
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>Support 10 Local Heroes</Text>
                <Text style={styles.challengeProgress}>Progress: 3/10</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '30%' }]} />
              </View>
              <Text style={styles.progressText}>30%</Text>
            </View>
            <Text style={styles.challengeReward}>Reward: Impact Badge L1</Text>
          </View>
        </View>

        {/* Social Good Dashboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Social Good Dashboard</Text>
            <Text style={styles.impactSubtitle}>Badges you've earned by supporting local businesses</Text>
            
            <View style={styles.badgeCollection}>
              <View style={styles.earnedBadge}>
                <Text style={styles.badgeEmoji}>👩‍💼</Text>
                <Text style={styles.badgeCount}>5</Text>
              </View>
              <View style={styles.earnedBadge}>
                <Text style={styles.badgeEmoji}>🌱</Text>
                <Text style={styles.badgeCount}>3</Text>
              </View>
              <View style={styles.earnedBadge}>
                <Text style={styles.badgeEmoji}>💡</Text>
                <Text style={styles.badgeCount}>2</Text>
              </View>
              <View style={styles.earnedBadge}>
                <Text style={styles.badgeEmoji}>🦾</Text>
                <Text style={styles.badgeCount}>1</Text>
              </View>
            </View>
            
            <Text style={styles.impactMessage}>
              "Thank you for supporting 11 local businesses this month! You've helped create positive community impact."
            </Text>
          </View>
        </View>

      </ScrollView>
      {renderStoryModal()}
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  // Modern Header Styles
  modernHeader: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  modernHeaderTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 2,
  },
  modernHeaderSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mapToggleButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: Colors.text,
  },
  // Filter Pills
  filterContainer: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterPill: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  activeFilterText: {
    color: 'white',
  },
  // Highlight Section
  highlightSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  // Hero Carousel
  heroCarousel: {
    marginBottom: 16,
  },
  heroCarouselContent: {
    paddingLeft: 0,
    // Ensure smooth scrolling performance
    paddingRight: 0,
  },
  // Compact Hero Card
  compactHeroCard: {
    height: 200,
    width: Dimensions.get('window').width - 40,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginRight: 0,
    // Smooth transition animations
    transition: 'all 0.3s ease-in-out',
  },
  compactHeroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  compactHeroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTagContainer: {
    marginBottom: 8,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  compactHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    lineHeight: 24,
  },
  compactHeroDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Carousel Indicators
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    // Smooth transitions for indicators
    transition: 'all 0.3s ease-in-out',
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 8,
    // Enhanced active state with smooth scaling
    transform: [{ scaleY: 1.2 }],
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Legacy styles for compatibility
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroStoryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroStoryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  heroStoryContent: {
    flex: 1,
  },
  heroStoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroStoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  heroStoryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  heroStoryBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginTop: 4,
  },
  heroStoryTag: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  heroStoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B4513',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  merchantCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  merchantImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  merchantCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  eventTime: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventBadges: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventBadge: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  eventBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  eventButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  eventButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  collectionScroll: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  collectionCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectionGradient: {
    padding: 20,
    height: 120,
    justifyContent: 'center',
  },
  collectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  collectionSubtitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 8,
  },
  collectionCount: {
    color: 'white',
    fontSize: 11,
    opacity: 0.8,
    fontWeight: '600',
  },

  challengeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  challengeProgress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  challengeReward: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  impactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  impactSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  badgeCollection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  earnedBadge: {
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  impactMessage: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  storyContent: {
    paddingHorizontal: 24,
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  basicInfo: {
    marginBottom: 24,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storyMerchantName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  merchantCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  storyText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  impactMetrics: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  impactItem: {
    marginBottom: 12,
  },
  impactLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  sustainabilityScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 12,
  },
  scoreBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  menuItem: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  menuItemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  offerCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeft: 4,
    borderLeftColor: Colors.primary,
  },
  offerContent: {
    flex: 1,
    marginLeft: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  hoursContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
    marginBottom: 4,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
    flex: 2,
  },
  heritageSection: {
    backgroundColor: `${Colors.primary}15`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeft: 4,
    borderLeftColor: Colors.primary,
  },
  heritageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  heritageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    minWidth: 80,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  supportButton: {
    borderRadius: 12,
    marginBottom: 24,
  },
  supportButtonInner: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: Colors.surface,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  webMapView: {
    height: 450,
    width: '100%',
  },
  mapToggleButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  legendContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginHorizontal: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  legendMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legendMarkerText: {
    fontSize: 12,
  },
  legendLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginRight: 16,
  },
}); 