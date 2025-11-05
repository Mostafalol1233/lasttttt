import { v4 as uuidv4 } from 'uuid';
import type {
  IStorage,
  NewsItem,
  Mercenary,
} from './mongodb-storage';
import type {
  InsertPost,
  Post,
  InsertComment,
  Comment,
  InsertEvent,
  Event,
  InsertNews,
  InsertTicket,
  Ticket,
  InsertTicketReply,
  TicketReply,
  InsertAdmin,
  Admin,
  InsertNewsletterSubscriber,
  NewsletterSubscriber,
  InsertSeller,
  Seller,
  InsertSellerReview,
  SellerReview,
} from '@shared/mongodb-schema';

// Lightweight, in-memory storage used as a fallback when MongoDB isn't available.
export class MemoryStorage implements IStorage {
  private posts: Post[] = [] as any;
  private comments: Comment[] = [] as any;
  private events: Event[] = [] as any;
  private news: NewsItem[] = [] as any;
  private mercenaries: Mercenary[] = [] as any;
  private tickets: Ticket[] = [] as any;
  private ticketReplies: TicketReply[] = [] as any;
  private admins: Admin[] = [] as any;
  private newsletterSubscribers: NewsletterSubscriber[] = [] as any;
  private sellers: Seller[] = [] as any;
  private sellerReviews: SellerReview[] = [] as any;

  constructor() {
    // Seed a default admin so login can work in development.
    const admin: any = {
      id: uuidv4(),
      username: 'admin',
      password: '$2a$10$eW91ci1kZWZhdWx0LXBhc3N3b3JkLWhhc2g........', // dummy
      role: 'admin',
      createdAt: new Date(),
    };
    this.admins.push(admin);

    this.mercenaries = [
      { id: '1', name: 'Wolf', image: '/assets/merc-wolf.jpg', role: 'Assault' },
      { id: '2', name: 'Vipers', image: '/assets/merc-vipers.jpg', role: 'Sniper' },
      { id: '3', name: 'Sisterhood', image: '/assets/merc-sisterhood.jpg', role: 'Medic' },
    ];

    // Seed some sample posts and news so the site has visible content when MongoDB isn't available.
    const now = new Date();
    const samplePost1: any = {
      id: uuidv4(),
      title: 'Top 5 CrossFire Weapons — 2025 Review',
      content: 'A deep dive into the top 5 weapons in CrossFire for 2025...',
      summary: 'Quick guide to the best weapons in 2025 for competitive play.',
      image: '/assets/feature-crossfire.jpg',
      category: 'Reviews',
      tags: ['Weapons', 'Review'],
      author: 'Bimora Team',
      featured: false,
      readingTime: 4,
      views: 123,
      createdAt: now,
    };

    const samplePost2: any = {
      id: uuidv4(),
      title: 'How to Master the New Mid Line Map',
      content: 'Strategies and tips to control Mid Line map...',
      summary: 'Learn pro tips to dominate Mid Line in Search & Destroy.',
      image: '/assets/feature-crossfire.jpg',
      category: 'Tutorials',
      tags: ['Maps', 'Guide'],
      author: 'Bimora Team',
      featured: true,
      readingTime: 6,
      views: 98,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
    };

    const samplePost3: any = {
      id: uuidv4(),
      title: 'Player Experience: CFS Super Fans Event Review',
      content: 'Our hands-on review of the CFS Super Fans event and rewards...',
      summary: 'Event review and what you should aim to collect.',
      image: '/assets/news-superfans.jpg',
      category: 'Reviews',
      tags: ['Event', 'Review'],
      author: 'Bimora Team',
      featured: false,
      readingTime: 3,
      views: 45,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48),
    };

    this.posts = [samplePost1, samplePost2, samplePost3];

