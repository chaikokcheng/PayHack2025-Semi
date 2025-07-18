import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ScrollView,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const CommunityScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All Topics');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [expandedCommentId, setExpandedCommentId] = useState(null);
    const [newComment, setNewComment] = useState('');

    // New post state
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTags, setNewPostTags] = useState('');

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

    // Sample posts data with Malaysian context and modified for upvote/downvote
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: 'Sarah Lee',
            avatar: require('../../../assets/default.jpg'),
            authorPosition: 'Small Business Owner',
            timeAgo: '2 hours ago',
            topic: 'Marketing',
            title: 'Tips for promoting your business on social media',
            content: "I've found that posting consistently at the same time every day has really helped grow my audience. Also, engaging with comments quickly shows customers you care about their feedback. What strategies have worked for you all?",
            upvotes: 24,
            downvotes: 3,
            comments: [
                {
                    id: 101,
                    author: 'John Tan',
                    avatar: 'JT',
                    timeAgo: '1 hour ago',
                    content: 'I\'ve had great success with Instagram Reels showing behind-the-scenes content of my handicraft business.',
                    upvotes: 5,
                    downvotes: 0
                },
                {
                    id: 102,
                    author: 'Nurul Huda',
                    avatar: 'NH',
                    timeAgo: '45 minutes ago',
                    content: 'For my small bakery, WhatsApp Business has been more effective than Instagram. It depends on your target market.',
                    upvotes: 7,
                    downvotes: 1
                }
            ],
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
            upvotes: 31,
            downvotes: 2,
            comments: [
                {
                    id: 201,
                    author: 'Siti Aminah',
                    avatar: 'SA',
                    timeAgo: '4 hours ago',
                    content: 'Yes, verification took nearly 2 weeks for my shop. I had to follow up multiple times.',
                    upvotes: 8,
                    downvotes: 0
                },
                {
                    id: 202,
                    author: 'Raj Kumar',
                    avatar: 'RK',
                    timeAgo: '3 hours ago',
                    content: 'I switched to using a payment aggregator instead. They handled all the verification process for me.',
                    upvotes: 6,
                    downvotes: 1
                },
                {
                    id: 203,
                    author: 'David Wong',
                    avatar: 'DW',
                    timeAgo: '2 hours ago',
                    content: 'Which bank did you use? I found Maybank\'s process was faster than CIMB\'s.',
                    upvotes: 3,
                    downvotes: 0
                }
            ],
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
            upvotes: 45,
            downvotes: 0,
            comments: [
                {
                    id: 301,
                    author: 'Hassan Ibrahim',
                    avatar: 'HI',
                    timeAgo: '20 hours ago',
                    content: 'Congratulations! Did you have to prepare a detailed proposal? I\'m planning to apply next month.',
                    upvotes: 2,
                    downvotes: 0
                },
                {
                    id: 302,
                    author: 'Grace Lim',
                    avatar: 'GL',
                    timeAgo: '18 hours ago',
                    content: 'Which service provider did you choose for your e-commerce development?',
                    upvotes: 1,
                    downvotes: 0
                }
            ],
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
            upvotes: 28,
            downvotes: 5,
            comments: [
                {
                    id: 401,
                    author: 'Lee Mei Ling',
                    avatar: 'LML',
                    timeAgo: '1 day ago',
                    content: 'I sell handcrafted jewelry and have the same experience. Shopee\'s user base seems more open to artisanal products.',
                    upvotes: 12,
                    downvotes: 1
                }
            ],
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
            upvotes: 36,
            downvotes: 2,
            comments: [
                {
                    id: 501,
                    author: 'Zainab Mohammad',
                    avatar: 'ZM',
                    timeAgo: '2 days ago',
                    content: 'We just completed ours last month. It took about 3 months, but we had some initial document issues that needed correction.',
                    upvotes: 5,
                    downvotes: 0
                },
                {
                    id: 502,
                    author: 'Ismail Khan',
                    avatar: 'IK',
                    timeAgo: '1 day ago',
                    content: 'Did you use a consultant or handled the application yourself?',
                    upvotes: 3,
                    downvotes: 0
                }
            ],
            tags: ['halal', 'JAKIM', 'certification', 'food business']
        }
    ]);

    // Filter posts based on active tab and search query
    const filteredPosts = posts.filter(post =>
        (activeTab === 'All Topics' || post.topic === activeTab) &&
        (searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Handle upvote
    const handleUpvote = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, upvotes: post.upvotes + 1 }
                : post
        ));
    };

    // Handle downvote
    const handleDownvote = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, downvotes: post.downvotes + 1 }
                : post
        ));
    };

    // Handle comment upvote
    const handleCommentUpvote = (postId, commentId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? {
                    ...post,
                    comments: post.comments.map(comment =>
                        comment.id === commentId
                            ? { ...comment, upvotes: comment.upvotes + 1 }
                            : comment
                    )
                }
                : post
        ));
    };

    // Handle comment downvote
    const handleCommentDownvote = (postId, commentId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? {
                    ...post,
                    comments: post.comments.map(comment =>
                        comment.id === commentId
                            ? { ...comment, downvotes: comment.downvotes + 1 }
                            : comment
                    )
                }
                : post
        ));
    };

    // Add a new comment to a post
    const addComment = (postId) => {
        if (newComment.trim() === '') return;

        const comment = {
            id: Date.now(),
            author: 'You', // In a real app, this would be the current user
            avatar: 'YO',
            timeAgo: 'just now',
            content: newComment,
            upvotes: 0,
            downvotes: 0
        };

        setPosts(posts.map(post =>
            post.id === postId
                ? {
                    ...post,
                    comments: [...post.comments, comment]
                }
                : post
        ));

        setNewComment('');
    };

    // Add a new post
    const addNewPost = () => {
        if (newPostTitle.trim() === '' || newPostContent.trim() === '') return;

        const tagsArray = newPostTags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        const newPost = {
            id: Date.now(),
            author: 'You', // In a real app, this would be the current user
            avatar: require('../../../assets/default.jpg'),
            authorPosition: 'Business Owner',
            timeAgo: 'just now',
            topic: activeTab === 'All Topics' ? 'General' : activeTab,
            title: newPostTitle,
            content: newPostContent,
            upvotes: 0,
            downvotes: 0,
            comments: [],
            tags: tagsArray
        };

        setPosts([newPost, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostTags('');
        setShowPostModal(false);
    };

    // Render comment item
    const renderCommentItem = (comment, postId) => (
        <View style={styles.commentItem} key={comment.id}>
            <View style={styles.commentHeader}>
                <View style={styles.commentAuthorSection}>
                    <View style={[styles.avatarContainer, { width: 30, height: 30 }]}>
                        <Text style={[styles.avatarText, { fontSize: 12 }]}>{comment.avatar}</Text>
                    </View>
                    <View>
                        <Text style={styles.commentAuthorName}>{comment.author}</Text>
                        <Text style={styles.commentTimeAgo}>{comment.timeAgo}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.commentContent}>{comment.content}</Text>

            <View style={styles.commentActions}>
                <TouchableOpacity
                    style={styles.commentAction}
                    onPress={() => handleCommentUpvote(postId, comment.id)}
                >
                    <Ionicons name="arrow-up-outline" size={14} color="#6B7280" />
                    <Text style={styles.commentActionText}>{comment.upvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.commentAction}
                    onPress={() => handleCommentDownvote(postId, comment.id)}
                >
                    <Ionicons name="arrow-down-outline" size={14} color="#6B7280" />
                    <Text style={styles.commentActionText}>{comment.downvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentAction}>
                    <Ionicons name="flag-outline" size={14} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </View>
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
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUpvote(item.id)}
                >
                    <Ionicons name="arrow-up-outline" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{item.upvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownvote(item.id)}
                >
                    <Ionicons name="arrow-down-outline" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{item.downvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setExpandedCommentId(expandedCommentId === item.id ? null : item.id)}
                >
                    <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{item.comments.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Comments section */}
            {expandedCommentId === item.id && (
                <View style={styles.commentSection}>
                    <View style={styles.commentsContainer}>
                        {item.comments.length > 0 ? (
                            item.comments.map(comment => renderCommentItem(comment, item.id))
                        ) : (
                            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                        )}
                    </View>

                    {/* Add comment */}
                    <View style={styles.addCommentContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.submitCommentButton}
                            onPress={() => addComment(item.id)}
                        >
                            <Ionicons name="send" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
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
            <TouchableOpacity
                style={styles.createPostButton}
                onPress={() => setShowPostModal(true)}
            >
                <Ionicons name="create" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Create post modal */}
            <Modal
                visible={showPostModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPostModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setShowPostModal(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Post</Text>
                            <TouchableOpacity onPress={() => setShowPostModal(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContainer}>
                            <Text style={styles.inputLabel}>Title</Text>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="Write a descriptive title"
                                value={newPostTitle}
                                onChangeText={setNewPostTitle}
                            />

                            <Text style={styles.inputLabel}>Content</Text>
                            <TextInput
                                style={styles.contentInput}
                                placeholder="Share your thoughts, question or experience..."
                                value={newPostContent}
                                onChangeText={setNewPostContent}
                                multiline
                                textAlignVertical="top"
                            />

                            <Text style={styles.inputLabel}>Tags (comma separated)</Text>
                            <TextInput
                                style={styles.tagsInput}
                                placeholder="e.g. funding, marketing, digital"
                                value={newPostTags}
                                onChangeText={setNewPostTags}
                            />

                            <TouchableOpacity
                                style={styles.submitPostButton}
                                onPress={addNewPost}
                            >
                                <Text style={styles.submitPostButtonText}>Post</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    // Comment section styles
    commentSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    commentsContainer: {
        marginBottom: 12,
    },
    commentItem: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthorSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentAuthorName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
    },
    commentTimeAgo: {
        fontSize: 10,
        color: '#6B7280',
    },
    commentContent: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
        marginVertical: 4,
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: 4,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    commentActionText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 80,
    },
    submitCommentButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    noCommentsText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 8,
    },
    // Create post modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    formContainer: {
        padding: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    titleInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 16,
    },
    contentInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        height: 150,
        marginBottom: 16,
    },
    tagsInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 24,
    },
    submitPostButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitPostButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default CommunityScreen; 