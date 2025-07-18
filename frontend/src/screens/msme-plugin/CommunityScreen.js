import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ScrollView,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const CommunityScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All Topics');
    const [searchQuery, setSearchQuery] = useState('');

    // Malaysia-relevant topics
    const topics = [
        'All Topics',
        'Digital Payments',
        'Grants & Funding',
        'E-commerce',
        'Halal Certification',
        'Tax Filing',
        'Rural Business',
        'Marketing',
        'Supply Chain'
    ];

    // Sample posts data with Malaysian context
    const posts = [
        {
            id: 1,
            author: 'Sarah Lee',
            avatar: require('../../../assets/default.jpg'),
            authorPosition: 'Small Business Owner',
            timeAgo: '2 hours ago',
            topic: 'Marketing',
            title: 'Tips for promoting your business on social media',
            content: "I've found that posting consistently at the same time every day has really helped grow my audience. Also, engaging with comments quickly shows customers you care about their feedback. What strategies have worked for you all?",
            likes: 24,
            comments: 7,
            tags: ['social media', 'growth', 'marketing tips']
        },
        {
            id: 2,
            author: 'Ahmad Rizal',
            avatar: require('../../../assets/default.jpg'),
            authorPosition: 'F&B Entrepreneur',
            timeAgo: '5 hours ago',
            topic: 'Digital Payments',
            title: 'DuitNow QR implementation experience',
            content: "Just implemented DuitNow QR for my cafe and it's boosted sales by 15%! The setup process was simple but had a few challenges with the bank integration. Has anyone else experienced delays with the merchant verification process?",
            likes: 31,
            comments: 12,
            tags: ['payments', 'digital', 'DuitNow QR']
        },
        {
            id: 3,
            author: 'Mei Lin',
            avatar: require('../../../assets/default.jpg'),
            authorPosition: 'Handicraft Business',
            timeAgo: '1 day ago',
            topic: 'Grants & Funding',
            title: 'MDEC SME Digitalisation Grant success story',
            content: "Just received approval for the MDEC SME Digitalisation Grant! Applied in March and got approval in May. Used it to build an e-commerce site and digital inventory system. Happy to share tips on the application process if anyone needs help.",
            likes: 45,
            comments: 18,
            tags: ['grants', 'MDEC', 'funding', 'digitalization']
        },
        {
            id: 4,
            author: 'Amir Hassan',
            avatar: require('../../../assets/default.jpg'),
            authorPosition: 'Tech Startup Founder',
            timeAgo: '2 days ago',
            topic: 'E-commerce',
            title: 'Shopee vs Lazada for small batch products',
            content: "I'm selling handmade soaps in small batches (about 100 units per month). Been on both platforms for 3 months. Shopee seems to convert better for me but Lazada's seller support is more responsive. Anyone else have similar experiences?",
            likes: 28,
            comments: 23,
            tags: ['shopee', 'lazada', 'e-commerce', 'handmade']
        },
        {
            id: 5,
            author: 'Fatimah Zahra',
            avatar: require('../../../assets/default.jpg'),
            authorPosition: 'Food Producer',
            timeAgo: '3 days ago',
            topic: 'Halal Certification',
            title: 'Timeline for JAKIM certification process',
            content: "Recently went through the JAKIM halal certification for my food products. The whole process took 2.5 months from submission to approval. Documentation was intensive but worth it. Has the process improved this year?",
            likes: 36,
            comments: 15,
            tags: ['halal', 'JAKIM', 'certification', 'food business']
        }
    ];

    // Filter posts based on active tab and search query
    const filteredPosts = posts.filter(post =>
        (activeTab === 'All Topics' || post.topic === activeTab) &&
        (searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Render a post item
    const renderPostItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInRight.delay(50 * index).springify()}
            style={styles.postCard}
        >
            <View style={styles.postHeader}>
                <View style={styles.authorSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{item.author.split(' ').map(name => name[0]).join('')}</Text>
                    </View>
                    <View>
                        <Text style={styles.authorName}>{item.author}</Text>
                        <Text style={styles.authorPosition}>{item.authorPosition}</Text>
                    </View>
                </View>
                <View style={styles.postMeta}>
                    <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                    <View style={styles.topicTag}>
                        <Text style={styles.topicText}>{item.topic}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent} numberOfLines={3} ellipsizeMode="tail">
                {item.content}
            </Text>

            <View style={styles.tagsContainer}>
                {item.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="thumbs-up-outline" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{item.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Simple header matching other pages */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Community</Text>
                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="notifications-outline" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search discussions"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Topic tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScrollContent}
                >
                    {topics.map((topic) => (
                        <TouchableOpacity
                            key={topic}
                            style={[
                                styles.tab,
                                activeTab === topic && styles.activeTab
                            ]}
                            onPress={() => setActiveTab(topic)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === topic && styles.activeTabText
                                ]}
                            >
                                {topic}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Posts list */}
            <FlatList
                data={filteredPosts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.postsContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No discussions found</Text>
                        <Text style={styles.emptySubtext}>
                            Try a different search term or topic
                        </Text>
                    </View>
                }
            />

            {/* Create post button */}
            <TouchableOpacity style={styles.createPostButton}>
                <Ionicons name="create" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    headerAction: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        color: '#111827',
    },
    tabsContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tabsScrollContent: {
        paddingHorizontal: 12,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeTabText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    postsContainer: {
        padding: 12,
    },
    postCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    authorPosition: {
        fontSize: 12,
        color: '#6B7280',
    },
    postMeta: {
        alignItems: 'flex-end',
    },
    timeAgo: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    topicTag: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    topicText: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.primary,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 24,
    },
    postContent: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#6B7280',
    },
    postActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    actionText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    createPostButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default CommunityScreen; 