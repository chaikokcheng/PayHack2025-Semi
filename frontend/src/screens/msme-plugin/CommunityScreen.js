import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Chip, Divider, Searchbar, Avatar, Button, FAB } from 'react-native-paper';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedChip = Animated.createAnimatedComponent(Chip);
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const CommunityScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeTopic, setActiveTopic] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [postData, setPostData] = useState({
        '1': { upvoted: false, downvoted: false, likes: 24 },
        '2': { upvoted: false, downvoted: false, likes: 32 },
        '3': { upvoted: false, downvoted: false, likes: 8 },
        '4': { upvoted: false, downvoted: false, likes: 15 },
        '5': { upvoted: false, downvoted: false, likes: 19 },
    });

    // Handle upvote/downvote
    const handleVote = (postId, voteType) => {
        setPostData(prevData => {
            const post = prevData[postId];
            let newLikes = post.likes;

            if (voteType === 'upvote') {
                if (post.upvoted) {
                    // Remove upvote
                    newLikes--;
                    return {
                        ...prevData,
                        [postId]: { ...post, upvoted: false, likes: newLikes }
                    };
                } else {
                    // Add upvote, remove downvote if exists
                    newLikes++;
                    if (post.downvoted) newLikes++;
                    return {
                        ...prevData,
                        [postId]: { ...post, upvoted: true, downvoted: false, likes: newLikes }
                    };
                }
            } else { // downvote
                if (post.downvoted) {
                    // Remove downvote
                    newLikes++;
                    return {
                        ...prevData,
                        [postId]: { ...post, downvoted: false, likes: newLikes }
                    };
                } else {
                    // Add downvote, remove upvote if exists
                    newLikes--;
                    if (post.upvoted) newLikes--;
                    return {
                        ...prevData,
                        [postId]: { ...post, downvoted: true, upvoted: false, likes: newLikes }
                    };
                }
            }
        });
    };

    // Sample topics
    const topics = [
        { id: 'all', name: 'All Topics', count: 28 },
        { id: 'marketing', name: 'Marketing', count: 12 },
        { id: 'finance', name: 'Finance', count: 8 },
        { id: 'operations', name: 'Operations', count: 5 },
        { id: 'tech', name: 'Technology', count: 3 },
    ];

    // Sample posts data
    const posts = [
        {
            id: '1',
            author: 'Sarah Lee',
            authorAvatar: null,
            title: 'Tips for promoting your business on social media',
            content: 'I\'ve found that posting consistently at the same time every day has really helped grow my audience. Also, engaging with comments quickly shows customers you care!',
            topic: 'Marketing',
            tags: ['social media', 'growth'],
            comments: 7,
            timeAgo: '2 hours ago',
            featured: true
        },
        {
            id: '2',
            author: 'Ahmad Hassan',
            authorAvatar: null,
            title: 'How to apply for SME financing programs',
            content: 'Just got approved for the SME Corp grant! Here\'s the exact process I followed and the documents I needed to prepare...',
            topic: 'Finance',
            tags: ['grants', 'funding'],
            comments: 15,
            timeAgo: '1 day ago',
            featured: true
        },
        {
            id: '3',
            author: 'Mei Ling',
            authorAvatar: null,
            title: 'Supplier recommendations for packaging',
            content: 'Looking for affordable eco-friendly packaging suppliers in KL area. Budget is around RM2-3 per unit. Any recommendations?',
            topic: 'Operations',
            tags: ['suppliers', 'packaging'],
            comments: 12,
            timeAgo: '3 days ago',
            featured: false
        },
        {
            id: '4',
            author: 'David Wong',
            authorAvatar: null,
            title: 'Setting up an online ordering system',
            content: 'Has anyone tried using Shopify vs. building a custom website? Which is more cost-effective for a small bakery?',
            topic: 'Technology',
            tags: ['e-commerce', 'websites'],
            comments: 9,
            timeAgo: '4 days ago',
            featured: false
        },
        {
            id: '5',
            author: 'Priya Sharma',
            authorAvatar: null,
            title: 'Best accounting practices for small businesses',
            content: 'I\'ve been keeping track of everything in Excel but I\'m wondering if there are better systems for growing businesses?',
            topic: 'Finance',
            tags: ['accounting', 'tools'],
            comments: 6,
            timeAgo: '1 week ago',
            featured: false
        },
    ];

    // Filter posts based on active tab and search query
    const filteredPosts = posts
        .filter(post => {
            if (activeTopic !== 'all' && post.topic.toLowerCase() !== activeTopic) {
                return false;
            }
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    post.title.toLowerCase().includes(query) ||
                    post.content.toLowerCase().includes(query) ||
                    post.topic.toLowerCase().includes(query) ||
                    post.tags.some(tag => tag.toLowerCase().includes(query))
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (activeTab === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            if (activeTab === 'popular') return postData[b.id].likes - postData[a.id].likes;
            return 0; // Default sorting for 'all'
        });

    // Get initials from name for avatar placeholder
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Get random color for avatar based on name
    const getAvatarColor = (name) => {
        const colors = [
            '#8B33D9', // primary
            '#28A86B', // inventory
            '#3388DD', // accounting
            '#E57822', // groupBuy
            '#2294CC', // resources
        ];
        const charCode = name.charCodeAt(0);
        return colors[charCode % colors.length];
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={MSMEColors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <View style={styles.titleContainer}>
                            <Ionicons name="people-outline" size={24} color="white" style={styles.titleIcon} />
                            <Text style={styles.headerTitle}>Community</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Connect with other businesses</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>For You</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'featured' && styles.activeTab]}
                    onPress={() => setActiveTab('featured')}
                >
                    <Text style={[styles.tabText, activeTab === 'featured' && styles.activeTabText]}>Featured</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'popular' && styles.activeTab]}
                    onPress={() => setActiveTab('popular')}
                >
                    <Text style={[styles.tabText, activeTab === 'popular' && styles.activeTabText]}>Popular</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Search */}
                <Searchbar
                    placeholder="Search posts..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                    inputStyle={styles.searchInput}
                    iconColor={MSMEColors.community}
                />

                {/* Topics ScrollView */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.topicsScrollView}
                    contentContainerStyle={styles.topicsContainer}
                >
                    {topics.map((topic, index) => (
                        <AnimatedChip
                            key={topic.id}
                            selected={activeTopic === topic.id}
                            onPress={() => setActiveTopic(topic.id)}
                            style={[
                                styles.topicChip,
                                activeTopic === topic.id && styles.activeTopicChip
                            ]}
                            textStyle={[
                                styles.topicChipText,
                                activeTopic === topic.id && styles.activeTopicChipText
                            ]}
                            entering={FadeInDown.delay(50 * index).springify()}
                        >
                            {topic.name} {topic.count > 0 && `(${topic.count})`}
                        </AnimatedChip>
                    ))}
                </ScrollView>

                {/* Posts */}
                {filteredPosts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#DDD" />
                        <Text style={styles.emptyStateText}>No posts found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Start the conversation by creating a new post'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.postsContainer}>
                        {filteredPosts.map((post, index) => {
                            const postVoteData = postData[post.id];
                            return (
                                <AnimatedCard
                                    key={post.id}
                                    mode="elevated"
                                    style={styles.postCard}
                                    entering={FadeInDown.delay(100 * index).springify()}
                                >
                                    <Card.Content style={styles.postContent}>
                                        <View style={styles.postHeader}>
                                            <View style={styles.authorContainer}>
                                                <Avatar.Text
                                                    size={40}
                                                    label={getInitials(post.author)}
                                                    style={{ backgroundColor: getAvatarColor(post.author) }}
                                                />
                                                <View style={styles.authorInfo}>
                                                    <Text style={styles.authorName}>{post.author}</Text>
                                                    <Text style={styles.postTime}>{post.timeAgo}</Text>
                                                </View>
                                            </View>
                                            <Chip
                                                style={styles.topicBadge}
                                                textStyle={styles.topicBadgeText}
                                            >
                                                {post.topic}
                                            </Chip>
                                        </View>

                                        <Text style={styles.postTitle}>{post.title}</Text>
                                        <Text style={styles.postText} numberOfLines={3}>
                                            {post.content}
                                        </Text>

                                        <View style={styles.tagContainer}>
                                            {post.tags.map((tag) => (
                                                <Chip
                                                    key={tag}
                                                    style={styles.tagChip}
                                                    textStyle={styles.tagChipText}
                                                >
                                                    #{tag}
                                                </Chip>
                                            ))}
                                        </View>

                                        <Divider style={styles.postDivider} />

                                        <View style={styles.postActions}>
                                            <View style={styles.voteContainer}>
                                                <TouchableOpacity
                                                    style={styles.voteButton}
                                                    onPress={() => handleVote(post.id, 'upvote')}
                                                >
                                                    <Ionicons
                                                        name={postVoteData.upvoted ? "arrow-up-circle" : "arrow-up-circle-outline"}
                                                        size={22}
                                                        color={postVoteData.upvoted ? MSMEColors.community : "#666"}
                                                    />
                                                </TouchableOpacity>

                                                <Text style={[
                                                    styles.voteCount,
                                                    postVoteData.upvoted && styles.upvotedText,
                                                    postVoteData.downvoted && styles.downvotedText
                                                ]}>
                                                    {postVoteData.likes}
                                                </Text>

                                                <TouchableOpacity
                                                    style={styles.voteButton}
                                                    onPress={() => handleVote(post.id, 'downvote')}
                                                >
                                                    <Ionicons
                                                        name={postVoteData.downvoted ? "arrow-down-circle" : "arrow-down-circle-outline"}
                                                        size={22}
                                                        color={postVoteData.downvoted ? "#E03A3A" : "#666"}
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            <TouchableOpacity style={styles.actionButton}>
                                                <Ionicons name="chatbubble-outline" size={20} color="#666" />
                                                <Text style={styles.actionText}>{post.comments}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.actionButton}>
                                                <Ionicons name="share-social-outline" size={20} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    </Card.Content>
                                </AnimatedCard>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* FAB for creating new post */}
            <FAB
                icon="plus"
                color="#FFF"
                style={styles.fab}
                customSize={56}
                onPress={() => console.log('Create new post')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MSMEColors.background,
    },
    header: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleIcon: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: MSMEColors.community,
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: MSMEColors.community,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    searchbar: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    searchInput: {
        fontSize: 14,
    },
    topicsScrollView: {
        marginBottom: 16,
    },
    topicsContainer: {
        paddingRight: 16,
    },
    topicChip: {
        marginRight: 8,
        backgroundColor: '#F0F0F0',
    },
    activeTopicChip: {
        backgroundColor: `${MSMEColors.community}20`,
    },
    topicChipText: {
        color: '#666',
    },
    activeTopicChipText: {
        color: MSMEColors.community,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        color: '#666',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    postsContainer: {
        marginBottom: 80, // Space for FAB
    },
    postCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    postContent: {
        padding: 16,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorInfo: {
        marginLeft: 12,
    },
    authorName: {
        fontWeight: '600',
        fontSize: 14,
    },
    postTime: {
        color: '#999',
        fontSize: 12,
    },
    topicBadge: {
        backgroundColor: `${MSMEColors.community}10`,
    },
    topicBadgeText: {
        color: MSMEColors.community,
        fontSize: 12,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: MSMEColors.foreground,
    },
    postText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tagChip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#F0F0F0',
        height: 26,
    },
    tagChipText: {
        fontSize: 12,
        color: '#666',
    },
    postDivider: {
        marginVertical: 12,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    voteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    voteButton: {
        padding: 4,
    },
    voteCount: {
        fontWeight: '600',
        fontSize: 14,
        color: '#666',
        minWidth: 30,
        textAlign: 'center',
    },
    upvotedText: {
        color: MSMEColors.community,
    },
    downvotedText: {
        color: '#E03A3A',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    actionText: {
        marginLeft: 4,
        color: '#666',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: MSMEColors.community,
    },
});

export default CommunityScreen; 