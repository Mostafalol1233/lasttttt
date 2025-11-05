import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema, insertEventSchema, insertNewsSchema, insertTicketSchema, insertTicketReplySchema, insertAdminSchema, insertNewsletterSubscriberSchema, insertSellerSchema, insertSellerReviewSchema } from "@shared/mongodb-schema";
import { generateToken, verifyAdminPassword, requireAuth, requireSuperAdmin, requireAdminOrTicketManager, comparePassword, hashPassword } from "./utils/auth";
import { calculateReadingTime, generateSummary, formatDate } from "./utils/helpers";

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Rate limiter for image uploads - 10 uploads per hour per IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: "Too many upload requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username && password) {
        const admin = await storage.getAdminByUsername(username);
        
        if (!admin) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const isValid = await comparePassword(password, admin.password);
        
        if (!isValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken({ 
          id: admin.id, 
          username: admin.username, 
          role: admin.role 
        });
        
        res.json({ 
          token, 
          admin: { 
            id: admin.id, 
            username: admin.username, 
            role: admin.role 
          } 
        });
      } else if (password) {
        const isValid = await verifyAdminPassword(password);
        
        if (!isValid) {
          return res.status(401).json({ error: "Invalid password" });
        }

        const token = generateToken({ role: "super_admin" });
        res.json({ token, admin: { role: "super_admin" } });
      } else {
        return res.status(400).json({ error: "Username and password or password required" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { category, search, featured } = req.query;
      let posts = await storage.getAllPosts();

      if (category && category !== "all") {
        posts = posts.filter(
          (post) => post.category.toLowerCase() === (category as string).toLowerCase()
        );
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        posts = posts.filter(
          (post) =>
            post.title.toLowerCase().includes(searchLower) ||
            post.summary.toLowerCase().includes(searchLower) ||
            post.content.toLowerCase().includes(searchLower) ||
            post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      if (featured === "true") {
        posts = posts.filter((post) => post.featured);
      }

      const formattedPosts = posts.map((post) => ({
        ...post,
        date: formatDate(post.createdAt),
      }));

      res.json(formattedPosts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      await storage.incrementPostViews(req.params.id);

      const formattedPost = {
        ...post,
        date: formatDate(post.createdAt),
      };

      res.json(formattedPost);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      
      const readingTime = data.readingTime || calculateReadingTime(data.content);
      const summary = data.summary || generateSummary(data.content);
      
      const post = await storage.createPost({
        ...data,
        readingTime,
        summary,
      });

      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      
      if (updates.content && !updates.readingTime) {
        updates.readingTime = calculateReadingTime(updates.content);
      }
      
      if (updates.content && !updates.summary) {
        updates.summary = generateSummary(updates.content);
      }

      const post = await storage.updatePost(req.params.id, updates);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deletePost(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Comment routes
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPostId(req.params.id);
      
      const formattedComments = comments.map((comment) => ({
        ...comment,
        date: formatDate(comment.createdAt),
      }));

      res.json(formattedComments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const { author, content, parentCommentId } = req.body;
      
      const commentData = {
        postId: id,
        name: author,
        content,
        parentCommentId: parentCommentId || undefined,
      };
      
      const data = insertCommentSchema.parse(commentData);
      const comment = await storage.createComment(data);
      
      const formattedComment = {
        ...comment,
        date: formatDate(comment.createdAt),
      };

      res.status(201).json(formattedComment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check for load balancers / Netlify proxy
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, time: Date.now() });
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats route for admin
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const allComments = await Promise.all(
        posts.map((post) => storage.getCommentsByPostId(post.id))
      );
      const totalComments = allComments.flat().length;
      const totalViews = posts.reduce((sum, post) => sum + post.views, 0);

      res.json({
        totalPosts: posts.length,
        totalComments,
        totalViews,
        recentPosts: posts.slice(0, 5).map((post) => ({
          ...post,
          date: formatDate(post.createdAt),
        })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/news", requireAuth, async (req, res) => {
    try {
      const data = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(data);
      res.status(201).json(news);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/news/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const news = await storage.updateNews(req.params.id, updates);
      
      if (!news) {
        return res.status(404).json({ error: "News item not found" });
      }

      res.json(news);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/news/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteNews(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "News item not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mercenaries routes
  app.get("/api/mercenaries", async (req, res) => {
    try {
      const mercenaries = await storage.getAllMercenaries();
      res.json(mercenaries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Ticket routes
  app.get("/api/tickets", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const tickets = await storage.getAllTickets();
      
      const formattedTickets = tickets.map((ticket) => {
        const formatted = {
          ...ticket,
          createdAt: formatDate(ticket.createdAt),
          updatedAt: formatDate(ticket.updatedAt),
        };
        
        if (user.role !== 'super_admin') {
          delete (formatted as any).userEmail;
        }
        
        return formatted;
      });
      
      res.json(formattedTickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tickets/my/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const tickets = await storage.getTicketsByEmail(email);
      const formattedTickets = tickets.map((ticket) => ({
        ...ticket,
        createdAt: formatDate(ticket.createdAt),
        updatedAt: formatDate(ticket.updatedAt),
      }));
      res.json(formattedTickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicketById(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const formattedTicket = {
        ...ticket,
        createdAt: formatDate(ticket.createdAt),
        updatedAt: formatDate(ticket.updatedAt),
      };

      res.json(formattedTicket);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const data = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(data);
      
      const formattedTicket = {
        ...ticket,
        createdAt: formatDate(ticket.createdAt),
        updatedAt: formatDate(ticket.updatedAt),
      };

      res.status(201).json(formattedTicket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tickets/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const ticket = await storage.updateTicket(req.params.id, updates);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const formattedTicket = {
        ...ticket,
        createdAt: formatDate(ticket.createdAt),
        updatedAt: formatDate(ticket.updatedAt),
      };

      res.json(formattedTicket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tickets/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTicket(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tickets/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getTicketReplies(req.params.id);
      
      const formattedReplies = replies.map((reply) => ({
        ...reply,
        createdAt: formatDate(reply.createdAt),
      }));

      res.json(formattedReplies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tickets/:id/replies", async (req, res) => {
    try {
      const { id } = req.params;
      const { authorName, content, isAdmin } = req.body;
      
      const replyData = {
        ticketId: id,
        authorName,
        content,
        isAdmin: isAdmin || false,
      };
      
      const data = insertTicketReplySchema.parse(replyData);
      const reply = await storage.createTicketReply(data);
      
      const formattedReply = {
        ...reply,
        createdAt: formatDate(reply.createdAt),
      };

      res.status(201).json(formattedReply);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin management routes (restricted to super admins only)
  app.get("/api/admins", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      const sanitizedAdmins = admins.map(({ password, ...admin }) => admin);
      res.json(sanitizedAdmins);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admins", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const data = insertAdminSchema.parse({
        username,
        password: hashedPassword,
        role: role || "admin",
      });
      
      const admin = await storage.createAdmin(data);
      const { password: _, ...sanitizedAdmin } = admin;
      
      res.status(201).json(sanitizedAdmin);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admins/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const updates: any = {};
      
      if (req.body.username !== undefined) updates.username = req.body.username;
      if (req.body.password !== undefined) {
        updates.password = await hashPassword(req.body.password);
      }
      if (req.body.role !== undefined) updates.role = req.body.role;

      const admin = await storage.updateAdmin(req.params.id, updates);
      
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      const { password: _, ...sanitizedAdmin } = admin;
      res.json(sanitizedAdmin);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admins/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteAdmin(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Event detail routes
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const event = await storage.updateEvent(req.params.id, updates);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Newsletter subscriber routes (restricted to super admins only)
  app.get("/api/newsletter-subscribers", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getAllNewsletterSubscribers();
      res.json(subscribers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/newsletter-subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const existing = await storage.getNewsletterSubscriberByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already subscribed" });
      }

      const data = insertNewsletterSubscriberSchema.parse({ email });
      const subscriber = await storage.createNewsletterSubscriber(data);
      
      res.status(201).json(subscriber);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/newsletter-subscribers/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteNewsletterSubscriber(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Subscriber not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Image upload route with rate limiting
  app.post("/api/upload-image", uploadLimiter, requireAuth, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Create form data for catbox.moe
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      
      // Convert buffer to blob for FormData
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append('fileToUpload', blob, req.file.originalname);

      // Upload to catbox.moe
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload to catbox.moe');
      }

      const imageUrl = await response.text();
      
      res.json({ url: imageUrl.trim() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seller routes
  app.get("/api/sellers", async (req, res) => {
    try {
      const sellers = await storage.getAllSellers();
      res.json(sellers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sellers/:id", async (req, res) => {
    try {
      const seller = await storage.getSellerById(req.params.id);
      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }
      res.json(seller);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sellers", requireAuth, async (req, res) => {
    try {
      const data = insertSellerSchema.parse(req.body);
      const seller = await storage.createSeller(data);
      res.json(seller);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/sellers/:id", requireAuth, async (req, res) => {
    try {
      const data = insertSellerSchema.partial().parse(req.body);
      const seller = await storage.updateSeller(req.params.id, data);
      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }
      res.json(seller);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/sellers/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteSeller(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Seller not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seller Review routes
  app.get("/api/sellers/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getSellerReviews(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Limit reviews to 1 per IP per seller per hour to reduce spam
  const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1,
    // Generate a key per IP + seller id. Use a safe accessor and cast to any to avoid TS mismatches.
    // Use express-rate-limit's ipKeyGenerator to correctly handle IPv6 and forwarded headers.
    keyGenerator: (req: any) => {
      const ip = (ipKeyGenerator as any)(req) || 'unknown';
      const sellerId = req.params?.id || '';
      return `${ip}:${sellerId}`;
    },
    handler: (_req, res /*, next */) => {
      res.status(429).json({ error: 'Too many reviews from this IP for this seller. Try again later.' });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/sellers/:id/reviews", reviewLimiter, async (req, res) => {
    try {
      const data = insertSellerReviewSchema.parse({
        ...req.body,
        sellerId: req.params.id,
      });
      // Prevent multiple reviews by the same userName for the same seller
      const existing = await storage.getSellerReviews(req.params.id);
      const exists = existing.some((r) => (r.userName || '').toLowerCase() === (data.userName || '').toLowerCase());
      if (exists) {
        return res.status(400).json({ error: 'You have already reviewed this seller' });
      }

      const review = await storage.createSellerReview(data);
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Allow admins to delete a seller review
  app.delete("/api/sellers/:id/reviews/:reviewId", requireAuth, requireAdminOrTicketManager, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const deleted = await storage.deleteSellerReview(reviewId);
      if (!deleted) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
