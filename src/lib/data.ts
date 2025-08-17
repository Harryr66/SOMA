
import { type Post, type Artwork, type Artist, type Story, type Event, type ChatMessage, type Discussion, type Reply } from './types';

export const artists: Artist[] = [
    { id: 'artist-1', name: 'Elena Vance', handle: '@elena_art', avatarUrl: 'https://placehold.co/96x96.png' },
    { id: 'artist-2', name: 'Liam Kenji', handle: '@liam_kenji', avatarUrl: 'https://placehold.co/96x96.png' },
    { id: 'artist-3', name: 'Aria Chen', handle: '@aria_draws', avatarUrl: 'https://placehold.co/96x96.png' },
    { id: 'artist-4', name: 'Noah Patel', handle: '@noah_paints', avatarUrl: 'https://placehold.co/96x96.png' },
    { id: 'artist-5', name: 'Sofia Reyes', handle: '@sofia_reyes', avatarUrl: 'https://placehold.co/96x96.png' },
    { id: 'artist-6', name: 'Ethan James', handle: '@ethan_creates', avatarUrl: 'https://placehold.co/96x96.png' },
    { id: 'artist-7', name: 'Chloe Kim', handle: '@chloe_kim_art', avatarUrl: 'https://placehold.co/96x96.png' },
    { id: 'artist-8', name: 'Mason Brooks', handle: '@mason_brooks', avatarUrl: 'https://placehold.co/96x96.png' },
];

export const repliesData: Reply[] = [
    {
        id: 'reply-1',
        author: artists[2],
        timestamp: '2h ago',
        content: 'This is incredible! The use of color is masterful.',
        upvotes: 15,
        downvotes: 0,
        replyCount: 1,
        replies: [
            {
                id: 'reply-1-1',
                author: artists[0],
                timestamp: '1h ago',
                content: "Thank you so much, Aria! I really appreciate that. I was aiming for that ethereal glow.",
                upvotes: 5,
                downvotes: 0,
            }
        ],
    },
    {
        id: 'reply-2',
        author: artists[4],
        timestamp: '1h ago',
        content: "I agree, I'm getting lost in the details. Inspiring work!",
        upvotes: 8,
        downvotes: 0,
    }
];

export const discussionsData: Discussion[] = [
    {
        id: 'discussion-1',
        title: "Feedback on 'Cosmic Awakening'",
        author: artists[0],
        timestamp: '3h ago',
        content: 'Just posted this new piece and would love to hear your thoughts! I was trying to capture the feeling of a new idea forming. Does that come across?',
        upvotes: 42,
        downvotes: 2,
        isPinned: true,
        replyCount: 3, // Updated to include nested reply
        replies: repliesData,
    },
    {
        id: 'discussion-2',
        title: "Discussion for 'City at Dusk'",
        author: artists[1],
        timestamp: '5h ago',
        content: "Finally finished this commission of a cityscape at dusk. So happy with how the lighting turned out.",
        upvotes: 34,
        downvotes: 1,
        isPinned: false,
        replyCount: 0,
        replies: [],
    },
    {
        id: 'discussion-3',
        title: "Thoughts on 'Porcelain Dreams' (WIP)?",
        author: artists[3],
        timestamp: '1d ago',
        content: "Work in progress. Something a little different for me.",
        upvotes: 7,
        downvotes: 0,
        isPinned: false,
        replyCount: 0,
        replies: [],
    },
    {
        id: 'discussion-brushes',
        title: "What are your favorite brushes for digital painting?",
        author: artists[3],
        timestamp: '1d ago',
        content: "I'm looking to expand my toolkit. Currently using Procreate, but open to suggestions for any software. What are your go-to brushes for texture and blending?",
        upvotes: 18,
        downvotes: 0,
        isPinned: false,
        replyCount: 0,
    },
    {
        id: 'discussion-event-1',
        title: "Discussion for Summer Gallery Opening",
        author: artists[0],
        timestamp: '1w ago',
        content: "Excited to announce my summer gallery opening! It will feature my latest collection, 'Chromatic Echoes'. Can't wait to see you all there. Let me know if you have any questions!",
        upvotes: 50,
        downvotes: 1,
        isPinned: false,
        replyCount: 0,
        replies: [],
    },
    {
        id: 'discussion-event-2',
        title: "Discussion for Live Charity Auction",
        author: artists[1],
        timestamp: '2w ago',
        content: "We're hosting a live charity auction to support emerging artists. All proceeds go to the ArtStart Foundation. Your participation can make a real difference!",
        upvotes: 75,
        downvotes: 0,
        isPinned: true,
        replyCount: 0,
        replies: [],
    },
    {
        id: 'discussion-event-3',
        title: "Discussion for Watercolor Workshop",
        author: artists[2],
        timestamp: '3d ago',
        content: "Join my upcoming watercolor workshop! We'll cover everything from basic techniques to advanced color theory. It's going to be a lot of fun. Limited spots available!",
        upvotes: 32,
        downvotes: 0,
        isPinned: false,
        replyCount: 0,
        replies: [],
    }
];