    this.news = [
      {
        id: uuidv4(),
        title: 'Mystic Moonlight Market',
        dateRange: 'Oct 29 - Nov 11',
        image: '/assets/news-sapphire.jpg',
        category: 'Event',
        content: 'Explore the enchanting Mystic Moonlight Market event!',
        author: '[GM]Xenon',
        featured: true,
        createdAt: now,
      },
      {
        id: uuidv4(),
        title: 'CF Shop Special Sale',
        dateRange: 'Oct 8 - Oct 22',
        image: '/assets/news-shop.jpg',
        category: 'Sale',
        content: 'Don\'t miss our biggest CF Shop sale of the year!',
        author: '[GM]Xenon',
        featured: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      },
    ];
  }

  // Users
  async getUser(id: string) {
    return undefined;
  }
  async getUserByUsername(username: string) {
    return undefined;
  }
  async createUser(user: any) {
    const u = { ...user, id: uuidv4(), createdAt: new Date() } as any;
    return u;
  }

  // Posts
  async getAllPosts(): Promise<Post[]> {
    return this.posts;
  }
  async getPostById(id: string): Promise<Post | undefined> {
    return this.posts.find((p) => p.id === id) as any;
  }
  async createPost(post: InsertPost): Promise<Post> {
    const p: any = { ...post, id: uuidv4(), createdAt: new Date(), views: 0 };
    this.posts.unshift(p);
    return p;
  }
  async updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined> {
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.posts[idx] = { ...this.posts[idx], ...post } as any;
    return this.posts[idx];
  }
  async deletePost(id: string): Promise<boolean> {
    const before = this.posts.length;
    this.posts = this.posts.filter((p) => p.id !== id) as any;
    return this.posts.length < before;
  }
  async incrementPostViews(id: string): Promise<void> {
    const p = this.posts.find((p) => p.id === id);
    if (p) p.views = (p.views || 0) + 1;
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return this.comments.filter((c) => c.postId === postId) as any;
  }
  async createComment(comment: InsertComment): Promise<Comment> {
    const c: any = { ...comment, id: uuidv4(), createdAt: new Date() };
    this.comments.push(c);
    return c;
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return this.events;
  }
  async getEventById(id: string): Promise<Event | undefined> {
    return this.events.find((e) => e.id === id);
  }
  async createEvent(event: InsertEvent): Promise<Event> {
    const e: any = { ...event, id: uuidv4(), createdAt: new Date() };
    this.events.unshift(e);
    return e;
  }
  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    this.events[idx] = { ...this.events[idx], ...event } as any;
    return this.events[idx];
  }
  async deleteEvent(id: string): Promise<boolean> {
    const before = this.events.length;
    this.events = this.events.filter((e) => e.id !== id) as any;
    return this.events.length < before;
  }

  // News
  async getAllNews(): Promise<NewsItem[]> {
    return this.news;
  }
  async createNews(news: Partial<NewsItem>): Promise<NewsItem> {
    const n: any = { ...news, id: uuidv4(), createdAt: new Date() };
    this.news.unshift(n);
    return n;
  }
  async updateNews(id: string, news: Partial<NewsItem>): Promise<NewsItem | undefined> {
    const idx = this.news.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    this.news[idx] = { ...this.news[idx], ...news } as any;
    return this.news[idx];
  }
  async deleteNews(id: string): Promise<boolean> {
    const before = this.news.length;
    this.news = this.news.filter((n) => n.id !== id) as any;
    return this.news.length < before;
  }

  // Mercenaries
  async getAllMercenaries(): Promise<Mercenary[]> {
    return this.mercenaries;
  }

  // Tickets
  async getAllTickets(): Promise<Ticket[]> {
    return this.tickets;
  }
  async getTicketById(id: string): Promise<Ticket | undefined> {
    return this.tickets.find((t) => t.id === id) as any;
  }
  async getTicketsByEmail(email: string): Promise<Ticket[]> {
    return this.tickets.filter((t) => t.userEmail === email) as any;
  }
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const t: any = { ...ticket, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() };
    this.tickets.unshift(t);
    return t;
  }
  async updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const idx = this.tickets.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.tickets[idx] = { ...this.tickets[idx], ...ticket, updatedAt: new Date() } as any;
    return this.tickets[idx];
  }
  async deleteTicket(id: string): Promise<boolean> {
    const before = this.tickets.length;
    this.tickets = this.tickets.filter((t) => t.id !== id) as any;
    return this.tickets.length < before;
  }

  async getTicketReplies(ticketId: string): Promise<TicketReply[]> {
    return this.ticketReplies.filter((r) => r.ticketId === ticketId) as any;
  }
  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    const r: any = { ...reply, id: uuidv4(), createdAt: new Date() };
    this.ticketReplies.push(r);
    return r;
  }

  // Admins
  async getAllAdmins(): Promise<Admin[]> {
    return this.admins;
  }
  async getAdminById(id: string): Promise<Admin | undefined> {
    return this.admins.find((a: any) => a.id === id) as any;
  }
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return this.admins.find((a: any) => a.username === username) as any;
  }
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const a: any = { ...admin, id: uuidv4(), createdAt: new Date() };
    this.admins.unshift(a);
    return a;
  }
  async updateAdmin(id: string, admin: Partial<InsertAdmin>): Promise<Admin | undefined> {
    const idx = this.admins.findIndex((a: any) => a.id === id);
    if (idx === -1) return undefined;
    this.admins[idx] = { ...this.admins[idx], ...admin } as any;
    return this.admins[idx];
  }
  async deleteAdmin(id: string): Promise<boolean> {
    const before = this.admins.length;
    this.admins = this.admins.filter((a: any) => a.id !== id) as any;
    return this.admins.length < before;
  }

  // Newsletter subscribers
  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.newsletterSubscribers;
  }
  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    return this.newsletterSubscribers.find((s: any) => s.email === email) as any;
  }
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const s: any = { ...subscriber, id: uuidv4(), createdAt: new Date() };
    this.newsletterSubscribers.unshift(s);
    return s;
  }
  async deleteNewsletterSubscriber(id: string): Promise<boolean> {
    const before = this.newsletterSubscribers.length;
    this.newsletterSubscribers = this.newsletterSubscribers.filter((s: any) => s.id !== id) as any;
    return this.newsletterSubscribers.length < before;
  }

  // Sellers
  async getAllSellers(): Promise<Seller[]> {
    return this.sellers;
  }
  async getSellerById(id: string): Promise<Seller | undefined> {
    return this.sellers.find((s) => s.id === id) as any;
  }
  async createSeller(seller: InsertSeller): Promise<Seller> {
    const s: any = { ...seller, id: uuidv4(), createdAt: new Date(), images: seller.images || [], prices: seller.prices || [], averageRating: 0, totalReviews: 0 };
    this.sellers.unshift(s);
    return s;
  }
  async updateSeller(id: string, seller: Partial<InsertSeller>): Promise<Seller | undefined> {
    const idx = this.sellers.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.sellers[idx] = { ...this.sellers[idx], ...seller } as any;
    return this.sellers[idx];
  }
  async deleteSeller(id: string): Promise<boolean> {
    const before = this.sellers.length;
    this.sellers = this.sellers.filter((s) => s.id !== id) as any;
    this.sellerReviews = this.sellerReviews.filter((r) => r.sellerId !== id) as any;
    return this.sellers.length < before;
  }

  async getSellerReviews(sellerId: string): Promise<SellerReview[]> {
    return this.sellerReviews.filter((r) => r.sellerId === sellerId) as any;
  }
  async createSellerReview(review: InsertSellerReview): Promise<SellerReview> {
    const r: any = { ...review, id: uuidv4(), createdAt: new Date() };
    this.sellerReviews.push(r);
    await this.updateSellerRating(review.sellerId);
    return r;
  }
  async deleteSellerReview(reviewId: string): Promise<boolean> {
    const before = this.sellerReviews.length;
    const removed = this.sellerReviews.find((r) => r.id === reviewId);
    if (!removed) return false;
    this.sellerReviews = this.sellerReviews.filter((r) => r.id !== reviewId) as any;
    await this.updateSellerRating(removed.sellerId);
    return this.sellerReviews.length < before;
  }
  async updateSellerRating(sellerId: string): Promise<void> {
    const reviews = this.sellerReviews.filter((r) => r.sellerId === sellerId);
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
    const seller = this.sellers.find((s) => s.id === sellerId) as any;
    if (seller) {
      seller.averageRating = Math.round(averageRating * 10) / 10;
      seller.totalReviews = totalReviews;
    }
  }
}
