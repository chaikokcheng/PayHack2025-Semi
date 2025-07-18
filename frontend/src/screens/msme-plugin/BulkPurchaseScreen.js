import React, { useState } from 'react';
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
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Badge, Divider } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { MSMEColors } from './MSMEToolsScreen';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const BulkPurchaseScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Bulk Orders');
    const [modalVisible, setModalVisible] = useState(false);
    const [newListingType, setNewListingType] = useState('need');
    const [newListing, setNewListing] = useState({
        title: '',
        description: '',
        quantity: '',
        price: '',
        category: 'Supplies',
        expiry: '',
    });
    const [groupModalVisible, setGroupModalVisible] = useState(false);
    const [newGroup, setNewGroup] = useState({
        title: '',
        description: '',
        category: 'Packaging',
        deadline: '',
        contact: '',
    });
    // Store only user-created groups in state
    const [userGroups, setUserGroups] = useState([]);

    const tabs = ['Bulk Orders', 'Available Items', 'My Listings', 'Matches'];

    // Sample bulk purchase groups
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
        },
    ];

    // Sample available inventory items
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
        }
    ];

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
        });
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
            contact: newGroup.contact,
            isMine: true, // Mark as user's own group
        };
        setUserGroups([group, ...userGroups]);
        setGroupModalVisible(false);
        setNewGroup({
            title: '',
            description: '',
            category: 'Packaging',
            deadline: '',
            contact: '',
        });
    };

    // Merge static bulkOrders (other users) and userGroups (current user)
    const allBulkOrders = [
        ...userGroups,
        ...bulkOrders.map(order => ({ ...order, isMine: false })),
    ];

    const renderBulkOrderItem = ({ item, index }) => {
        return (
            <AnimatedCard
                mode="elevated"
                style={styles.bulkOrderCard}
                entering={FadeInDown.delay(100 * index).springify()}
            >
                <Card.Content style={styles.cardContent}>
                    <View style={styles.bulkOrderHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: `${Colors.primary}15` }]}> {/* Use app primary */}
                            <Ionicons name="cart-outline" size={32} color={Colors.primary} />
                        </View>
                        <View style={styles.bulkOrderInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.bulkOrderTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                                {item.isMine && (
                                    <View style={styles.myGroupBadge}>
                                        <Text style={styles.myGroupBadgeText}>My Group</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.metaContainer}>
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
                    <Text style={styles.bulkOrderDescription} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>
                    <View style={styles.bulkOrderFooter}>
                        <View style={styles.deadlineContainer}>
                            <Ionicons name="time-outline" size={16} color={Colors.darkGray || MSMEColors.darkGray} />
                            <Text style={styles.deadlineText}>Closes: {item.deadline}</Text>
                        </View>
                        {item.contact ? (
                            <TouchableOpacity style={styles.joinButtonContainer} onPress={() => Linking.openURL(item.contact)}>
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.joinButton}
                                >
                                    <Text style={styles.joinButtonText}>Join Group</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.joinButtonContainer}>
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.joinButton}
                                >
                                    <Text style={styles.joinButtonText}>Join Group</Text>
                                </LinearGradient>
                            </View>
                        )}
                    </View>
                </Card.Content>
            </AnimatedCard>
        );
    };

    const renderInventoryItem = ({ item, index }) => {
        const isOffer = item.type === 'offer';

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
                            <Text style={styles.userName}>{item.userName}</Text>
                            <Text style={styles.postedDate}>Posted: {item.posted}</Text>
                        </View>

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
                            }]}>
                                {isOffer ? 'Offering' : 'Seeking'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.inventoryTitle}>{item.title}</Text>
                    <Text style={styles.inventoryDescription} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>

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
            case 'Bulk Orders':
                return (
                    <>
                        <AnimatedTouchableOpacity
                            style={styles.addListingButton}
                            onPress={() => setGroupModalVisible(true)}
                            entering={FadeIn.delay(100).springify()}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
                            <Text style={styles.addListingButtonText}>Create Group Buy</Text>
                        </AnimatedTouchableOpacity>
                        <FlatList
                            data={allBulkOrders}
                            renderItem={renderBulkOrderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                );
            case 'Available Items':
                return (
                    <FlatList
                        data={availableItems}
                        renderItem={renderInventoryItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                );
            case 'My Listings':
                return (
                    <>
                        <AnimatedTouchableOpacity
                            style={styles.addListingButton}
                            onPress={() => setModalVisible(true)}
                            entering={FadeIn.delay(100).springify()}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={MSMEColors.white} />
                            <Text style={styles.addListingButtonText}>Add New Listing</Text>
                        </AnimatedTouchableOpacity>
                        <FlatList
                            data={myListings}
                            renderItem={renderInventoryItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="clipboard-outline" size={64} color="#DDD" />
                                    <Text style={styles.emptyStateText}>No listings yet</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Add your first listing to get started
                                    </Text>
                                </View>
                            }
                        />
                    </>
                );
            case 'Matches':
                return (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle-outline" size={64} color="#DDD" />
                        <Text style={styles.emptyStateText}>No matches yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            When your listings match with others, they'll appear here
                        </Text>
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
                        <Text style={styles.modalTitle}>Add New Listing</Text>
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
                                I'm Offering
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
                                I'm Looking For
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
                                <TextInput
                                    style={styles.formInput}
                                    value={newListing.expiry}
                                    onChangeText={(text) => setNewListing({ ...newListing, expiry: text })}
                                    placeholder="YYYY-MM-DD"
                                />
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
                        <Text style={styles.modalTitle}>Create Group Buy</Text>
                        <TouchableOpacity onPress={() => setGroupModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.formContainer}>
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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header - Updated to match MerchantLoansScreen */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textDark || "#374151"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Group Buy</Text>
                <TouchableOpacity style={styles.infoButton}>
                    <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

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

            {/* Main Content */}
            <View style={styles.contentContainer}>
                {renderTabContent()}
            </View>

            {/* Add New Listing Modal */}
            {renderAddListingModal()}
            {renderAddGroupModal()}
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
});

export default BulkPurchaseScreen; 