export const artworkData: Artwork[] = [
    { id: 'art-1', artist: artists[0], title: 'Cosmic Awakening', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'abstract space', discussionId: 'discussion-1', tags: ['abstract', 'space', 'vibrant', 'oil painting'] },
    { id: 'art-2', artist: artists[1], title: 'City at Dusk', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'cityscape painting', discussionId: 'discussion-2', tags: ['cityscape', 'realism', 'impressionism', 'oil painting'] },
    { id: 'art-3', artist: artists[2], title: 'Silent Forest', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'forest watercolor', tags: ['landscape', 'watercolor', 'serene', 'forest'] },
    { id: 'art-4', artist: artists[3], title: 'Porcelain Dreams', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'portrait woman', discussionId: 'discussion-3', tags: ['portrait', 'realism', 'figurative', 'pastel'] },
    { id: 'art-5', artist: artists[4], title: 'Geometric Chaos', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'geometric abstract', tags: ['abstract', 'geometric', 'vibrant', 'digital art'] },
    { id: 'art-6', artist: artists[5], title: 'Ocean\'s Breath', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'ocean waves', tags: ['seascape', 'realism', 'calm', 'oil painting'] },
    { id: 'art-7', artist: artists[0], title: 'Ephemeral Bloom', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'flower painting', tags: ['botanical', 'impressionism', 'vibrant', 'flower'] },
    { id: 'art-8', artist: artists[1], title: 'Retro Future', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'retro collage', tags: ['collage', 'retro', 'futurism', 'mixed media'] },
    { id: 'art-9', artist: artists[2], title: 'Fading Memories', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'abstract portrait', tags: ['abstract', 'portrait', 'melancholy', 'charcoal'] },
    { id: 'art-10', artist: artists[3], title: 'Still Life with Skull', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'still life', tags: ['still life', 'realism', 'dark', 'oil painting'] },
    { id: 'art-11', artist: artists[4], title: 'Bronze Minotaur', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'bronze sculpture', tags: ['sculpture', 'mythology', 'bronze', 'figurative'] },
    { id: 'art-12', artist: artists[5], title: 'Paper Birds', imageUrl: 'https://placehold.co/800x800.png', imageAiHint: 'origami art', tags: ['sculpture', 'minimalism', 'animal', 'paper'] },
];

