import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Modal,
    TextInput,
    ScrollView,
    Dimensions,
    Linking,
    PermissionsAndroid,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Badge, Divider, Chip, ActivityIndicator, Dialog, Portal, Button } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { MSMEColors } from './MSMEToolsScreen';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { TabView, TabBar } from 'react-native-tab-view';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

const BulkPurchaseScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Active Groups');
    const [modalVisible, setModalVisible] = useState(false);
    const [newListingType, setNewListingType] = useState('need');
    const [newListing, setNewListing] = useState({
        title: '',
        description: '',
        quantity: '',
        price: '',
        category: 'Supplies',
        expiry: '',
        location: '',
        latitude: null,
        longitude: null,
    });
    const [groupModalVisible, setGroupModalVisible] = useState(false);
    const [newGroup, setNewGroup] = useState({
        title: '',
        description: '',
        category: 'Packaging',
        deadline: '',
        contact: '',
        location: '',
        latitude: null,
        longitude: null,
    });

    // Add the memberModalActiveTab state variable
    const [memberModalActiveTab, setMemberModalActiveTab] = useState(0);

    // Add location state
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [distanceFilter, setDistanceFilter] = useState(null);

    // Store only user-created groups in state
    const [userGroups, setUserGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [savedItems, setSavedItems] = useState([]); // Add saved items state

    // New state variables for filter functionality
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    // Update filters to include distance
    const [filters, setFilters] = useState({
        categories: [],
        dateRange: { from: '', to: '' },
        priceRange: { min: '', max: '' },
        distance: null,
        sortBy: 'newest'
    });
    const [filteredData, setFilteredData] = useState({
        bulkOrders: [],
        inventory: [],
        myListings: []
    });

    // Show tab explanations
    const [showTabInfo, setShowTabInfo] = useState(false);

    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [showExpiryPicker, setShowExpiryPicker] = useState(false);

    // Group management state
    const [groupMenuVisible, setGroupMenuVisible] = useState(false);
    const [groupEditModalVisible, setGroupEditModalVisible] = useState(false);
    const [groupMembers, setGroupMembers] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [memberManagementVisible, setMemberManagementVisible] = useState(false);

    const [joinGroupModalVisible, setJoinGroupModalVisible] = useState(false);
    const [joinGroupQuantity, setJoinGroupQuantity] = useState('');
    const [joiningGroupId, setJoiningGroupId] = useState(null);

    // Add state for chat functionality
    const [newMessageText, setNewMessageText] = useState('');

    // Tabs
    const tabs = ['Active Groups', 'Marketplace', 'My Activities', 'Saved'];

    // Tab explanations
    const tabExplanations = {
        'Active Groups': 'Join others to bulk order ingredients or packaging and cut costs through group buying.',
        'Marketplace': 'Share or swap leftover ingredients and packaging with other businesses to reduce waste.',
        'My Activities': 'Manage your listings, including excess stock that will be auto-listed to nearby MSMEs or social buyers.',
        'Saved': 'Quick access to group buys, swap opportunities, and excess stock listings you\'ve saved for future reference.'
    };

    // Available filter categories
    const availableCategories = ['Packaging', 'Ingredients', 'Equipment', 'Services', 'Storage', 'Supplies', 'Other'];
    const sortOptions = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
        { label: 'Price: Low to High', value: 'priceLow' },
        { label: 'Price: High to Low', value: 'priceHigh' },
        { label: 'Closing Soon', value: 'deadline' },
        { label: 'Nearest First', value: 'distance' },
    ];

    // Sample bulk purchase groups with location data
    const bulkOrders = [
        {
            id: '1',
            title: 'Food Packaging Bulk Order',
            description: 'Joining forces to order eco-friendly takeaway containers directly from manufacturer.',
            participants: 7,
            itemsCount: 2,
            deadline: '2025-09-15',
            category: 'Packaging',
            status: 'Active',
            location: 'Bangsar, Kuala Lumpur',
            latitude: 3.1390,
            longitude: 101.6869,
            joined: true, // User has already joined this group
            currentQuantity: 70,
            targetQuantity: 100,
        },
        {
            id: '2',
            title: 'Wholesale Flour Purchase',
            description: 'Group of bakeries ordering premium flour in bulk to get better pricing.',
            participants: 12,
            itemsCount: 1,
            deadline: '2025-09-10',
            category: 'Ingredients',
            status: 'Active',
            location: 'Petaling Jaya, Selangor',
            latitude: 3.1073,
            longitude: 101.6067,
            joined: false,
            currentQuantity: 85,
            targetQuantity: 100,
        },
        {
            id: '3',
            title: 'Shared Delivery Service',
            description: 'Small food businesses sharing delivery service costs for the month of September.',
            participants: 5,
            itemsCount: 1,
            deadline: '2025-08-30',
            category: 'Services',
            status: 'Closing Soon',
            location: 'Subang Jaya, Selangor',
            latitude: 3.0567,
            longitude: 101.5851,
            joined: false,
            currentQuantity: 40,
            targetQuantity: 50,
        },
    ];

    // Sample available inventory items with location data
    const availableItems = [
        {
            id: '1',
            userId: 'user1',
            userName: 'Maria\'s Bakery',
            title: 'Excess Baking Ingredients',
            description: 'Sharing excess ingredients: 10kg sugar, 5kg chocolate chips, and vanilla extract.',
            quantity: 'Various',
            price: 'Negotiable',
            category: 'Ingredients',
            posted: '2025-08-15',
            expiry: '2025-09-15',
            type: 'offer',
            location: 'Shah Alam, Selangor',
            latitude: 3.0730,
            longitude: 101.5183,
        },
        {
            id: '2',
            userId: 'user2',
            userName: 'Asian Delights Restaurant',
            title: 'Looking for Takeaway Containers',
            description: 'Need small and medium-sized food containers for our new takeaway menu.',
            quantity: '500 units',
            price: 'Market price',
            category: 'Packaging',
            posted: '2025-08-14',
            type: 'need',
            location: 'Bukit Bintang, Kuala Lumpur',
            latitude: 3.1488,
            longitude: 101.7143,
        },
        {
            id: '3',
            userId: 'user3',
            userName: 'Fresh Juice Corner',
            title: 'Sharing Cold Storage Space',
            description: 'We have extra refrigerator space available for the next month. Suitable for beverages and fruits.',
            quantity: '10 cubic feet',
            price: 'RM100/week',
            category: 'Storage',
            posted: '2025-08-10',
            expiry: '2025-09-10',
            type: 'offer',
            location: 'Ampang, Selangor',
            latitude: 3.1644,
            longitude: 101.7606,
        },
    ];

    const myListings = [
        {
            id: '4',
            userId: 'currentUser',
            userName: 'Your Business',
            title: 'Need Baking Equipment',
            description: 'Looking to borrow or rent a commercial mixer for a week.',
            quantity: '1 unit',
            price: 'Negotiable',
            category: 'Equipment',
            posted: '2025-08-12',
            type: 'need',
            location: 'Cheras, Kuala Lumpur',
            latitude: 3.1042,
            longitude: 101.7511,
        }
    ];

    // Request location permission and get current location
    const requestLocationPermission = async () => {
        setLocationLoading(true);
        setLocationError(null);

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setLocationError('Permission to access location was denied');
                setLocationPermission(false);
                setLocationLoading(false);
                return;
            }

            setLocationPermission(true);

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

        } catch (error) {
            setLocationError('Could not get location: ' + error.message);
        } finally {
            setLocationLoading(false);
        }
    };

    // Get user's current location on component mount
    useEffect(() => {
        requestLocationPermission();
    }, []);

    // Initialize mock data for joined groups
    useEffect(() => {
        // Initialize members for the joined group
        if (bulkOrders.some(group => group.joined)) {
            setGroupMembers(prev => {
                const newMembers = { ...prev };
                // Add user as member to any group marked as joined
                bulkOrders.forEach(group => {
                    if (group.joined) {
                        newMembers[group.id] = [
                            ...(newMembers[group.id] || []),
                            {
                                id: `m${Math.random().toString(36).substring(2, 9)}`,
                                name: 'Your Business',
                                joinDate: '2025-08-20',
                                quantity: 10,
                                status: 'confirmed'
                            },
                            // Add some other mock members
                            {
                                id: `m${Math.random().toString(36).substring(2, 9)}`,
                                name: 'Maria\'s Bakery',
                                joinDate: '2025-08-18',
                                quantity: 25,
                                status: 'confirmed'
                            },
                            {
                                id: `m${Math.random().toString(36).substring(2, 9)}`,
                                name: 'Asian Delights',
                                joinDate: '2025-08-19',
                                quantity: 35,
                                status: 'confirmed'
                            }
                        ];

                        // Add mock messages for the group chat
                        setGroupMessages(prev => ({
                            ...prev,
                            [group.id]: [
                                {
                                    id: `msg${Math.random().toString(36).substring(2, 9)}`,
                                    sender: 'Maria\'s Bakery',
                                    text: 'Hi everyone! Excited to join this group buy.',
                                    timestamp: '2025-08-18T10:30:00Z'
                                },
                                {
                                    id: `msg${Math.random().toString(36).substring(2, 9)}`,
                                    sender: 'Asian Delights',
                                    text: 'When is the expected delivery date after we place the order?',
                                    timestamp: '2025-08-19T09:15:00Z'
                                },
                                {
                                    id: `msg${Math.random().toString(36).substring(2, 9)}`,
                                    sender: 'Your Business',
                                    text: 'I think we\'ll receive it within 5 days after reaching the target.',
                                    timestamp: '2025-08-19T09:45:00Z'
                                }
                            ]
                        }));
                    }
                });
                return newMembers;
            });
        }
    }, []);

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;

        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        return parseFloat(distance.toFixed(1));
    };

    // Get formatted distance string
    const getDistanceText = (item) => {
        if (!userLocation || !item.latitude || !item.longitude) return '';

        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.latitude,
            item.longitude
        );

        if (distance === null) return '';
        return `${distance} km away`;
    };

    // Filter and search functionality
    useEffect(() => {
        // Apply filters and search query to the data
        const applyFiltersAndSearch = () => {
            // Filter bulk orders
            let filteredBulkOrders = [...userGroups, ...bulkOrders.map(order => ({ ...order, isMine: false }))];

            // Filter inventory items
            let filteredInventory = [...availableItems];

            // Filter my listings
            let filteredMyListings = [...myListings];

            // Apply search query
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase().trim();

                filteredBulkOrders = filteredBulkOrders.filter(item =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query) ||
                    (item.location && item.location.toLowerCase().includes(query))
                );

                filteredInventory = filteredInventory.filter(item =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query) ||
                    item.userName.toLowerCase().includes(query) ||
                    (item.location && item.location.toLowerCase().includes(query))
                );

                filteredMyListings = filteredMyListings.filter(item =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query) ||
                    (item.location && item.location.toLowerCase().includes(query))
                );
            }

            // Apply category filters
            if (filters.categories.length > 0) {
                filteredBulkOrders = filteredBulkOrders.filter(item =>
                    filters.categories.includes(item.category)
                );

                filteredInventory = filteredInventory.filter(item =>
                    filters.categories.includes(item.category)
                );

                filteredMyListings = filteredMyListings.filter(item =>
                    filters.categories.includes(item.category)
                );
            }

            // Apply date range filters
            if (filters.dateRange.from && filters.dateRange.to) {
                const fromDate = new Date(filters.dateRange.from);
                const toDate = new Date(filters.dateRange.to);

                filteredBulkOrders = filteredBulkOrders.filter(item => {
                    const deadline = new Date(item.deadline);
                    return deadline >= fromDate && deadline <= toDate;
                });

                filteredInventory = filteredInventory.filter(item => {
                    const posted = new Date(item.posted);
                    return posted >= fromDate && posted <= toDate;
                });

                filteredMyListings = filteredMyListings.filter(item => {
                    const posted = new Date(item.posted);
                    return posted >= fromDate && posted <= toDate;
                });
            }

            // Apply price range filters (for inventory and my listings)
            if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
                const filterByPrice = (item) => {
                    // Skip items with non-numeric prices
                    if (item.price === 'Negotiable' || item.price === 'Market price') return true;

                    // Extract numeric price value
                    const priceMatch = item.price.match(/\d+/);
                    if (!priceMatch) return true;

                    const price = parseInt(priceMatch[0], 10);
                    const min = filters.priceRange.min !== '' ? parseInt(filters.priceRange.min, 10) : 0;
                    const max = filters.priceRange.max !== '' ? parseInt(filters.priceRange.max, 10) : Infinity;

                    return price >= min && price <= max;
                };

                filteredInventory = filteredInventory.filter(filterByPrice);
                filteredMyListings = filteredMyListings.filter(filterByPrice);
            }

            // Apply distance filter
            if (userLocation && filters.distance) {
                const maxDistance = parseInt(filters.distance, 10);

                const filterByDistance = (item) => {
                    if (!item.latitude || !item.longitude) return false;

                    const distance = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        item.latitude,
                        item.longitude
                    );

                    return distance !== null && distance <= maxDistance;
                };

                filteredBulkOrders = filteredBulkOrders.filter(filterByDistance);
                filteredInventory = filteredInventory.filter(filterByDistance);
                filteredMyListings = filteredMyListings.filter(filterByDistance);
            }

            // Apply sorting
            const sortItems = (items) => {
                switch (filters.sortBy) {
                    case 'newest':
                        return [...items].sort((a, b) => new Date(b.posted || b.deadline) - new Date(a.posted || a.deadline));
                    case 'oldest':
                        return [...items].sort((a, b) => new Date(a.posted || a.deadline) - new Date(b.posted || b.deadline));
                    case 'deadline':
                        return [...items].sort((a, b) => new Date(a.deadline || a.expiry || a.posted) - new Date(b.deadline || b.expiry || b.posted));
                    case 'distance':
                        if (userLocation) {
                            return [...items].sort((a, b) => {
                                const distA = calculateDistance(
                                    userLocation.latitude,
                                    userLocation.longitude,
                                    a.latitude,
                                    a.longitude
                                ) || Infinity;
                                const distB = calculateDistance(
                                    userLocation.latitude,
                                    userLocation.longitude,
                                    b.latitude,
                                    b.longitude
                                ) || Infinity;
                                return distA - distB;
                            });
                        }
                        return items;
                    default:
                        return items;
                }
            };

            setFilteredData({
                bulkOrders: sortItems(filteredBulkOrders),
                inventory: sortItems(filteredInventory),
                myListings: sortItems(filteredMyListings)
            });
        };

        applyFiltersAndSearch();
    }, [searchQuery, filters, userGroups, userLocation]);

    // Initialize filtered data on component mount
    useEffect(() => {
        setFilteredData({
            bulkOrders: [...userGroups, ...bulkOrders.map(order => ({ ...order, isMine: false }))],
            inventory: [...availableItems],
            myListings: [...myListings]
        });
    }, []);

    const addNewListing = () => {
        const id = Math.random().toString(36).substring(2, 9);
        const listing = {
            id,
            userId: 'currentUser',
            userName: 'Your Business',
            title: newListing.title,
            description: newListing.description,
            quantity: newListing.quantity,
            price: newListing.price,
            category: newListing.category,
            posted: new Date().toISOString().split('T')[0],
            expiry: newListing.expiry,
            type: newListingType,
            location: newListing.location,
            latitude: newListing.latitude,
            longitude: newListing.longitude,
        };

        myListings.unshift(listing);
        setModalVisible(false);
        setNewListing({
            title: '',
            description: '',
            quantity: '',
            price: '',
            category: 'Supplies',
            expiry: '',
            location: '',
            latitude: null,
            longitude: null,
        });

        // Update filtered data after adding new listing
        setFilteredData(prev => ({
            ...prev,
            myListings: [listing, ...prev.myListings]
        }));
    };

    const addNewGroup = () => {
        const id = Math.random().toString(36).substring(2, 9);
        const group = {
            id,
            title: newGroup.title,
            description: newGroup.description,
            participants: 1,
            itemsCount: 1,
            deadline: newGroup.deadline,
            category: newGroup.category,
            status: 'Active',
            isMine: true, // Mark as user's own group
            location: newGroup.location,
            latitude: newGroup.latitude,
            longitude: newGroup.longitude,
            targetQuantity: 100, // Default target quantity
            currentQuantity: 0,  // Starting quantity
        };

        // Add the creator as the first member
        setGroupMembers(prev => ({
            ...prev,
            [id]: [
                {
                    id: `m${Math.random().toString(36).substring(2, 9)}`,
                    name: 'Your Business',
                    joinDate: new Date().toISOString().split('T')[0],
                    quantity: 0, // Creator starts with 0
                    status: 'confirmed'
                }
            ]
        }));

        // Initialize empty chat
        setGroupMessages(prev => ({
            ...prev,
            [id]: []
        }));

        const updatedUserGroups = [group, ...userGroups];
        setUserGroups(updatedUserGroups);
        setGroupModalVisible(false);
        setNewGroup({
            title: '',
            description: '',
            category: 'Packaging',
            deadline: '',
            location: '',
            latitude: null,
            longitude: null,
        });

        // Update filtered data after adding new group
        setFilteredData(prev => ({
            ...prev,
            bulkOrders: [group, ...prev.bulkOrders]
        }));
    };

    // Use current location for a new listing or group
    const useCurrentLocationForForm = (type) => {
        if (!userLocation) {
            requestLocationPermission();
            return;
        }

        // Reverse geocode to get address
        const getAddressFromCoords = async () => {
            try {
                const result = await Location.reverseGeocodeAsync({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude
                });

                if (result && result[0]) {
                    const address = result[0];
                    const locationString = `${address.district || address.city || ''}, ${address.region || ''}`.trim();

                    if (type === 'listing') {
                        setNewListing({
                            ...newListing,
                            location: locationString,
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude
                        });
                    } else if (type === 'group') {
                        setNewGroup({
                            ...newGroup,
                            location: locationString,
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude
                        });
                    } else if (type === 'edit' && selectedGroup) {
                        setSelectedGroup({
                            ...selectedGroup,
                            location: locationString,
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude
                        });
                    }
                }
            } catch (error) {
                console.error("Error getting address:", error);

                // Use coordinates if address lookup fails
                const locationString = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;

                if (type === 'listing') {
                    setNewListing({
                        ...newListing,
                        location: locationString,
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude
                    });
                } else if (type === 'group') {
                    setNewGroup({
                        ...newGroup,
                        location: locationString,
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude
                    });
                } else if (type === 'edit' && selectedGroup) {
                    setSelectedGroup({
                        ...selectedGroup,
                        location: locationString,
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude
                    });
                }
            }
        };

        getAddressFromCoords();
    };

    // Toggle category filter selection
    const toggleCategoryFilter = (category) => {
        setFilters(prevFilters => {
            const categories = [...prevFilters.categories];
            const index = categories.indexOf(category);

            if (index === -1) {
                categories.push(category);
            } else {
                categories.splice(index, 1);
            }

            return {
                ...prevFilters,
                categories
            };
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            categories: [],
            dateRange: { from: '', to: '' },
            priceRange: { min: '', max: '' },
            distance: null,
            sortBy: 'newest'
        });
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0;

        if (filters.categories.length > 0) count++;
        if (filters.dateRange.from || filters.dateRange.to) count++;
        if (filters.priceRange.min || filters.priceRange.max) count++;
        if (filters.sortBy !== 'newest') count++;
        if (filters.distance) count++;

        return count;
    };

    // Render active filters
    const renderActiveFilters = () => {
        if (getActiveFilterCount() === 0) return null;

        return (
            <View style={styles.activeFiltersContainer}>
                <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {filters.categories.length > 0 && (
                        <View style={styles.activeFilterChip}>
                            <Text style={styles.activeFilterChipText}>
                                {filters.categories.length === 1
                                    ? `Category: ${filters.categories[0]}`
                                    : `Categories: ${filters.categories.length}`}
                            </Text>
                        </View>
                    )}

                    {(filters.dateRange.from || filters.dateRange.to) && (
                        <View style={styles.activeFilterChip}>
                            <Text style={styles.activeFilterChipText}>Date Range</Text>
                        </View>
                    )}

                    {(filters.priceRange.min || filters.priceRange.max) && (
                        <View style={styles.activeFilterChip}>
                            <Text style={styles.activeFilterChipText}>
                                {`Price: ${filters.priceRange.min || '0'}-${filters.priceRange.max || 'max'}`}
                            </Text>
                        </View>
                    )}

                    {filters.distance && (
                        <View style={styles.activeFilterChip}>
                            <Text style={styles.activeFilterChipText}>
                                Distance: {filters.distance} km
                            </Text>
                        </View>
                    )}

                    {filters.sortBy !== 'newest' && (
                        <View style={styles.activeFilterChip}>
                            <Text style={styles.activeFilterChipText}>
                                {sortOptions.find(option => option.value === filters.sortBy)?.label}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.clearAllFiltersChip} onPress={clearFilters}>
                        <Text style={styles.clearAllFiltersText}>Clear All</Text>
                        <Ionicons name="close-circle" size={14} color={MSMEColors.error} />
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    };

    // Render filter panel
    const renderFilterPanel = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isFilterVisible}
            onRequestClose={() => setIsFilterVisible(false)}
        >
            <View style={styles.filterModalOverlay}>
                <View style={styles.filterModalContainer}>
                    <View style={styles.filterHeader}>
                        <Text style={styles.filterTitle}>Filter & Sort</Text>
                        <View style={styles.filterHeaderActions}>
                            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
                                <Text style={styles.clearFiltersText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)} style={styles.closeFilterButton}>
                                <Ionicons name="close" size={20} color={MSMEColors.darkGray} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={styles.filterScrollView} showsVerticalScrollIndicator={true}>
                        <Text style={styles.filterSectionTitle}>Categories</Text>
                        <View style={styles.categoriesContainer}>
                            {availableCategories.map(category => (
                                <Chip
                                    key={category}
                                    selected={filters.categories.includes(category)}
                                    onPress={() => toggleCategoryFilter(category)}
                                    style={[
                                        styles.categoryChip,
                                        filters.categories.includes(category) && styles.selectedCategoryChip
                                    ]}
                                    textStyle={[
                                        styles.categoryChipText,
                                        filters.categories.includes(category) && styles.selectedCategoryChipText
                                    ]}
                                >
                                    {category}
                                </Chip>
                            ))}
                        </View>

                        <Text style={styles.filterSectionTitle}>Date Range</Text>
                        <View style={styles.dateRangeContainer}>
                            <View style={styles.dateInputContainer}>
                                <Text style={styles.dateInputLabel}>From:</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowFromDatePicker(true)}
                                >
                                    <Text>{filters.dateRange.from || 'YYYY-MM-DD'}</Text>
                                </TouchableOpacity>
                                {showFromDatePicker && (
                                    <DateTimePicker
                                        value={filters.dateRange.from ? new Date(filters.dateRange.from) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowFromDatePicker(false);
                                            if (selectedDate) {
                                                const formatted = selectedDate.toISOString().split('T')[0];
                                                setFilters({
                                                    ...filters,
                                                    dateRange: { ...filters.dateRange, from: formatted }
                                                });
                                            }
                                        }}
                                    />
                                )}
                            </View>
                            <View style={styles.dateInputContainer}>
                                <Text style={styles.dateInputLabel}>To:</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowToDatePicker(true)}
                                >
                                    <Text>{filters.dateRange.to || 'YYYY-MM-DD'}</Text>
                                </TouchableOpacity>
                                {showToDatePicker && (
                                    <DateTimePicker
                                        value={filters.dateRange.to ? new Date(filters.dateRange.to) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowToDatePicker(false);
                                            if (selectedDate) {
                                                const formatted = selectedDate.toISOString().split('T')[0];
                                                setFilters({
                                                    ...filters,
                                                    dateRange: { ...filters.dateRange, to: formatted }
                                                });
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        </View>

                        <Text style={styles.filterSectionTitle}>Price Range (RM)</Text>
                        <View style={styles.priceRangeContainer}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Min"
                                keyboardType="numeric"
                                value={filters.priceRange.min}
                                onChangeText={(text) => setFilters({
                                    ...filters,
                                    priceRange: { ...filters.priceRange, min: text }
                                })}
                            />
                            <Text style={styles.priceSeparator}>-</Text>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Max"
                                keyboardType="numeric"
                                value={filters.priceRange.max}
                                onChangeText={(text) => setFilters({
                                    ...filters,
                                    priceRange: { ...filters.priceRange, max: text }
                                })}
                            />
                        </View>

                        <Text style={styles.filterSectionTitle}>Distance (km)</Text>
                        <View style={styles.distanceFilterContainer}>
                            {locationError ? (
                                <View style={styles.locationErrorContainer}>
                                    <Ionicons name="alert-circle-outline" size={16} color={MSMEColors.error} />
                                    <Text style={styles.locationErrorText}>
                                        {locationError.includes('denied')
                                            ? 'Location access denied. Enable in settings to use distance filters.'
                                            : 'Could not get your location.'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={requestLocationPermission}
                                    >
                                        <Text style={styles.retryButtonText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : locationLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={MSMEColors.groupBuy} />
                                    <Text style={styles.loadingText}>Getting your location...</Text>
                                </View>
                            ) : (
                                <>
                                    <TextInput
                                        style={styles.distanceInput}
                                        placeholder="Max distance"
                                        keyboardType="numeric"
                                        value={filters.distance || ''}
                                        onChangeText={(text) => setFilters({
                                            ...filters,
                                            distance: text
                                        })}
                                    />
                                    {userLocation && (
                                        <View style={styles.currentLocationInfo}>
                                            <Ionicons name="navigate" size={14} color={MSMEColors.success} />
                                            <Text style={styles.currentLocationText}>
                                                Using your current location
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        <Text style={styles.filterSectionTitle}>Sort By</Text>
                        <View style={styles.sortOptionsContainer}>
                            {sortOptions.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.sortOption,
                                        filters.sortBy === option.value && styles.selectedSortOption,
                                        // Disable distance sorting if no location permission
                                        option.value === 'distance' && !userLocation && styles.disabledSortOption
                                    ]}
                                    onPress={() => {
                                        // Don't allow distance sorting without location
                                        if (option.value === 'distance' && !userLocation) {
                                            requestLocationPermission();
                                            return;
                                        }
                                        setFilters({ ...filters, sortBy: option.value })
                                    }}
                                >
                                    <Text style={[
                                        styles.sortOptionText,
                                        filters.sortBy === option.value && styles.selectedSortOptionText,
                                        option.value === 'distance' && !userLocation && styles.disabledSortOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.applyFiltersButton}
                        onPress={() => setIsFilterVisible(false)}
                    >
                        <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Render the search bar and filter icon
    const renderSearchBar = () => (
        <View style={styles.searchBarContainer}>
            <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color={MSMEColors.darkGray} style={{ marginLeft: 8, marginRight: 4 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={MSMEColors.mutedForeground}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    getActiveFilterCount() > 0 && styles.activeFilterButton
                ]}
                onPress={() => setIsFilterVisible(!isFilterVisible)}
            >
                <Ionicons
                    name="filter"
                    size={22}
                    color={getActiveFilterCount() > 0 ? MSMEColors.white : MSMEColors.groupBuy}
                />
                {getActiveFilterCount() > 0 && (
                    <View style={styles.filterCountBadge}>
                        <Text style={styles.filterCountText}>{getActiveFilterCount()}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    // Card UI improvements: bolder titles, clearer meta info, spacing
    const renderBulkOrderItem = ({ item, index }) => {
        if (!item || typeof item !== 'object') {
            console.error('renderBulkOrderItem: Invalid item', item);
            return <Text style={{ color: 'red' }}>Invalid item in BulkOrder: {String(item)}</Text>;
        }

        // Get distance text if user location is available
        const distanceText = getDistanceText(item);

        // Check if this item is saved
        const saved = isItemSaved('group', item.id);

        return (
            <AnimatedCard
                mode="elevated"
                style={styles.bulkOrderCard}
                entering={FadeInDown.delay(100 * index).springify()}
            >

                <Card.Content style={styles.cardContent}>
                    <View style={styles.bulkOrderHeader}>

                        <View style={styles.bulkOrderInfo}>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Text style={styles.bulkOrderTitleImproved} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                                    {item.isMine && (
                                        <View style={styles.myGroupBadge}>
                                            <Text style={styles.myGroupBadgeText}>My Group</Text>
                                        </View>
                                    )}
                                    {item.joined && !item.isMine && (
                                        <View style={styles.joinedGroupBadge}>
                                            <Text style={styles.joinedGroupBadgeText}>Joined</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => toggleSaveItem('group', item.id)}
                                    >
                                        <Ionicons
                                            name={saved ? "bookmark" : "bookmark-outline"}
                                            size={20}
                                            color={saved ? MSMEColors.success : MSMEColors.darkGray}
                                        />
                                    </TouchableOpacity>

                                    {(item.isMine || item.joined) && (
                                        <TouchableOpacity
                                            style={styles.groupMenuButton}
                                            onPress={() => {
                                                setSelectedGroupId(item.id);
                                                setGroupMenuVisible(true);
                                            }}
                                        >
                                            <Ionicons name="ellipsis-vertical" size={20} color={MSMEColors.darkGray} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.metaContainerImproved}>
                                <View style={styles.bulkOrderStats}>
                                    <View style={styles.bulkOrderStat}>
                                        <Ionicons name="people-outline" size={14} color={Colors.darkGray || MSMEColors.darkGray} />
                                        <Text style={styles.bulkOrderStatText}>{item.participants}</Text>
                                    </View>
                                    <View style={styles.bulkOrderStat}>
                                        <Ionicons name="cube-outline" size={14} color={Colors.darkGray || MSMEColors.darkGray} />
                                        <Text style={styles.bulkOrderStatText}>{item.itemsCount}</Text>
                                    </View>
                                </View>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{item.category}</Text>
                                </View>
                            </View>

                        </View>
                    </View>

                    <Text style={styles.bulkOrderDescriptionImproved} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>

                    {/* Location information */}
                    {item.location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={14} color={Colors.darkGray || MSMEColors.darkGray} />
                            <Text style={styles.locationText}>{item.location}</Text>
                            {distanceText ? (
                                <View style={styles.distanceBadge}>
                                    <Text style={styles.distanceText}>{distanceText}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    {/* Progress bar for minimum order targets - show for own groups and joined groups */}
                    {(item.isMine || item.joined) && item.targetQuantity && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressLabelContainer}>
                                <Text style={styles.progressLabel}>Progress toward minimum order:</Text>
                                <Text style={styles.progressValue}>
                                    {item.currentQuantity || 0}/{item.targetQuantity} units
                                </Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${Math.min(((item.currentQuantity || 0) / item.targetQuantity) * 100, 100)}%`,
                                            backgroundColor: ((item.currentQuantity || 0) / item.targetQuantity) >= 1 ?
                                                MSMEColors.success : MSMEColors.groupBuy
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.bulkOrderFooter}>
                        <View style={styles.deadlineContainer}>
                            <Ionicons name="time-outline" size={16} color={Colors.darkGray || MSMEColors.darkGray} />
                            <Text style={styles.deadlineText}>Closes: {item.deadline}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.joinButtonContainer}
                            onPress={() => item.isMine || item.joined ? handleViewMembers(item.id) : handleJoinGroup(item.id)}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.joinButton}
                            >
                                <Text style={styles.joinButtonText}>
                                    {item.isMine ? "View Members" : item.joined ? "View Group" : "Join Group"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Card.Content>
            </AnimatedCard>
        );
    };

    // Card UI improvements for inventory
    const renderInventoryItem = ({ item, index }) => {
        if (!item || typeof item !== 'object') {
            console.error('renderInventoryItem: Invalid item', item);
            return <Text style={{ color: 'red' }}>Invalid item in Inventory: {String(item)}</Text>;
        }
        const isOffer = item.type === 'offer';

        // Check if this item is saved
        const saved = isItemSaved('listing', item.id);

        // Get distance text if user location is available
        const distanceText = getDistanceText(item);

        return (
            <AnimatedCard
                mode="elevated"
                style={[
                    styles.inventoryCard,
                    isOffer ? { borderLeftColor: MSMEColors.stockGood, borderLeftWidth: 4 } :
                        { borderLeftColor: MSMEColors.groupBuy, borderLeftWidth: 4 }
                ]}
                entering={FadeInDown.delay(100 * index).springify()}
            >
                <Card.Content>
                    <View style={styles.inventoryHeader}>
                        <View style={styles.userInfo}>
                            <Text style={styles.userNameImproved}>{item.userName}</Text>
                            <Text style={styles.postedDate}>{`Posted: ${item.posted}`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => toggleSaveItem('listing', item.id)}
                            >
                                <Ionicons
                                    name={saved ? "bookmark" : "bookmark-outline"}
                                    size={20}
                                    color={saved ? MSMEColors.success : MSMEColors.darkGray}
                                />
                            </TouchableOpacity>

                            <View style={[
                                styles.typeBadge,
                                isOffer ? styles.offerBadge : styles.needBadge
                            ]}>
                                <Ionicons
                                    name={isOffer ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                                    size={14}
                                    color={isOffer ? MSMEColors.stockGood : MSMEColors.groupBuy}
                                />
                                <Text style={[styles.typeText, {
                                    color: isOffer ? MSMEColors.stockGood : MSMEColors.groupBuy
                                }]}
                                >
                                    {isOffer ? 'Offering' : 'Seeking'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.inventoryTitleImproved}>{item.title}</Text>
                    <Text style={styles.inventoryDescriptionImproved} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>

                    {/* Location information */}
                    {item.location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={14} color={Colors.darkGray || MSMEColors.darkGray} />
                            <Text style={styles.locationText}>{item.location}</Text>
                            {distanceText ? (
                                <View style={styles.distanceBadge}>
                                    <Text style={styles.distanceText}>{distanceText}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    <View style={styles.inventoryDetails}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Quantity:</Text>
                                <Text style={styles.detailValue}>{item.quantity}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Price:</Text>
                                <Text style={styles.detailValue}>{item.price}</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Category:</Text>
                                <Text style={styles.detailValue}>{item.category}</Text>
                            </View>
                            {item.expiry && (
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Available Until:</Text>
                                    <Text style={styles.detailValue}>{item.expiry}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity style={styles.contactButtonContainer}>
                        <LinearGradient
                            colors={isOffer ? MSMEColors.gradientSuccess : MSMEColors.gradientWarm}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.contactButton}
                        >
                            <Text style={styles.contactButtonText}>Contact</Text>
                            <Ionicons name="chatbubble-outline" size={16} color={MSMEColors.white} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Card.Content>
            </AnimatedCard>
        );
    };

    // Render the appropriate list based on the active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Active Groups':
                return (
                    <View style={{ flex: 1 }}>
                        {renderSearchBar()}
                        {renderFilterPanel()}
                        {renderActiveFilters()}
                        <AnimatedTouchableOpacity
                            style={styles.addListingButton}
                            onPress={() => setGroupModalVisible(true)}
                            entering={FadeIn.delay(100).springify()}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
                            <Text style={styles.addListingButtonText}>Start a Resource Sharing Group</Text>
                        </AnimatedTouchableOpacity>
                        <FlatList
                            data={filteredData.bulkOrders.filter(item => item && typeof item === 'object')}
                            renderItem={renderBulkOrderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="funnel-outline" size={64} color="#DDD" />
                                    <Text style={styles.emptyStateText}>No matching results</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Try adjusting your filters
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                );
            case 'Marketplace':
                return (
                    <View style={{ flex: 1 }}>
                        {renderSearchBar()}
                        {renderFilterPanel()}
                        {renderActiveFilters()}

                        <FlatList
                            data={filteredData.inventory.filter(item => item && typeof item === 'object')}
                            renderItem={renderInventoryItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="funnel-outline" size={64} color="#DDD" />
                                    <Text style={styles.emptyStateText}>No matching results</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Try adjusting your filters
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                );
            case 'My Activities':
                return (
                    <View style={{ flex: 1 }}>
                        {renderSearchBar()}
                        {renderFilterPanel()}
                        {renderActiveFilters()}
                        <AnimatedTouchableOpacity
                            style={styles.addListingButton}
                            onPress={() => setModalVisible(true)}
                            entering={FadeIn.delay(100).springify()}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={MSMEColors.white} />
                            <Text style={styles.addListingButtonText}>Share or Request Resources</Text>
                        </AnimatedTouchableOpacity>
                        <FlatList
                            data={filteredData.myListings.filter(item => item && typeof item === 'object')}
                            renderItem={renderInventoryItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                getActiveFilterCount() > 0 ? (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="funnel-outline" size={64} color="#DDD" />
                                        <Text style={styles.emptyStateText}>No matching results</Text>
                                        <Text style={styles.emptyStateSubtext}>
                                            Try adjusting your filters
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="clipboard-outline" size={64} color="#DDD" />
                                        <Text style={styles.emptyStateText}>No listings yet</Text>
                                        <Text style={styles.emptyStateSubtext}>
                                            Share what you have or request what you need
                                        </Text>
                                    </View>
                                )
                            }
                        />
                    </View>
                );
            case 'Saved':
                return (
                    <View style={{ flex: 1 }}>
                        {renderSearchBar()}
                        {renderFilterPanel()}
                        {renderActiveFilters()}

                        {savedItems.length > 0 ? (
                            <FlatList
                                data={savedItems.filter(item => {
                                    // Apply search
                                    if (searchQuery.trim() !== '') {
                                        const query = searchQuery.toLowerCase().trim();
                                        return (
                                            item.title.toLowerCase().includes(query) ||
                                            item.description.toLowerCase().includes(query) ||
                                            item.category.toLowerCase().includes(query) ||
                                            (item.location && item.location.toLowerCase().includes(query))
                                        );
                                    }
                                    return true;
                                })}
                                renderItem={({ item, index }) => (
                                    item.type === 'group' ?
                                        renderBulkOrderItem({ item, index }) :
                                        renderInventoryItem({ item, index })
                                )}
                                keyExtractor={item => `${item.type}-${item.id}`}
                                contentContainerStyle={styles.listContainer}
                                showsVerticalScrollIndicator={false}
                                ListHeaderComponent={
                                    <Text style={styles.savedTabHeader}>
                                        Your Saved Items ({savedItems.length})
                                    </Text>
                                }
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Ionicons name="bookmark-outline" size={64} color="#DDD" />
                                        <Text style={styles.emptyStateText}>No saved items</Text>
                                        <Text style={styles.emptyStateSubtext}>
                                            Save groups or listings to view them here
                                        </Text>
                                    </View>
                                }
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="bookmark-outline" size={64} color="#DDD" />
                                <Text style={styles.emptyStateText}>No saved items</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Tap the bookmark icon on any group or listing to save it for quick access
                                </Text>
                            </View>
                        )}
                    </View>
                );
            default:
                return null;
        }
    };

    // Modal for adding a new listing
    const renderAddListingModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Share Resources</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.typeOption,
                                newListingType === 'offer' && styles.activeTypeOption,
                            ]}
                            onPress={() => setNewListingType('offer')}
                        >
                            <Text style={[
                                styles.typeOptionText,
                                newListingType === 'offer' && styles.activeTypeOptionText
                            ]}>
                                I'm Offering Resources
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.typeOption,
                                newListingType === 'need' && styles.activeTypeOption,
                            ]}
                            onPress={() => setNewListingType('need')}
                        >
                            <Text style={[
                                styles.typeOptionText,
                                newListingType === 'need' && styles.activeTypeOptionText
                            ]}>
                                I'm Seeking Resources
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Title</Text>
                            <TextInput
                                style={styles.formInput}
                                value={newListing.title}
                                onChangeText={(text) => setNewListing({ ...newListing, title: text })}
                                placeholder="Enter a descriptive title"
                            />
                        </View>

                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                value={newListing.description}
                                onChangeText={(text) => setNewListing({ ...newListing, description: text })}
                                placeholder="Provide details about your listing"
                                multiline={true}
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.formLabel}>Quantity</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newListing.quantity}
                                    onChangeText={(text) => setNewListing({ ...newListing, quantity: text })}
                                    placeholder="Amount or units"
                                />
                            </View>

                            <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.formLabel}>Price</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newListing.price}
                                    onChangeText={(text) => setNewListing({ ...newListing, price: text })}
                                    placeholder="Price or 'Negotiable'"
                                />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.formLabel}>Category</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newListing.category}
                                    onChangeText={(text) => setNewListing({ ...newListing, category: text })}
                                    placeholder="e.g. Supplies, Equipment"
                                />
                            </View>

                            <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.formLabel}>Valid Until (Optional)</Text>
                                <TouchableOpacity
                                    style={styles.formInput}
                                    onPress={() => setShowExpiryPicker(true)}
                                >
                                    <Text>{newListing.expiry || 'YYYY-MM-DD'}</Text>
                                </TouchableOpacity>
                                {showExpiryPicker && (
                                    <DateTimePicker
                                        value={newListing.expiry ? new Date(newListing.expiry) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowExpiryPicker(false);
                                            if (selectedDate) {
                                                const formatted = selectedDate.toISOString().split('T')[0];
                                                setNewListing({ ...newListing, expiry: formatted });
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.formLabel}>Location</Text>
                                <TouchableOpacity
                                    style={styles.formInput}
                                    onPress={() => useCurrentLocationForForm('listing')}
                                >
                                    <Text>{newListing.location || 'Tap to add location'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.submitButtonContainer}
                            onPress={addNewListing}
                        >
                            <LinearGradient
                                colors={MSMEColors.gradientWarm}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButton}
                            >
                                <Text style={styles.submitButtonText}>Add Listing</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderAddGroupModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={groupModalVisible}
            onRequestClose={() => setGroupModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create Sharing Group</Text>
                        <TouchableOpacity onPress={() => setGroupModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.formContainer}>
                        <View style={styles.formInfo}>
                            <Ionicons name="information-circle-outline" size={16} color={MSMEColors.groupBuy} />
                            <Text style={styles.formInfoText}>
                                Create a group to coordinate bulk purchases, share resources, or reduce waste together with other businesses.
                            </Text>
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Title</Text>
                            <TextInput
                                style={styles.formInput}
                                value={newGroup.title}
                                onChangeText={(text) => setNewGroup({ ...newGroup, title: text })}
                                placeholder="Enter a descriptive title"
                            />
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                value={newGroup.description}
                                onChangeText={(text) => setNewGroup({ ...newGroup, description: text })}
                                placeholder="Describe the group buy"
                                multiline={true}
                                numberOfLines={4}
                            />
                        </View>
                        <View style={styles.formRow}>
                            <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.formLabel}>Category</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newGroup.category}
                                    onChangeText={(text) => setNewGroup({ ...newGroup, category: text })}
                                    placeholder="e.g. Packaging, Ingredients"
                                />
                            </View>
                            <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.formLabel}>Deadline</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newGroup.deadline}
                                    onChangeText={(text) => setNewGroup({ ...newGroup, deadline: text })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>External Contact Link</Text>
                            <TextInput
                                style={styles.formInput}
                                value={newGroup.contact}
                                onChangeText={(text) => setNewGroup({ ...newGroup, contact: text })}
                                placeholder="Paste WhatsApp/Telegram/other link"
                            />
                        </View>
                        <View style={styles.formRow}>
                            <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.formLabel}>Location</Text>
                                <TouchableOpacity
                                    style={styles.formInput}
                                    onPress={() => useCurrentLocationForForm('group')}
                                >
                                    <Text>{newGroup.location || 'Tap to add location'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setGroupModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButtonContainer}
                            onPress={addNewGroup}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButton}
                            >
                                <Text style={styles.submitButtonText}>Create</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Add group management functions
    const handleEditGroup = (groupId) => {
        const group = [...userGroups, ...bulkOrders].find(g => g.id === groupId);
        if (group) {
            setSelectedGroup({ ...group });
            setGroupMenuVisible(false);
            setGroupEditModalVisible(true);
        }
    };

    const handleCloseGroup = (groupId) => {
        // Update the status of the group to "Closed"
        const updatedGroups = userGroups.map(group =>
            group.id === groupId
                ? { ...group, status: 'Closed' }
                : group
        );
        setUserGroups(updatedGroups);
        setGroupMenuVisible(false);

        // Update filtered data
        setFilteredData(prev => ({
            ...prev,
            bulkOrders: prev.bulkOrders.map(order =>
                order.id === groupId
                    ? { ...order, status: 'Closed' }
                    : order
            )
        }));
    };

    const handleDeleteGroup = (groupId) => {
        // Remove the group from userGroups
        const updatedGroups = userGroups.filter(group => group.id !== groupId);
        setUserGroups(updatedGroups);
        setGroupMenuVisible(false);

        // Update filtered data
        setFilteredData(prev => ({
            ...prev,
            bulkOrders: prev.bulkOrders.filter(order => order.id !== groupId)
        }));
    };

    const saveGroupChanges = () => {
        if (!selectedGroup) return;

        // Update the group in userGroups
        const updatedGroups = userGroups.map(group =>
            group.id === selectedGroup.id
                ? { ...selectedGroup }
                : group
        );

        setUserGroups(updatedGroups);

        // Update filtered data
        setFilteredData(prev => ({
            ...prev,
            bulkOrders: prev.bulkOrders.map(order =>
                order.id === selectedGroup.id
                    ? { ...selectedGroup }
                    : order
            )
        }));

        setGroupEditModalVisible(false);
        setSelectedGroup(null);
    };

    // Add group management menu modal
    const renderGroupManagementMenu = () => {
        const group = [...userGroups, ...bulkOrders].find(g => g.id === selectedGroupId);
        const isJoinedGroup = group?.joined && !group?.isMine;

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={groupMenuVisible}
                onRequestClose={() => setGroupMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.menuModalOverlay}
                    activeOpacity={1}
                    onPress={() => setGroupMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        {/* Options for groups created by the user */}
                        {!isJoinedGroup && (
                            <>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleEditGroup(selectedGroupId)}
                                >
                                    <Ionicons name="create-outline" size={20} color={MSMEColors.darkGray} />
                                    <Text style={styles.menuItemText}>Edit Group</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleViewMembers(selectedGroupId)}
                                >
                                    <Ionicons name="people-outline" size={20} color={MSMEColors.darkGray} />
                                    <Text style={styles.menuItemText}>Manage Members</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleCloseGroup(selectedGroupId)}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color={MSMEColors.success} />
                                    <Text style={styles.menuItemText}>Mark as Complete</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleDeleteGroup(selectedGroupId)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={MSMEColors.error} />
                                    <Text style={styles.menuItemText}>Delete Group</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Options for groups joined by the user */}
                        {isJoinedGroup && (
                            <>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleViewMembers(selectedGroupId)}
                                >
                                    <Ionicons name="people-outline" size={20} color={MSMEColors.darkGray} />
                                    <Text style={styles.menuItemText}>View Members</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleViewChat(selectedGroupId)}
                                >
                                    <Ionicons name="chatbubble-outline" size={20} color={MSMEColors.groupBuy} />
                                    <Text style={styles.menuItemText}>Group Chat</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleUpdateQuantity(selectedGroupId)}
                                >
                                    <Ionicons name="refresh-outline" size={20} color={MSMEColors.darkGray} />
                                    <Text style={styles.menuItemText}>Update My Quantity</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleLeaveGroup(selectedGroupId)}
                                >
                                    <Ionicons name="exit-outline" size={20} color={MSMEColors.error} />
                                    <Text style={styles.menuItemText}>Leave Group</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    // Add group edit modal
    const renderGroupEditModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={groupEditModalVisible}
            onRequestClose={() => setGroupEditModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Sharing Group</Text>
                        <TouchableOpacity onPress={() => setGroupEditModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    {selectedGroup && (
                        <ScrollView style={styles.formContainer}>
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Title</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={selectedGroup.title}
                                    onChangeText={(text) => setSelectedGroup({ ...selectedGroup, title: text })}
                                    placeholder="Enter a descriptive title"
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Description</Text>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    value={selectedGroup.description}
                                    onChangeText={(text) => setSelectedGroup({ ...selectedGroup, description: text })}
                                    placeholder="Describe the group buy"
                                    multiline={true}
                                    numberOfLines={4}
                                />
                            </View>
                            <View style={styles.formRow}>
                                <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.formLabel}>Category</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={selectedGroup.category}
                                        onChangeText={(text) => setSelectedGroup({ ...selectedGroup, category: text })}
                                        placeholder="e.g. Packaging, Ingredients"
                                    />
                                </View>
                                <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.formLabel}>Deadline</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={selectedGroup.deadline}
                                        onChangeText={(text) => setSelectedGroup({ ...selectedGroup, deadline: text })}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </View>
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>External Contact Link</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={selectedGroup.contact}
                                    onChangeText={(text) => setSelectedGroup({ ...selectedGroup, contact: text })}
                                    placeholder="Paste WhatsApp/Telegram/other link"
                                />
                            </View>
                            <View style={styles.formRow}>
                                <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.formLabel}>Location</Text>
                                    <TouchableOpacity
                                        style={styles.formInput}
                                        onPress={() => useCurrentLocationForForm('edit')}
                                    >
                                        <Text>{selectedGroup.location || 'Tap to add location'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Add target quantity field for tracking progress */}
                            <View style={styles.formRow}>
                                <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.formLabel}>Target Quantity</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={selectedGroup.targetQuantity ? selectedGroup.targetQuantity.toString() : ''}
                                        onChangeText={(text) => setSelectedGroup({
                                            ...selectedGroup,
                                            targetQuantity: text ? parseInt(text) : null
                                        })}
                                        placeholder="Min. units to place order"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.formLabel}>Current Quantity</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={selectedGroup.currentQuantity ? selectedGroup.currentQuantity.toString() : '0'}
                                        onChangeText={(text) => setSelectedGroup({
                                            ...selectedGroup,
                                            currentQuantity: text ? parseInt(text) : 0
                                        })}
                                        placeholder="Current committed units"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    )}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setGroupEditModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButtonContainer}
                            onPress={saveGroupChanges}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButton}
                            >
                                <Text style={styles.submitButtonText}>Save Changes</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Add function to toggle save status of an item
    const toggleSaveItem = (itemType, itemId) => {
        // Check if the item is already saved
        const existingItemIndex = savedItems.findIndex(
            item => item.id === itemId && item.type === itemType
        );

        if (existingItemIndex >= 0) {
            // Item is already saved, remove it
            const updatedSavedItems = [...savedItems];
            updatedSavedItems.splice(existingItemIndex, 1);
            setSavedItems(updatedSavedItems);
            return false; // Return false to indicate item was unsaved
        } else {
            // Item is not saved, add it
            let itemToSave;

            if (itemType === 'group') {
                // Find the group from bulkOrders or userGroups
                const group = [...userGroups, ...bulkOrders].find(g => g.id === itemId);
                if (group) {
                    itemToSave = { ...group, type: itemType };
                }
            } else if (itemType === 'listing') {
                // Find the listing from inventory or myListings
                const listing = [...availableItems, ...myListings].find(l => l.id === itemId);
                if (listing) {
                    itemToSave = { ...listing, type: itemType };
                }
            }

            if (itemToSave) {
                setSavedItems([...savedItems, itemToSave]);
                return true; // Return true to indicate item was saved
            }
        }

        return false;
    };

    // Helper to check if an item is saved
    const isItemSaved = (itemType, itemId) => {
        return savedItems.some(item => item.id === itemId && item.type === itemType);
    };

    // Function to handle joining a group
    const handleJoinGroup = (groupId) => {
        setJoiningGroupId(groupId);
        setJoinGroupQuantity('');
        setJoinGroupModalVisible(true);
    };

    // Update confirmJoinGroup function to handle both joining and updating
    const confirmJoinGroup = () => {
        const groupId = joiningGroupId;
        const quantityNum = parseInt(joinGroupQuantity, 10);

        if (!groupId || isNaN(quantityNum) || quantityNum <= 0) {
            return;
        }

        // Get the group details
        const group = [...userGroups, ...bulkOrders].find(g => g.id === groupId);
        if (!group) return;

        // Check if user is already a member
        const groupMembersList = groupMembers[groupId] || [];
        const existingMember = groupMembersList.find(m => m.name === 'Your Business');
        const isUpdating = !!existingMember;

        if (isUpdating) {
            // Update existing membership
            const updatedMembers = groupMembersList.map(member =>
                member.name === 'Your Business'
                    ? { ...member, quantity: quantityNum }
                    : member
            );

            // Update the members list
            setGroupMembers(prev => ({
                ...prev,
                [groupId]: updatedMembers
            }));

            // Calculate new total quantity
            const newTotalQuantity = updatedMembers.reduce((total, member) =>
                total + (member.quantity || 0), 0
            );

            // Update filtered data
            setFilteredData(prev => ({
                ...prev,
                bulkOrders: prev.bulkOrders.map(order =>
                    order.id === groupId ? {
                        ...order,
                        currentQuantity: newTotalQuantity
                    } : order
                )
            }));

            // Add message to the chat
            const updateMessage = {
                id: `msg${Math.random().toString(36).substring(2, 9)}`,
                sender: 'Your Business',
                text: `I've updated my order quantity to ${quantityNum} units.`,
                timestamp: new Date().toISOString()
            };

            setGroupMessages(prev => {
                const groupMessageList = prev[groupId] || [];
                return {
                    ...prev,
                    [groupId]: [...groupMessageList, updateMessage]
                };
            });

            // Show confirmation
            alert(`Your quantity has been updated to ${quantityNum} units.`);
        } else {
            // Create a new member entry
            const newMember = {
                id: `m${Math.random().toString(36).substring(2, 9)}`,
                name: 'Your Business',
                joinDate: new Date().toISOString().split('T')[0],
                quantity: quantityNum,
                status: 'confirmed'
            };

            // Update the members list for this group
            setGroupMembers(prev => {
                const groupMembersList = prev[groupId] || [];
                return {
                    ...prev,
                    [groupId]: [...groupMembersList, newMember]
                };
            });

            // Create a local copy of the members including the new one for quantity calculation
            const existingMembers = [...(groupMembers[groupId] || [])];
            // Add new member for calculation purposes
            existingMembers.push(newMember);
            // Calculate total quantity with the new member included
            const newTotalQuantity = existingMembers.reduce((total, member) => total + (member.quantity || 0), 0);

            // Update the bulkOrders data
            if (group.isMine) {
                // If it's the user's own group
                setUserGroups(prev =>
                    prev.map(g =>
                        g.id === groupId ? {
                            ...g,
                            participants: (g.participants || 0) + 1,
                            currentQuantity: newTotalQuantity
                        } : g
                    )
                );
            }

            // Update filtered data for both user groups and sample groups
            setFilteredData(prev => {
                return {
                    ...prev,
                    bulkOrders: prev.bulkOrders.map(order =>
                        order.id === groupId ? {
                            ...order,
                            participants: (order.participants || 0) + 1,
                            currentQuantity: newTotalQuantity,
                            joined: true // Mark as joined!
                        } : order
                    )
                };
            });

            // Create initial chat message
            const initialMessage = {
                id: `msg${Math.random().toString(36).substring(2, 9)}`,
                sender: 'Your Business',
                text: `Hi everyone! I've just joined with ${quantityNum} units.`,
                timestamp: new Date().toISOString()
            };

            // Add initial message to the group chat
            setGroupMessages(prev => {
                const groupMessageList = prev[groupId] || [];
                return {
                    ...prev,
                    [groupId]: [...groupMessageList, initialMessage]
                };
            });

            // Show success message
            alert(`You've successfully joined the group "${group.title}" with ${quantityNum} units.`);
        }

        // Reset modal state
        setJoinGroupModalVisible(false);
        setJoiningGroupId(null);
        setJoinGroupQuantity('');
    };

    // Function to handle view members
    const handleViewMembers = (groupId) => {
        // Update current quantity from members data before showing the modal
        const currentMembers = groupMembers[groupId] || [];
        const currentQuantity = currentMembers.reduce((total, member) => total + (member.quantity || 0), 0);

        // Update the filtered data with the correct quantity
        setFilteredData(prev => {
            return {
                ...prev,
                bulkOrders: prev.bulkOrders.map(order =>
                    order.id === groupId ? {
                        ...order,
                        currentQuantity: currentQuantity
                    } : order
                )
            };
        });

        // If it's a user group, update the user groups state too
        const isUserGroup = userGroups.some(g => g.id === groupId);
        if (isUserGroup) {
            setUserGroups(prev =>
                prev.map(g =>
                    g.id === groupId ? {
                        ...g,
                        currentQuantity: currentQuantity
                    } : g
                )
            );
        }

        // Set to members tab (index 0)
        setMemberModalActiveTab(0);
        setSelectedGroupId(groupId);
        setGroupMenuVisible(false);
        setMemberManagementVisible(true);
    };

    // Function to send a message in the group chat
    const handleSendMessage = (groupId) => {
        if (!newMessageText.trim()) return;

        // Create new message
        const newMessage = {
            id: `msg${Math.random().toString(36).substring(2, 9)}`,
            sender: 'Your Business',
            text: newMessageText.trim(),
            timestamp: new Date().toISOString()
        };

        // Add to messages
        setGroupMessages(prev => {
            const groupMessageList = prev[groupId] || [];
            return {
                ...prev,
                [groupId]: [...groupMessageList, newMessage]
            };
        });

        // Clear input
        setNewMessageText('');
    };

    // Function to format timestamp for display
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Member management modal
    const renderMemberManagementModal = () => {
        const group = [...userGroups, ...bulkOrders].find(g => g.id === selectedGroupId);
        const members = groupMembers[selectedGroupId] || [];
        const messages = groupMessages[selectedGroupId] || [];

        // Calculate total committed quantity
        const totalQuantity = members.reduce((sum, member) => sum + member.quantity, 0);

        // Determine if target has been met
        const targetMet = group?.targetQuantity && totalQuantity >= group.targetQuantity;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={memberManagementVisible}
                onRequestClose={() => setMemberManagementVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { maxHeight: '90%', width: '95%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Group Details</Text>
                            <TouchableOpacity onPress={() => setMemberManagementVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {group && (
                            <View style={styles.groupDetailsHeader}>
                                <Text style={styles.groupDetailsTitle}>{group.title}</Text>
                                <View style={[styles.groupStatusBadge,
                                group.status === 'Closed'
                                    ? styles.closedGroupBadge
                                    : targetMet
                                        ? styles.completedGroupBadge
                                        : styles.activeGroupBadge
                                ]}>
                                    <Text style={styles.groupStatusText}>
                                        {group.status === 'Closed'
                                            ? 'Closed'
                                            : targetMet
                                                ? 'Target Met'
                                                : 'Active'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <TabView
                            navigationState={{
                                index: memberModalActiveTab,
                                routes: [
                                    { key: 'members', title: `Members (${members.length})` },
                                    { key: 'chat', title: 'Group Chat' }
                                ]
                            }}
                            onIndexChange={setMemberModalActiveTab}
                            renderScene={({ route }) => {
                                switch (route.key) {
                                    case 'members':
                                        return (
                                            <View style={styles.memberTabContent}>
                                                {group?.targetQuantity && (
                                                    <View style={styles.orderProgressContainer}>
                                                        <View style={styles.orderProgressHeader}>
                                                            <Text style={styles.orderProgressTitle}>Order Progress</Text>
                                                            <Text style={styles.orderProgressStats}>
                                                                {totalQuantity} / {group.targetQuantity} units
                                                            </Text>
                                                        </View>

                                                        <View style={styles.progressBarBackground}>
                                                            <View
                                                                style={[
                                                                    styles.progressBarFill,
                                                                    {
                                                                        width: `${Math.min((totalQuantity / group.targetQuantity) * 100, 100)}%`,
                                                                        backgroundColor: totalQuantity >= group.targetQuantity ?
                                                                            MSMEColors.success : MSMEColors.groupBuy
                                                                    }
                                                                ]}
                                                            />
                                                        </View>

                                                        {targetMet ? (
                                                            <Text style={styles.targetMetMessage}>
                                                                Target quantity reached! Ready to place order.
                                                            </Text>
                                                        ) : (
                                                            <Text style={styles.targetPendingMessage}>
                                                                Need {group.targetQuantity - totalQuantity} more units to reach target.
                                                            </Text>
                                                        )}
                                                    </View>
                                                )}

                                                <View style={styles.membersListHeader}>
                                                    <Text style={styles.memberHeaderCell}>Member</Text>
                                                    <Text style={styles.memberHeaderCell}>Join Date</Text>
                                                    <Text style={styles.memberHeaderCell}>Quantity</Text>
                                                    <Text style={styles.memberHeaderCell}>Status</Text>
                                                </View>

                                                <FlatList
                                                    data={members}
                                                    keyExtractor={(item) => item.id}
                                                    renderItem={({ item }) => (
                                                        <View style={styles.memberRow}>
                                                            <Text style={styles.memberCell} numberOfLines={1}>{item.name}</Text>
                                                            <Text style={styles.memberCell}>{item.joinDate}</Text>
                                                            <Text style={styles.memberCellQuantity}>{item.quantity}</Text>
                                                            <View style={[
                                                                styles.memberStatusBadge,
                                                                item.status === 'confirmed'
                                                                    ? styles.confirmedStatusBadge
                                                                    : styles.pendingStatusBadge
                                                            ]}>
                                                                <Text style={styles.memberStatusText}>{item.status}</Text>
                                                            </View>
                                                        </View>
                                                    )}
                                                    ListEmptyComponent={
                                                        <View style={styles.emptyMembersList}>
                                                            <Text style={styles.emptyMembersText}>No members yet.</Text>
                                                        </View>
                                                    }
                                                />

                                                {/* Add update button for user's own quantity */}
                                                {group?.joined && !group?.isMine && members.some(m => m.name === 'Your Business') && (
                                                    <View style={styles.updateQuantityContainer}>
                                                        <TouchableOpacity
                                                            style={styles.updateQuantityButton}
                                                            onPress={() => {
                                                                // Close the member modal and open the update quantity modal
                                                                setMemberManagementVisible(false);
                                                                handleUpdateQuantity(selectedGroupId);
                                                            }}
                                                        >
                                                            <Ionicons name="refresh-outline" size={18} color={MSMEColors.white} />
                                                            <Text style={styles.updateQuantityButtonText}>Update My Quantity</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    case 'chat':
                                        return (
                                            <View style={styles.chatTabContent}>
                                                <FlatList
                                                    data={messages}
                                                    keyExtractor={(item) => item.id}
                                                    renderItem={({ item }) => (
                                                        <View style={[
                                                            styles.chatMessage,
                                                            item.sender === 'Your Business' ?
                                                                styles.outgoingMessage :
                                                                styles.incomingMessage
                                                        ]}>
                                                            {item.sender !== 'Your Business' && (
                                                                <Text style={styles.messageSender}>{item.sender}</Text>
                                                            )}
                                                            <View style={[
                                                                styles.messageBubble,
                                                                item.sender === 'Your Business' ?
                                                                    styles.outgoingBubble :
                                                                    styles.incomingBubble
                                                            ]}>
                                                                <Text style={styles.messageText}>{item.text}</Text>
                                                            </View>
                                                            <Text style={styles.messageTime}>{formatMessageTime(item.timestamp)}</Text>
                                                        </View>
                                                    )}
                                                    inverted={false}
                                                    contentContainerStyle={styles.chatMessagesContainer}
                                                    ListEmptyComponent={
                                                        <View style={styles.emptyChatContainer}>
                                                            <Text style={styles.emptyChatText}>No messages yet.</Text>
                                                            <Text style={styles.emptyChatSubtext}>
                                                                Start the conversation by sending a message below.
                                                            </Text>
                                                        </View>
                                                    }
                                                />

                                                <View style={styles.chatInputContainer}>
                                                    <TextInput
                                                        style={styles.chatInput}
                                                        value={newMessageText}
                                                        onChangeText={setNewMessageText}
                                                        placeholder="Type a message..."
                                                        multiline={true}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.sendButton}
                                                        onPress={() => handleSendMessage(selectedGroupId)}
                                                        disabled={!newMessageText.trim()}
                                                    >
                                                        <Ionicons
                                                            name="send"
                                                            size={24}
                                                            color={newMessageText.trim() ? MSMEColors.groupBuy : MSMEColors.mutedForeground}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    default:
                                        return null;
                                }
                            }}
                            renderTabBar={props => (
                                <TabBar
                                    {...props}
                                    style={styles.memberTabBar}
                                    labelStyle={styles.memberTabLabel}
                                    indicatorStyle={styles.memberTabIndicator}
                                    activeColor={MSMEColors.groupBuy}
                                    inactiveColor={MSMEColors.darkGray}
                                />
                            )}
                            style={styles.memberTabView}
                        />
                    </View>
                </View>
            </Modal>
        );
    };

    // Update renderJoinGroupModal to show different title based on whether the user is joining or updating
    const renderJoinGroupModal = () => {
        const group = [...userGroups, ...bulkOrders].find(g => g.id === joiningGroupId);

        // Check if user is already a member
        const isUpdating = group && groupMembers[group.id]?.some(m => m.name === 'Your Business');

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={joinGroupModalVisible}
                onRequestClose={() => setJoinGroupModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { width: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isUpdating
                                    ? `Update Quantity for ${group?.title || 'Group'}`
                                    : `Join ${group?.title || 'Group'}`}
                            </Text>
                            <TouchableOpacity onPress={() => setJoinGroupModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {group && (
                            <View style={styles.joinGroupContent}>
                                <Text style={styles.joinGroupDescription}>
                                    {isUpdating
                                        ? 'Update your order quantity for this group purchase:'
                                        : `You're joining a bulk purchase group for ${group.category.toLowerCase()}. How many units would you like to order?`}
                                </Text>

                                {group.targetQuantity && (
                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressLabelContainer}>
                                            <Text style={styles.progressLabel}>Group progress:</Text>
                                            <Text style={styles.progressValue}>
                                                {group.currentQuantity || 0}/{group.targetQuantity} units
                                            </Text>
                                        </View>
                                        <View style={styles.progressBarBackground}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    {
                                                        width: `${Math.min(((group.currentQuantity || 0) / group.targetQuantity) * 100, 100)}%`,
                                                        backgroundColor: ((group.currentQuantity || 0) / group.targetQuantity) >= 1 ?
                                                            MSMEColors.success : MSMEColors.groupBuy
                                                    }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )}

                                <Text style={styles.joinGroupQuantityLabel}>Your order quantity:</Text>
                                <TextInput
                                    style={styles.joinGroupQuantityInput}
                                    value={joinGroupQuantity}
                                    onChangeText={setJoinGroupQuantity}
                                    keyboardType="numeric"
                                    placeholder="Enter quantity"
                                />

                                <View style={styles.joinGroupNote}>
                                    <Ionicons name="information-circle-outline" size={16} color={MSMEColors.groupBuy} />
                                    <Text style={styles.joinGroupNoteText}>
                                        {isUpdating
                                            ? 'Changing your quantity will update the group\'s progress toward the minimum order target.'
                                            : 'By joining this group, you commit to purchase the quantity specified.'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setJoinGroupModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.submitButtonContainer,
                                    (!joinGroupQuantity || isNaN(parseInt(joinGroupQuantity, 10)) || parseInt(joinGroupQuantity, 10) <= 0) && styles.disabledButton
                                ]}
                                onPress={confirmJoinGroup}
                                disabled={!joinGroupQuantity || isNaN(parseInt(joinGroupQuantity, 10)) || parseInt(joinGroupQuantity, 10) <= 0}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitButton}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {isUpdating ? 'Update Quantity' : 'Join Group'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    // Add handlers for new menu options
    const handleViewChat = (groupId) => {
        setSelectedGroupId(groupId);
        // Set to chat tab (index 1)
        setMemberModalActiveTab(1);
        setGroupMenuVisible(false);
        setMemberManagementVisible(true);
    };

    const handleUpdateQuantity = (groupId) => {
        const group = [...userGroups, ...bulkOrders].find(g => g.id === groupId);
        if (!group) return;

        // Find the user's current quantity
        const members = groupMembers[groupId] || [];
        const userMember = members.find(member => member.name === 'Your Business');
        const currentQuantity = userMember?.quantity || 0;

        // Open a dialog to update quantity (reuse the join modal with modifications)
        setJoiningGroupId(groupId);
        setJoinGroupQuantity(currentQuantity.toString());
        setJoinGroupModalVisible(true);
    };

    const handleLeaveGroup = (groupId) => {
        const group = [...userGroups, ...bulkOrders].find(g => g.id === groupId);
        if (!group) return;

        // Show confirmation dialog
        Alert.alert(
            "Leave Group",
            "Are you sure you want to leave this group? Your contribution will be removed.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Leave",
                    style: "destructive",
                    onPress: () => confirmLeaveGroup(groupId)
                }
            ]
        );
    };

    const confirmLeaveGroup = (groupId) => {
        // Remove user from members
        setGroupMembers(prev => {
            const groupMembersList = prev[groupId] || [];
            return {
                ...prev,
                [groupId]: groupMembersList.filter(member => member.name !== 'Your Business')
            };
        });

        // Update the group data
        setFilteredData(prev => {
            return {
                ...prev,
                bulkOrders: prev.bulkOrders.map(order =>
                    order.id === groupId ? {
                        ...order,
                        joined: false,
                        participants: Math.max((order.participants || 0) - 1, 0)
                    } : order
                )
            };
        });

        // Close the menu
        setGroupMenuVisible(false);

        // Show confirmation
        alert("You have left the group successfully.");
    };

    // Render the main screen - add our new modals
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textDark || "#374151"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Save & Share</Text>
                <TouchableOpacity style={styles.infoButton} onPress={() => setShowTabInfo(!showTabInfo)}>
                    <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Tab Info Modal Overlay */}
            <Modal
                visible={showTabInfo}
                animationType="fade"
                transparent
                onRequestClose={() => setShowTabInfo(false)}
            >
                <View style={styles.tabInfoModalOverlay}>
                    <Animated.View
                        style={styles.tabInfoModalCard}
                        entering={FadeIn.duration(300)}
                    >
                        <View style={styles.tabInfoHeader}>
                            <Text style={styles.tabInfoTitle}>About Save & Share</Text>
                            <TouchableOpacity onPress={() => setShowTabInfo(false)}>
                                <Ionicons name="close" size={20} color={MSMEColors.darkGray} />
                            </TouchableOpacity>
                        </View>

                        {/* Key Features List */}
                        <View style={styles.keyFeaturesList}>
                            <View style={styles.keyFeatureItem}>
                                <Text style={styles.keyFeatureIcon}>🛒</Text>
                                <View style={styles.keyFeatureTextContainer}>
                                    <Text style={styles.keyFeatureTitle}>Group Buy</Text>
                                    <Text style={styles.keyFeatureDescription}>Join others to bulk order ingredients or packaging and save costs together.</Text>
                                </View>
                            </View>
                            <View style={styles.keyFeatureItem}>
                                <Text style={styles.keyFeatureIcon}>🔄</Text>
                                <View style={styles.keyFeatureTextContainer}>
                                    <Text style={styles.keyFeatureTitle}>Share / Swap</Text>
                                    <Text style={styles.keyFeatureDescription}>List leftover ingredients or packaging for others to use, reducing waste.</Text>
                                </View>
                            </View>
                            <View style={styles.keyFeatureItem}>
                                <Text style={styles.keyFeatureIcon}>🧃</Text>
                                <View style={styles.keyFeatureTextContainer}>
                                    <Text style={styles.keyFeatureTitle}>Sell Excess</Text>
                                    <Text style={styles.keyFeatureDescription}>Auto-list soon-to-expire stock to nearby businesses for quick sales.</Text>
                                </View>
                            </View>

                            {/* New Feature Description - In-app Member Tracking */}
                            <View style={[styles.keyFeatureItem, styles.highlightedFeature]}>
                                <Text style={styles.keyFeatureIcon}>👥</Text>
                                <View style={styles.keyFeatureTextContainer}>
                                    <Text style={styles.keyFeatureTitle}>In-app Member Management</Text>
                                    <Text style={styles.keyFeatureDescription}>
                                        Now with built-in member tracking and chat! No more external contact links -
                                        easily manage participants, track contributions, and communicate right in the app.
                                    </Text>
                                </View>
                            </View>
                        </View>


                    </Animated.View>
                </View>
            </Modal>

            {/* Tab Navigation */}
            <View style={styles.tabScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.tabContainer}>
                        {tabs.map((tab, index) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    style={[
                                        styles.tab,
                                        isActive && styles.activeTab,
                                        index === 0 && { marginLeft: 0 }
                                    ]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            isActive && styles.activeTabText
                                        ]}
                                    >
                                        {tab}
                                    </Text>
                                    {isActive && <View style={styles.activeTabIndicator} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            {/* Tab Description */}
            <View style={styles.tabDescriptionContainer}>
                <Text style={styles.tabDescription}>{tabExplanations[activeTab]}</Text>
            </View>

            {/* Main Content */}
            <View style={styles.contentContainer}>
                {renderTabContent()}
            </View>

            {/* Add New Listing Modal */}
            {renderAddListingModal()}
            {renderAddGroupModal()}

            {/* Add our new modals */}
            {renderGroupManagementMenu()}
            {renderGroupEditModal()}

            {/* Add member management modal */}
            {renderMemberManagementModal()}

            {renderJoinGroupModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textDark || "#374151",
    },
    infoButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsPanel: {
        flexDirection: 'row',
        backgroundColor: MSMEColors.white,
        padding: 16,
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 12,
        ...MSMEColors.shadowCard,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16, // Add margin to separate from tabs
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statItemValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
    },
    statItemLabel: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: MSMEColors.border,
    },
    tabScrollContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
        position: 'relative',
    },
    activeTab: {
        backgroundColor: 'transparent',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: MSMEColors.groupBuy,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: MSMEColors.darkGray,
    },
    activeTabText: {
        color: MSMEColors.groupBuy,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContainer: {
        paddingBottom: 20,
    },
    bulkOrderCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    cardContent: {
        padding: 16,
    },
    bulkOrderHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bulkOrderInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    bulkOrderTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bulkOrderStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bulkOrderStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    bulkOrderStatText: {
        marginLeft: 4,
        fontSize: 12,
        color: MSMEColors.darkGray,
    },
    categoryBadge: {
        backgroundColor: `${MSMEColors.groupBuy}15`,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 10,
        color: MSMEColors.groupBuy,
        fontWeight: '500',
    },
    bulkOrderDescription: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginBottom: 16,
        lineHeight: 20,
    },
    bulkOrderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    deadlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deadlineText: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginLeft: 4,
    },
    joinButtonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    joinButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinButtonText: {
        color: MSMEColors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    inventoryCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    inventoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
    },
    postedDate: {
        fontSize: 12,
        color: MSMEColors.darkGray,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    offerBadge: {
        backgroundColor: `${MSMEColors.stockGood}15`,
    },
    needBadge: {
        backgroundColor: `${MSMEColors.groupBuy}15`,
    },
    typeText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    inventoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    inventoryDescription: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginBottom: 12,
        lineHeight: 20,
    },
    inventoryDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    contactButtonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    contactButton: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactButtonText: {
        color: MSMEColors.white,
        fontWeight: '600',
        fontSize: 14,
        marginRight: 8,
    },
    addListingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MSMEColors.groupBuy,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    addListingButtonText: {
        color: MSMEColors.white,
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        color: MSMEColors.darkGray,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: MSMEColors.mutedForeground,
        textAlign: 'center',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: MSMEColors.white,
        width: '90%',
        maxHeight: '80%',
        borderRadius: 16,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: MSMEColors.muted,
        borderRadius: 8,
        marginBottom: 16,
    },
    typeOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeTypeOption: {
        backgroundColor: MSMEColors.groupBuy,
        borderRadius: 8,
    },
    typeOptionText: {
        fontWeight: '500',
        color: MSMEColors.darkGray,
    },
    activeTypeOptionText: {
        color: MSMEColors.white,
    },
    formContainer: {
        maxHeight: 400,
    },
    formField: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
    },
    formLabel: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginBottom: 6,
    },
    formInput: {
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: MSMEColors.border,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: MSMEColors.border,
        borderRadius: 8,
        paddingVertical: 12,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: MSMEColors.darkGray,
    },
    submitButtonContainer: {
        flex: 1,
        marginLeft: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    submitButton: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: MSMEColors.white,
    },
    myGroupBadge: {
        backgroundColor: Colors.primary,
        borderRadius: 6,
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'center',
    },
    myGroupBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 0,
        paddingHorizontal: 0,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: MSMEColors.border,
        marginRight: 8,
        height: 40,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: MSMEColors.darkGray,
        paddingVertical: 0,
        paddingHorizontal: 8,
        backgroundColor: 'transparent',
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: MSMEColors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: MSMEColors.border,
    },
    activeFilterButton: {
        backgroundColor: MSMEColors.groupBuy,
    },
    filterPanel: {
        backgroundColor: MSMEColors.white,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: 12,
        marginTop: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
        maxHeight: '70%',
    },
    filterScrollView: {
        maxHeight: Dimensions.get('window').height * 0.5,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
    },
    filterHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clearFiltersButton: {
        marginRight: 12,
    },
    closeFilterButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: MSMEColors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MSMEColors.darkGray,
    },
    clearFiltersText: {
        fontSize: 13,
        color: MSMEColors.groupBuy,
        fontWeight: '500',
    },
    filterSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: MSMEColors.darkGray,
        marginBottom: 6,
        marginTop: 4,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    categoryChip: {
        marginRight: 6,
        marginBottom: 6,
        backgroundColor: MSMEColors.background,
        height: 30,
    },
    selectedCategoryChip: {
        backgroundColor: MSMEColors.groupBuy,
    },
    categoryChipText: {
        color: MSMEColors.darkGray,
        fontSize: 12,
    },
    selectedCategoryChipText: {
        color: MSMEColors.white,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateInputContainer: {
        flex: 1,
        marginRight: 8,
    },
    dateInputLabel: {
        fontSize: 11,
        color: MSMEColors.darkGray,
        marginBottom: 2,
    },
    dateInput: {
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: MSMEColors.border,
        fontSize: 12,
        height: 36,
    },
    priceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    priceInput: {
        flex: 1,
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: MSMEColors.border,
        textAlign: 'center',
        fontSize: 12,
        height: 36,
    },
    priceSeparator: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginHorizontal: 6,
    },
    sortOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    sortOption: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: MSMEColors.background,
        borderColor: MSMEColors.border,
        borderWidth: 1,
        marginRight: 6,
        marginBottom: 6,
    },
    selectedSortOption: {
        backgroundColor: MSMEColors.groupBuy,
        borderColor: MSMEColors.groupBuy,
    },
    sortOptionText: {
        fontSize: 12,
        color: MSMEColors.darkGray,
    },
    selectedSortOptionText: {
        color: MSMEColors.white,
    },
    applyFiltersButton: {
        backgroundColor: MSMEColors.groupBuy,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        marginBottom: 10,
    },
    applyFiltersButtonText: {
        color: MSMEColors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    // Card UI improvements
    bulkOrderTitleImproved: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
        marginBottom: 2,
    },
    metaContainerImproved: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    bulkOrderDescriptionImproved: {
        fontSize: 15,
        color: MSMEColors.darkGray,
        marginBottom: 16,
        lineHeight: 21,
        fontWeight: '400',
    },
    userNameImproved: {
        fontSize: 15,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
    },
    inventoryTitleImproved: {
        fontSize: 17,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
        marginBottom: 2,
    },
    inventoryDescriptionImproved: {
        fontSize: 15,
        color: MSMEColors.darkGray,
        marginBottom: 12,
        lineHeight: 21,
        fontWeight: '400',
    },
    filterModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    filterModalContainer: {
        backgroundColor: MSMEColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '80%',
    },
    activeFiltersContainer: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    activeFiltersLabel: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginBottom: 4,
    },
    activeFilterChip: {
        backgroundColor: `${MSMEColors.groupBuy}15`,
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeFilterChipText: {
        fontSize: 12,
        color: MSMEColors.groupBuy,
        fontWeight: '500',
    },
    clearAllFiltersChip: {
        backgroundColor: `${MSMEColors.error}10`,
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    clearAllFiltersText: {
        fontSize: 12,
        color: MSMEColors.error,
        fontWeight: '500',
        marginRight: 4,
    },
    filterCountBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: MSMEColors.error,
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: MSMEColors.white,
    },
    filterCountText: {
        fontSize: 10,
        color: MSMEColors.white,
        fontWeight: 'bold',
    },
    tabDescriptionContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    tabDescription: {
        fontSize: 13,
        color: MSMEColors.darkGray,
        lineHeight: 18,
    },
    tabInfoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    tabInfoModalCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: MSMEColors.white,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
        maxHeight: '80%',
    },
    tabInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tabInfoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
    },
    tabInfoDescription: {
        fontSize: 15,
        color: MSMEColors.darkGray,
        marginBottom: 14,
        lineHeight: 22,
    },
    tabInfoContent: {
        maxHeight: 220,
    },
    tabInfoItem: {
        marginBottom: 14,
    },
    tabInfoItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
        marginBottom: 4,
    },
    tabInfoItemDescription: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        lineHeight: 19,
    },
    marketplaceInfoBar: {
        backgroundColor: `${MSMEColors.muted}50`,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    marketplaceInfoText: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        textAlign: 'center',
    },
    formInfo: {
        flexDirection: 'row',
        backgroundColor: `${MSMEColors.groupBuy}15`,
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    formInfoText: {
        flex: 1,
        fontSize: 13,
        color: MSMEColors.darkGray,
        marginLeft: 8,
        lineHeight: 18,
    },
    distanceFilterContainer: {
        marginBottom: 10,
    },
    distanceInput: {
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: MSMEColors.border,
        fontSize: 12,
        height: 36,
        textAlign: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    locationText: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginLeft: 4,
        marginRight: 8,
    },
    distanceBadge: {
        backgroundColor: `${MSMEColors.success}15`,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 0,
    },
    distanceText: {
        fontSize: 10,
        color: MSMEColors.success,
        fontWeight: 'bold',
    },
    locationErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationErrorText: {
        fontSize: 12,
        color: MSMEColors.error,
        marginLeft: 4,
    },
    retryButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: MSMEColors.groupBuy,
        marginLeft: 8,
    },
    retryButtonText: {
        color: MSMEColors.white,
        fontSize: 12,
        fontWeight: '500',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    loadingText: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginLeft: 4,
    },
    currentLocationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    currentLocationText: {
        fontSize: 12,
        color: MSMEColors.success,
        marginLeft: 4,
    },
    disabledSortOption: {
        opacity: 0.5,
    },
    disabledSortOptionText: {
        color: MSMEColors.mutedForeground,
    },
    keyFeaturesList: {
        marginBottom: 18,
    },
    keyFeatureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${MSMEColors.groupBuy}08`,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    keyFeatureIcon: {
        fontSize: 28,
        marginRight: 12,
        marginTop: 2,
    },
    keyFeatureTextContainer: {
        flex: 1,
    },
    keyFeatureTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
        marginBottom: 2,
    },
    keyFeatureDescription: {
        fontSize: 13,
        color: MSMEColors.darkGray,
        lineHeight: 18,
    },
    groupMenuButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: MSMEColors.background,
        marginLeft: 8,
    },
    menuModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: MSMEColors.white,
        width: '90%',
        maxHeight: '80%',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        width: '100%',
    },
    menuItemText: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginLeft: 8,
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: MSMEColors.darkGray,
    },
    progressValue: {
        fontSize: 12,
        color: MSMEColors.groupBuy,
        fontWeight: 'bold',
    },
    progressBarBackground: {
        height: 8,
        borderRadius: 4,
        backgroundColor: MSMEColors.border,
    },
    progressBarFill: {
        height: 8,
        borderRadius: 4,
    },
    selectedGroup: {
        backgroundColor: MSMEColors.groupBuy,
    },
    selectedGroupId: {
        backgroundColor: MSMEColors.groupBuy,
        borderWidth: 2,
        borderColor: MSMEColors.white,
    },
    saveButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: MSMEColors.background,
        marginRight: 8,
    },
    savedTabHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
        marginBottom: 12,
    },
    memberTabView: {
        flex: 1,
    },
    memberTabBar: {
        backgroundColor: MSMEColors.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
    },
    memberTabLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'none',
    },
    memberTabIndicator: {
        backgroundColor: MSMEColors.groupBuy,
        height: 3,
    },
    memberTabContent: {
        flex: 1,
        paddingTop: 16,
    },
    orderProgressContainer: {
        marginBottom: 24,
        backgroundColor: MSMEColors.background,
        borderRadius: 12,
        padding: 16,
    },
    orderProgressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center',
    },
    orderProgressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MSMEColors.darkGray,
    },
    orderProgressStats: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
    },
    targetMetMessage: {
        color: MSMEColors.success,
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    targetPendingMessage: {
        color: MSMEColors.darkGray,
        fontSize: 14,
        marginTop: 8,
    },
    membersListHeader: {
        flexDirection: 'row',
        backgroundColor: MSMEColors.background,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    memberHeaderCell: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        color: MSMEColors.darkGray,
    },
    memberRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
        alignItems: 'center',
    },
    memberCell: {
        flex: 1,
        fontSize: 14,
    },
    memberCellQuantity: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
    },
    memberStatusBadge: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    confirmedStatusBadge: {
        backgroundColor: `${MSMEColors.success}20`,
    },
    pendingStatusBadge: {
        backgroundColor: `${MSMEColors.mutedForeground}20`,
    },
    memberStatusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyMembersList: {
        padding: 20,
        alignItems: 'center',
    },
    emptyMembersText: {
        color: MSMEColors.darkGray,
        fontSize: 16,
    },
    chatTabContent: {
        flex: 1,
        paddingTop: 16,
    },
    chatMessagesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    chatMessage: {
        maxWidth: '80%',
        marginBottom: 16,
    },
    outgoingMessage: {
        alignSelf: 'flex-end',
    },
    incomingMessage: {
        alignSelf: 'flex-start',
    },
    messageSender: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginBottom: 2,
        marginLeft: 2,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 12,
    },
    outgoingBubble: {
        backgroundColor: MSMEColors.groupBuy,
        borderTopRightRadius: 4,
    },
    incomingBubble: {
        backgroundColor: MSMEColors.background,
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    messageTime: {
        fontSize: 10,
        color: MSMEColors.darkGray,
        marginTop: 2,
        alignSelf: 'flex-end',
    },
    chatInputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: MSMEColors.border,
        backgroundColor: MSMEColors.white,
    },
    chatInput: {
        flex: 1,
        backgroundColor: MSMEColors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: MSMEColors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    emptyChatContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyChatText: {
        color: MSMEColors.darkGray,
        fontSize: 16,
        marginBottom: 4,
    },
    emptyChatSubtext: {
        color: MSMEColors.mutedForeground,
        fontSize: 14,
        textAlign: 'center',
    },
    groupDetailsHeader: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
        paddingBottom: 8,
    },
    groupDetailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MSMEColors.groupBuy,
        marginBottom: 4,
    },
    groupStatusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 8,
    },
    activeGroupBadge: {
        backgroundColor: `${MSMEColors.groupBuy}20`,
    },
    completedGroupBadge: {
        backgroundColor: `${MSMEColors.success}20`,
    },
    closedGroupBadge: {
        backgroundColor: `${MSMEColors.darkGray}20`,
    },
    groupStatusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    highlightedFeature: {
        backgroundColor: `${MSMEColors.groupBuy}15`,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: MSMEColors.groupBuy,
    },
    joinedGroupBadge: {
        backgroundColor: MSMEColors.success,
        borderRadius: 6,
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'center',
    },
    joinedGroupBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    joinGroupContent: {
        marginBottom: 16,
    },
    joinGroupDescription: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginBottom: 16,
        lineHeight: 20,
    },
    joinGroupQuantityLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: MSMEColors.darkGray,
        marginBottom: 8,
    },
    joinGroupQuantityInput: {
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: MSMEColors.border,
        fontSize: 16,
        marginBottom: 16,
    },
    joinGroupNote: {
        flexDirection: 'row',
        backgroundColor: `${MSMEColors.groupBuy}10`,
        padding: 12,
        borderRadius: 8,
        alignItems: 'flex-start',
    },
    joinGroupNoteText: {
        flex: 1,
        fontSize: 13,
        color: MSMEColors.darkGray,
        marginLeft: 8,
        lineHeight: 18,
    },
    disabledButton: {
        opacity: 0.6,
    },
    updateQuantityContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: MSMEColors.border,
        alignItems: 'center',
    },
    updateQuantityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MSMEColors.groupBuy,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        width: '100%',
        maxWidth: 280,
    },
    updateQuantityButtonText: {
        color: MSMEColors.white,
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },
});

export default BulkPurchaseScreen; 