export const postData: Post[] = [
    {
        id: 'post-1',
        artworkId: 'art-1',
        artist: artists[0],
        imageUrl: artworkData[0].imageUrl,
        imageAiHint: artworkData[0].imageAiHint,
        caption: 'My latest piece, "Cosmic Awakening". Let me know what you think!',
        likes: 128,
        commentsCount: 12,
        timestamp: '3h ago',
        createdAt: Date.now() - 3 * 60 * 60 * 1000,
        discussionId: 'discussion-1',
        listing: { type: 'sale' }
    },
    {
        id: 'post-2',
        artworkId: 'art-2',
        artist: artists[1],
        imageUrl: artworkData[1].imageUrl,
        imageAiHint: artworkData[1].imageAiHint,
        caption: 'Finally finished this commission of a cityscape at dusk. So happy with how the lighting turned out.',
        likes: 256,
        commentsCount: 34,
        timestamp: '5h ago',
        createdAt: Date.now() - 5 * 60 * 60 * 1000,
        discussionId: 'discussion-2',
    },
    {
        id: 'post-3',
        artworkId: 'art-4',
        artist: artists[3],
        imageUrl: artworkData[3].imageUrl,
        imageAiHint: artworkData[3].imageAiHint,
        caption: 'Work in progress. Something a little different for me.',
        likes: 98,
        commentsCount: 7,
        timestamp: '1d ago',
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        discussionId: 'discussion-3',
        listing: { type: 'auction', endDate: '3 days' }
    }
];

export const storiesData: Story[] = [
    { id: 's1', artist: artists[0] },
    { id: 's2', artist: artists[1] },
    { id: 's3', artist: artists[2] },
    { id: 's4', artist: artists[3] },
    { id: 's5', artist: artists[4] },
    { id: 's6', artist: artists[5] },
    { id: 's7', artist: artists[6] },
    { id: 's8', artist: artists[7] },
];

export const eventsData: Event[] = [
    { 
        id: 'event-1', 
        title: 'Summer Gallery Opening', 
        imageUrl: 'https://placehold.co/600x338.png', 
        imageAiHint: 'art gallery', 
        date: 'August 15, 2024', 
        type: 'Exhibition',
        artist: artists[0],
        locationType: 'In-person',
        locationName: 'Vance Art Gallery',
        locationAddress: '123 Art Street, New York, NY',
        description: "Join Elena Vance for the opening of her summer gallery, featuring her latest collection 'Chromatic Echoes'. Mingle with the artist and enjoy an evening of stunning visual art.",
        discussionId: 'discussion-event-1',
    },
    { 
        id: 'event-2', 
        title: 'Live Charity Auction', 
        imageUrl: 'https://placehold.co/600x338.png', 
        imageAiHint: 'art auction', 
        date: 'September 1, 2024', 
        type: 'Auction',
        artist: artists[1],
        locationType: 'Online',
        description: "Bid on exclusive pieces from top artists in our live online auction. All proceeds benefit the ArtStart Foundation, supporting the next generation of creators.",
        discussionId: 'discussion-event-2',
    },
    { 
        id: 'event-3', 
        title: 'Watercolor Workshop', 
        imageUrl: 'https://placehold.co/600x338.png', 
        imageAiHint: 'art workshop', 
        date: 'September 10, 2024', 
        type: 'Workshop',
        artist: artists[2],
        locationType: 'Online',
        description: "Learn the art of watercolor from master artist Aria Chen. This interactive online workshop is suitable for all skill levels. Limited spots available!",
        discussionId: 'discussion-event-3',
    },
];

export const connections: Artist[] = artists.slice(0, 4);

export const exclusiveContentData: Artwork[] = artworkData.slice(8, 12);

export const chatMessages: ChatMessage[] = [
    { id: 'msg1', user: { name: 'Liam Kenji', avatarUrl: artists[1].avatarUrl }, text: 'Hey everyone, excited to be here!', timestamp: '10:30 AM' },
    { id: 'msg2', user: { name: 'Aria Chen', avatarUrl: artists[2].avatarUrl }, text: 'Welcome, Liam! Your work is amazing.', timestamp: '10:32 AM' },
    { id: 'msg3', user: { name: 'Elena Vance', avatarUrl: artists[0].avatarUrl }, text: 'Just dropped some new exclusive content for you all!', timestamp: '11:00 AM', isOwnMessage: true },
];
