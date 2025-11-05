import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Eye,
  MessageSquare,
  FileText,
  Plus,
  Trash2,
  Edit,
  LogOut,
  Upload,
  Copy,
  CheckCircle,
  Users,
  Mail,
  Languages,
  Calendar,
  Newspaper,
  LayoutDashboard,
  LifeBuoy,
  Shield,
  Store,
  Star,
  User,
} from "lucide-react";
import { useLocation } from "wouter";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminRole, setAdminRole] = useState<string>("");
  const [adminUsername, setAdminUsername] = useState<string>("");
  
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [isCreatingSeller, setIsCreatingSeller] = useState(false);
  const [editingSeller, setEditingSeller] = useState<any>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<string>("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Reviews management (super_admin only)
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [activeSellerForReviews, setActiveSellerForReviews] = useState<any | null>(null);
  const [sellerReviews, setSellerReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    const username = localStorage.getItem("adminUsername");
    
    if (!token) {
      setLocation("/admin/login");
    } else {
      setAdminRole(role || "");
      setAdminUsername(username || "");
    }
  }, [setLocation]);

  const isSuperAdmin = adminRole === "super_admin";

  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    summary: "",
    image: "",
    category: "Tutorials",
    tags: "",
    author: "Bimora Team",
    featured: false,
    readingTime: 5,
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    date: "",
    type: "upcoming" as "upcoming" | "trending",
    image: "",
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    titleAr: "",
    dateRange: "",
    image: "",
    category: "News",
    content: "",
    contentAr: "",
    author: "Bimora Team",
    featured: false,
  });

  const [sellerForm, setSellerForm] = useState({
    name: "",
    description: "",
    images: "",
    prices: "",
    email: "",
    phone: "",
    whatsapp: "",
    discord: "",
    website: "",
    featured: false,
    promotionText: "",
  });

  const [adminForm, setAdminForm] = useState({
    username: "",
    password: "",
    role: "admin" as "admin" | "super_admin",
  });

  const { data: stats } = useQuery<{
    totalPosts: number;
    totalComments: number;
    totalViews: number;
    recentPosts: any[];
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: posts } = useQuery<any[]>({
    queryKey: ["/api/posts"],
  });

  const { data: events } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  const { data: newsItems } = useQuery<any[]>({
    queryKey: ["/api/news"],
  });

  const { data: tickets } = useQuery<any[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: admins } = useQuery<any[]>({
    queryKey: ["/api/admins"],
    enabled: isSuperAdmin,
  });

  const { data: subscribers } = useQuery<any[]>({
    queryKey: ["/api/newsletter-subscribers"],
    enabled: isSuperAdmin,
  });

  const { data: sellers } = useQuery<any[]>({
    queryKey: ["/api/sellers"],
  });

  const createPostMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/posts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsCreatingPost(false);
      resetPostForm();
      toast({ title: "Post created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/posts/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditingPost(null);
      setIsCreatingPost(false);
      resetPostForm();
      toast({ title: "Post updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update post", variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/posts/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete post", variant: "destructive" });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/events", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreatingEvent(false);
      resetEventForm();
      toast({ title: "Event created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/events/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setEditingEvent(null);
      setIsCreatingEvent(false);
      resetEventForm();
      toast({ title: "Event updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update event", variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/events/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/news", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setIsCreatingNews(false);
      resetNewsForm();
      toast({ title: "News item created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create news item", variant: "destructive" });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/news/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setEditingNews(null);
      setIsCreatingNews(false);
      resetNewsForm();
      toast({ title: "News item updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update news item", variant: "destructive" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/news/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "News item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete news item", variant: "destructive" });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admins", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      setIsCreatingAdmin(false);
      resetAdminForm();
      toast({ title: "Admin created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create admin", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/admins/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      setEditingAdmin(null);
      setIsCreatingAdmin(false);
      resetAdminForm();
      toast({ title: "Admin updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update admin", variant: "destructive" });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admins/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      toast({ title: "Admin deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete admin", variant: "destructive" });
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/newsletter-subscribers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter-subscribers"] });
      toast({ title: "Subscriber deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete subscriber", variant: "destructive" });
    },
  });

  const createSellerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/sellers", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers"] });
      setIsCreatingSeller(false);
      resetSellerForm();
      toast({ title: "Seller created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create seller", variant: "destructive" });
    },
  });

  const updateSellerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/sellers/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers"] });
      setEditingSeller(null);
      setIsCreatingSeller(false);
      resetSellerForm();
      toast({ title: "Seller updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update seller", variant: "destructive" });
    },
  });

  const deleteSellerMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/sellers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers"] });
      toast({ title: "Seller deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete seller", variant: "destructive" });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/tickets/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Ticket updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/tickets/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Ticket deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete ticket", variant: "destructive" });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedImageUrl(data.url);
      setImageFile(null);
      toast({ title: "Image uploaded successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });

  const resetPostForm = () => {
    setPostForm({
      title: "",
      content: "",
      summary: "",
      image: "",
      category: "Tutorials",
      tags: "",
      author: "Bimora Team",
      featured: false,
      readingTime: 5,
    });
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      date: "",
      type: "upcoming",
      image: "",
    });
  };

  const resetNewsForm = () => {
    setNewsForm({
      title: "",
      titleAr: "",
      dateRange: "",
      image: "",
      category: "News",
      content: "",
      contentAr: "",
      author: "Bimora Team",
      featured: false,
    });
  };

  const resetSellerForm = () => {
    setSellerForm({
      name: "",
      description: "",
      images: "",
      prices: "",
      email: "",
      phone: "",
      whatsapp: "",
      discord: "",
      website: "",
      featured: false,
      promotionText: "",
    });
  };

  const resetAdminForm = () => {
    setAdminForm({
      username: "",
      password: "",
      role: "admin",
    });
  };

  const handleImageUpload = () => {
    if (imageFile) {
      uploadImageMutation.mutate(imageFile);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(uploadedImageUrl);
    setCopied(true);
    toast({ title: "URL copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    setLocation("/");
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    
    switch (deleteType) {
      case "post":
        deletePostMutation.mutate(deleteConfirmId);
        break;
      case "event":
        deleteEventMutation.mutate(deleteConfirmId);
        break;
      case "news":
        deleteNewsMutation.mutate(deleteConfirmId);
        break;
      case "seller":
        deleteSellerMutation.mutate(deleteConfirmId);
        break;
      case "admin":
        deleteAdminMutation.mutate(deleteConfirmId);
        break;
      case "subscriber":
        deleteSubscriberMutation.mutate(deleteConfirmId);
        break;
      case "ticket":
        deleteTicketMutation.mutate(deleteConfirmId);
        break;
    }
    
    setDeleteConfirmId(null);
    setDeleteType("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" data-testid="badge-admin-username">
                {adminUsername}
              </Badge>
              <Badge 
                variant={isSuperAdmin ? "default" : "secondary"}
                data-testid="badge-admin-role"
              >
                <Shield className="h-3 w-3 mr-1" />
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6" data-testid="tabs-admin">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-posts">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="events-news" data-testid="tab-events-news">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Events & News</span>
            </TabsTrigger>
            <TabsTrigger value="sellers" data-testid="tab-sellers">
              <Store className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sellers</span>
            </TabsTrigger>
            <TabsTrigger value="translations" data-testid="tab-translations">
              <Languages className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Translations</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="admins" data-testid="tab-admins">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Admins</span>
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="subscribers" data-testid="tab-subscribers">
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Subscribers</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="tickets" data-testid="tab-tickets">
              <LifeBuoy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6" data-testid="content-dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-posts">{stats?.totalPosts || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-comments">{stats?.totalComments || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-views">{stats?.totalViews || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Image Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setUploadedImageUrl("");
                      }
                    }}
                    data-testid="input-image-upload"
                  />
                  {imageFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {imageFile.name}
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={handleImageUpload}
                  disabled={!imageFile || uploadImageMutation.isPending}
                  className="w-full"
                  data-testid="button-upload-image"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadImageMutation.isPending ? "Uploading..." : "Upload to Catbox.moe"}
                </Button>

                {uploadedImageUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Image URL:</p>
                    <div className="flex gap-2">
                      <Input
                        value={uploadedImageUrl}
                        readOnly
                        data-testid="input-uploaded-url"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyUrl}
                        data-testid="button-copy-url"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6" data-testid="content-posts">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Posts Management</h2>
              <Dialog open={isCreatingPost} onOpenChange={(open) => {
                setIsCreatingPost(open);
                if (!open) {
                  setEditingPost(null);
                  resetPostForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-post">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPost ? "Edit Post" : "Create New Post"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Title"
                      value={postForm.title}
                      onChange={(e) =>
                        setPostForm({ ...postForm, title: e.target.value })
                      }
                      data-testid="input-post-title"
                    />
                    <div className="space-y-2">
                      <div data-testid="input-post-content">
                        <ReactQuill
                          theme="snow"
                          value={postForm.content}
                          onChange={(value) =>
                            setPostForm({ ...postForm, content: value })
                          }
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['link', 'blockquote', 'code-block'],
                              ['clean']
                            ],
                          }}
                          placeholder="Write your content here..."
                          style={{ minHeight: '200px' }}
                        />
                      </div>
                    </div>
                    <Textarea
                      placeholder="Summary (optional)"
                      value={postForm.summary}
                      onChange={(e) =>
                        setPostForm({ ...postForm, summary: e.target.value })
                      }
                      rows={2}
                      data-testid="input-post-summary"
                    />
                    <Input
                      placeholder="Image URL"
                      value={postForm.image}
                      onChange={(e) =>
                        setPostForm({ ...postForm, image: e.target.value })
                      }
                      data-testid="input-post-image"
                    />
                    <select
                      value={postForm.category}
                      onChange={(e) =>
                        setPostForm({ ...postForm, category: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-md border border-input bg-background"
                      data-testid="select-post-category"
                    >
                      <option value="Tutorials">Tutorials</option>
                      <option value="News">News</option>
                      <option value="Reviews">Reviews</option>
                      <option value="Events">Events</option>
                    </select>
                    <Input
                      placeholder="Tags (comma separated)"
                      value={postForm.tags}
                      onChange={(e) =>
                        setPostForm({ ...postForm, tags: e.target.value })
                      }
                      data-testid="input-post-tags"
                    />
                    <Input
                      placeholder="Author"
                      value={postForm.author}
                      onChange={(e) =>
                        setPostForm({ ...postForm, author: e.target.value })
                      }
                      data-testid="input-post-author"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={postForm.featured}
                        onChange={(e) =>
                          setPostForm({
                            ...postForm,
                            featured: e.target.checked,
                          })
                        }
                        data-testid="checkbox-post-featured"
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                    <Button
                      onClick={() => {
                        const data = {
                          ...postForm,
                          tags: postForm.tags.split(",").map((t) => t.trim()),
                        };
                        if (editingPost) {
                          updatePostMutation.mutate({ id: editingPost.id, data });
                        } else {
                          createPostMutation.mutate(data);
                        }
                      }}
                      className="w-full"
                      data-testid="button-submit-post"
                    >
                      {editingPost ? "Update Post" : "Create Post"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {posts?.map((post: any) => (
                <Card key={post.id} data-testid={`post-card-${post.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold">{post.title}</h3>
                          {post.featured && (
                            <Badge variant="default" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.summary}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.views}</span>
                          </div>
                          <span>•</span>
                          <span>{post.author}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingPost(post);
                            setPostForm({
                              title: post.title,
                              content: post.content,
                              summary: post.summary,
                              image: post.image,
                              category: post.category,
                              tags: post.tags.join(", "),
                              author: post.author,
                              featured: post.featured,
                              readingTime: post.readingTime,
                            });
                            setIsCreatingPost(true);
                          }}
                          data-testid={`button-edit-post-${post.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteConfirmId(post.id);
                            setDeleteType("post");
                          }}
                          data-testid={`button-delete-post-${post.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events-news" className="space-y-6" data-testid="content-events-news">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Events</h2>
                  <Dialog open={isCreatingEvent} onOpenChange={(open) => {
                    setIsCreatingEvent(open);
                    if (!open) {
                      setEditingEvent(null);
                      resetEventForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-event">
                        <Plus className="h-4 w-4 mr-2" />
                        New Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingEvent ? "Edit Event" : "Create New Event"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Title (English)"
                          value={eventForm.title}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, title: e.target.value })
                          }
                          data-testid="input-event-title"
                        />
                        <Input
                          placeholder="Title (Arabic) - العنوان بالعربية"
                          value={eventForm.titleAr}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, titleAr: e.target.value })
                          }
                          dir="rtl"
                          data-testid="input-event-title-ar"
                        />
                        <Textarea
                          placeholder="Description (English)"
                          value={eventForm.description}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, description: e.target.value })
                          }
                          rows={3}
                          data-testid="input-event-description"
                        />
                        <Textarea
                          placeholder="Description (Arabic) - الوصف بالعربية"
                          value={eventForm.descriptionAr}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, descriptionAr: e.target.value })
                          }
                          rows={3}
                          dir="rtl"
                          data-testid="input-event-description-ar"
                        />
                        <Input
                          placeholder="Date"
                          value={eventForm.date}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, date: e.target.value })
                          }
                          data-testid="input-event-date"
                        />
                        <Input
                          placeholder="Image URL (optional)"
                          value={eventForm.image}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, image: e.target.value })
                          }
                          data-testid="input-event-image"
                        />
                        <select
                          value={eventForm.type}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              type: e.target.value as "upcoming" | "trending",
                            })
                          }
                          className="w-full h-9 px-3 rounded-md border border-input bg-background"
                          data-testid="select-event-type"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="trending">Trending</option>
                        </select>
                        <Button
                          onClick={() => {
                            if (editingEvent) {
                              updateEventMutation.mutate({ id: editingEvent.id, data: eventForm });
                            } else {
                              createEventMutation.mutate(eventForm);
                            }
                          }}
                          className="w-full"
                          data-testid="button-submit-event"
                        >
                          {editingEvent ? "Update Event" : "Create Event"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {events?.map((event: any) => (
                    <Card key={event.id} data-testid={`event-card-${event.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold">{event.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingEvent(event);
                                setEventForm({
                                  title: event.title,
                                  titleAr: event.titleAr || "",
                                  description: event.description || "",
                                  descriptionAr: event.descriptionAr || "",
                                  date: event.date,
                                  type: event.type,
                                  image: event.image || "",
                                });
                                setIsCreatingEvent(true);
                              }}
                              data-testid={`button-edit-event-${event.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteConfirmId(event.id);
                                setDeleteType("event");
                              }}
                              data-testid={`button-delete-event-${event.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">News</h2>
                  <Dialog open={isCreatingNews} onOpenChange={(open) => {
                    setIsCreatingNews(open);
                    if (!open) {
                      setEditingNews(null);
                      resetNewsForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-news">
                        <Plus className="h-4 w-4 mr-2" />
                        New News
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingNews ? "Edit News Item" : "Create New News Item"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Title (English)"
                          value={newsForm.title}
                          onChange={(e) =>
                            setNewsForm({ ...newsForm, title: e.target.value })
                          }
                          data-testid="input-news-title"
                        />
                        <Input
                          placeholder="Title (Arabic) - العنوان بالعربية"
                          value={newsForm.titleAr}
                          onChange={(e) =>
                            setNewsForm({ ...newsForm, titleAr: e.target.value })
                          }
                          dir="rtl"
                          data-testid="input-news-title-ar"
                        />
                        <Input
                          placeholder="Date Range (e.g., Oct 15 - Nov 4)"
                          value={newsForm.dateRange}
                          onChange={(e) =>
                            setNewsForm({ ...newsForm, dateRange: e.target.value })
                          }
                          data-testid="input-news-daterange"
                        />
                        <Input
                          placeholder="Image URL"
                          value={newsForm.image}
                          onChange={(e) =>
                            setNewsForm({ ...newsForm, image: e.target.value })
                          }
                          data-testid="input-news-image"
                        />
                        <select
                          value={newsForm.category}
                          onChange={(e) =>
                            setNewsForm({ ...newsForm, category: e.target.value })
                          }
                          className="w-full h-9 px-3 rounded-md border border-input bg-background"
                          data-testid="select-news-category"
                        >
                          <option value="News">News</option>
                          <option value="Events">Events</option>
                          <option value="Reviews">Reviews</option>
                          <option value="Tutorials">Tutorials</option>
                        </select>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Content (English)</label>
                          <div data-testid="input-news-content">
                            <ReactQuill
                              theme="snow"
                              value={newsForm.content}
                              onChange={(value) =>
                                setNewsForm({ ...newsForm, content: value })
                              }
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['link'],
                                  ['clean']
                                ],
                              }}
                              style={{ minHeight: '150px' }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Content (Arabic) - المحتوى بالعربية</label>
                          <div data-testid="input-news-content-ar">
                            <ReactQuill
                              theme="snow"
                              value={newsForm.contentAr}
                              onChange={(value) =>
                                setNewsForm({ ...newsForm, contentAr: value })
                              }
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['link'],
                                  ['clean']
                                ],
                              }}
                              style={{ minHeight: '150px', direction: 'rtl' }}
                            />
                          </div>
                        </div>
                        <Input
                          placeholder="Author"
                          value={newsForm.author}
                          onChange={(e) =>
                            setNewsForm({ ...newsForm, author: e.target.value })
                          }
                          data-testid="input-news-author"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newsForm.featured}
                            onChange={(e) =>
                              setNewsForm({
                                ...newsForm,
                                featured: e.target.checked,
                              })
                            }
                            data-testid="checkbox-news-featured"
                          />
                          <span className="text-sm">Featured</span>
                        </label>
                        <Button
                          onClick={() => {
                            if (editingNews) {
                              updateNewsMutation.mutate({ id: editingNews.id, data: newsForm });
                            } else {
                              createNewsMutation.mutate(newsForm);
                            }
                          }}
                          className="w-full"
                          data-testid="button-submit-news"
                        >
                          {editingNews ? "Update News" : "Create News"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {newsItems?.map((news: any) => (
                    <Card key={news.id} data-testid={`news-card-${news.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-sm line-clamp-1">{news.title}</h4>
                              {news.featured && (
                                <Badge variant="default" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{news.dateRange}</p>
                            <Badge variant="outline" className="text-xs">{news.category}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingNews(news);
                                setNewsForm({
                                  title: news.title,
                                  titleAr: news.titleAr || "",
                                  dateRange: news.dateRange,
                                  image: news.image,
                                  category: news.category,
                                  content: news.content,
                                  contentAr: news.contentAr || "",
                                  author: news.author,
                                  featured: news.featured,
                                });
                                setIsCreatingNews(true);
                              }}
                              data-testid={`button-edit-news-${news.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteConfirmId(news.id);
                                setDeleteType("news");
                              }}
                              data-testid={`button-delete-news-${news.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-6" data-testid="content-sellers">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Sellers Management</h2>
              <Dialog open={isCreatingSeller} onOpenChange={(open) => {
                setIsCreatingSeller(open);
                if (!open) {
                  setEditingSeller(null);
                  resetSellerForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-seller">
                    <Plus className="h-4 w-4 mr-2" />
                    New Seller
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSeller ? "Edit Seller" : "Create New Seller"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Seller Name"
                      value={sellerForm.name}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, name: e.target.value })
                      }
                      data-testid="input-seller-name"
                    />
                    <Textarea
                      placeholder="Description"
                      value={sellerForm.description}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, description: e.target.value })
                      }
                      rows={3}
                      data-testid="input-seller-description"
                    />
                    <Textarea
                      placeholder="Promotion Text (optional)"
                      value={sellerForm.promotionText}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, promotionText: e.target.value })
                      }
                      rows={2}
                      data-testid="input-seller-promotion"
                    />
                    <Textarea
                      placeholder="Image URLs (comma-separated)"
                      value={sellerForm.images}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, images: e.target.value })
                      }
                      rows={3}
                      data-testid="input-seller-images"
                    />
                    <Textarea
                      placeholder="Price List (one per line: item:price, e.g., VIP:10)"
                      value={sellerForm.prices}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, prices: e.target.value })
                      }
                      rows={5}
                      data-testid="input-seller-prices"
                    />
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="text-sm font-medium">Contact Information</h3>
                      <Input
                        placeholder="Email (optional)"
                        value={sellerForm.email}
                        onChange={(e) =>
                          setSellerForm({ ...sellerForm, email: e.target.value })
                        }
                        data-testid="input-seller-email"
                      />
                      <Input
                        placeholder="Phone (optional)"
                        value={sellerForm.phone}
                        onChange={(e) =>
                          setSellerForm({ ...sellerForm, phone: e.target.value })
                        }
                        data-testid="input-seller-phone"
                      />
                      <Input
                        placeholder="WhatsApp (optional)"
                        value={sellerForm.whatsapp}
                        onChange={(e) =>
                          setSellerForm({ ...sellerForm, whatsapp: e.target.value })
                        }
                        data-testid="input-seller-whatsapp"
                      />
                      <Input
                        placeholder="Discord (optional)"
                        value={sellerForm.discord}
                        onChange={(e) =>
                          setSellerForm({ ...sellerForm, discord: e.target.value })
                        }
                        data-testid="input-seller-discord"
                      />
                      <Input
                        placeholder="Website URL (optional)"
                        value={sellerForm.website}
                        onChange={(e) =>
                          setSellerForm({ ...sellerForm, website: e.target.value })
                        }
                        data-testid="input-seller-website"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-featured"
                        checked={sellerForm.featured}
                        onCheckedChange={(checked) =>
                          setSellerForm({ ...sellerForm, featured: checked as boolean })
                        }
                        data-testid="checkbox-seller-featured"
                      />
                      <label
                        htmlFor="seller-featured"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Featured Seller
                      </label>
                    </div>
                    <Button
                      onClick={() => {
                        const data = {
                          name: sellerForm.name,
                          description: sellerForm.description,
                          promotionText: sellerForm.promotionText,
                          images: sellerForm.images
                            ? sellerForm.images.split(',').map(url => url.trim())
                            : [],
                          prices: sellerForm.prices
                            ? sellerForm.prices.split('\n')
                                .filter(line => line.trim())
                                .map(line => {
                                  const [item, price] = line.split(':');
                                  return {
                                    item: item?.trim() || '',
                                    price: parseFloat(price?.trim() || '0')
                                  };
                                })
                            : [],
                          email: sellerForm.email,
                          phone: sellerForm.phone,
                          whatsapp: sellerForm.whatsapp,
                          discord: sellerForm.discord,
                          website: sellerForm.website,
                          featured: sellerForm.featured,
                        };
                        if (editingSeller) {
                          updateSellerMutation.mutate({ id: editingSeller.id, data });
                        } else {
                          createSellerMutation.mutate(data);
                        }
                      }}
                      className="w-full"
                      data-testid="button-submit-seller"
                    >
                      {editingSeller ? "Update Seller" : "Create Seller"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Prices</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellers?.map((seller: any) => (
                      <TableRow key={seller.id} data-testid={`seller-row-${seller.id}`}>
                        <TableCell className="font-medium">{seller.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{seller.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {seller.email && <Badge variant="outline" className="text-xs">Email</Badge>}
                            {seller.phone && <Badge variant="outline" className="text-xs">Phone</Badge>}
                            {seller.whatsapp && <Badge variant="outline" className="text-xs">WhatsApp</Badge>}
                            {seller.discord && <Badge variant="outline" className="text-xs">Discord</Badge>}
                            {seller.website && <Badge variant="outline" className="text-xs">Website</Badge>}
                            {!seller.email && !seller.phone && !seller.whatsapp && !seller.discord && !seller.website && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {seller.images?.length || 0} images
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {seller.prices?.length || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{seller.averageRating?.toFixed(1) || '0.0'}</span>
                            <span className="text-xs text-muted-foreground">({seller.totalReviews || 0})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {seller.featured && <Badge variant="default" className="text-xs">Featured</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                                  onClick={() => {
                                    setEditingSeller(seller);
                                    setSellerForm({
                                      name: seller.name,
                                      description: seller.description || "",
                                      images: seller.images?.join(', ') || "",
                                      prices: seller.prices?.map((p: any) => `${p.item}:${p.price}`).join('\n') || "",
                                      email: seller.email || "",
                                      phone: seller.phone || "",
                                      whatsapp: seller.whatsapp || "",
                                      discord: seller.discord || "",
                                      website: seller.website || "",
                                      featured: seller.featured || false,
                                      promotionText: seller.promotionText || "",
                                    });
                                    setIsCreatingSeller(true);
                                  }}
                              data-testid={`button-edit-seller-${seller.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                                {isSuperAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                      // open reviews dialog and load reviews for this seller
                                      setActiveSellerForReviews(seller);
                                      setReviewsDialogOpen(true);
                                      setLoadingReviews(true);
                                      try {
                                        const data = await apiRequest(`/api/sellers/${seller.id}/reviews`, 'GET');
                                        setSellerReviews(data || []);
                                      } catch (err: any) {
                                        toast({ title: 'Failed to load reviews', description: err?.message, variant: 'destructive' });
                                        setSellerReviews([]);
                                      } finally {
                                        setLoadingReviews(false);
                                      }
                                    }}
                                    title="Manage reviews"
                                    data-testid={`button-manage-reviews-${seller.id}`}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteConfirmId(seller.id);
                                setDeleteType("seller");
                              }}
                              data-testid={`button-delete-seller-${seller.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!sellers || sellers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No sellers found. Create your first seller to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="translations" className="space-y-6" data-testid="content-translations">
            <h2 className="text-2xl font-semibold">Translations Management</h2>
            <p className="text-muted-foreground">
              Add or update Arabic translations for events and news items. Use the edit buttons in the Events & News tab to manage translations.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Events Translations Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {events?.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-md" data-testid={`translation-event-${event.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={event.titleAr ? "default" : "secondary"} className="text-xs">
                              {event.titleAr ? "Title ✓" : "Title ✗"}
                            </Badge>
                            <Badge variant={event.descriptionAr ? "default" : "secondary"} className="text-xs">
                              {event.descriptionAr ? "Description ✓" : "Description ✗"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEvent(event);
                            setEventForm({
                              title: event.title,
                              titleAr: event.titleAr || "",
                              description: event.description || "",
                              descriptionAr: event.descriptionAr || "",
                              date: event.date,
                              type: event.type,
                              image: event.image || "",
                            });
                            setIsCreatingEvent(true);
                          }}
                          data-testid={`button-translate-event-${event.id}`}
                        >
                          <Languages className="h-4 w-4 mr-1" />
                          Translate
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>News Translations Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {newsItems?.map((news: any) => (
                      <div key={news.id} className="flex items-center justify-between p-3 border rounded-md" data-testid={`translation-news-${news.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{news.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={news.titleAr ? "default" : "secondary"} className="text-xs">
                              {news.titleAr ? "Title ✓" : "Title ✗"}
                            </Badge>
                            <Badge variant={news.contentAr ? "default" : "secondary"} className="text-xs">
                              {news.contentAr ? "Content ✓" : "Content ✗"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNews(news);
                            setNewsForm({
                              title: news.title,
                              titleAr: news.titleAr || "",
                              dateRange: news.dateRange,
                              image: news.image,
                              category: news.category,
                              content: news.content,
                              contentAr: news.contentAr || "",
                              author: news.author,
                              featured: news.featured,
                            });
                            setIsCreatingNews(true);
                          }}
                          data-testid={`button-translate-news-${news.id}`}
                        >
                          <Languages className="h-4 w-4 mr-1" />
                          Translate
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="admins" className="space-y-6" data-testid="content-admins">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Admins Management</h2>
                <Dialog open={isCreatingAdmin} onOpenChange={(open) => {
                  setIsCreatingAdmin(open);
                  if (!open) {
                    setEditingAdmin(null);
                    resetAdminForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-admin">
                      <Plus className="h-4 w-4 mr-2" />
                      New Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAdmin ? "Edit Admin" : "Create New Admin"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Username"
                        value={adminForm.username}
                        onChange={(e) =>
                          setAdminForm({ ...adminForm, username: e.target.value })
                        }
                        data-testid="input-admin-username"
                      />
                      <Input
                        type="password"
                        placeholder={editingAdmin ? "New Password (leave empty to keep current)" : "Password"}
                        value={adminForm.password}
                        onChange={(e) =>
                          setAdminForm({ ...adminForm, password: e.target.value })
                        }
                        data-testid="input-admin-password"
                      />
                      <select
                        value={adminForm.role}
                        onChange={(e) =>
                          setAdminForm({
                            ...adminForm,
                            role: e.target.value as "admin" | "super_admin",
                          })
                        }
                        className="w-full h-9 px-3 rounded-md border border-input bg-background"
                        data-testid="select-admin-role"
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <Button
                        onClick={() => {
                          if (editingAdmin) {
                            const updates: any = { role: adminForm.role };
                            if (adminForm.username) updates.username = adminForm.username;
                            if (adminForm.password) updates.password = adminForm.password;
                            updateAdminMutation.mutate({ id: editingAdmin.id, data: updates });
                          } else {
                            createAdminMutation.mutate(adminForm);
                          }
                        }}
                        className="w-full"
                        data-testid="button-submit-admin"
                      >
                        {editingAdmin ? "Update Admin" : "Create Admin"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins?.map((admin: any) => (
                        <TableRow key={admin.id} data-testid={`admin-row-${admin.id}`}>
                          <TableCell className="font-medium" data-testid={`admin-username-${admin.id}`}>{admin.username}</TableCell>
                          <TableCell>
                            <Badge variant={admin.role === "super_admin" ? "default" : "secondary"} data-testid={`admin-role-${admin.id}`}>
                              {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingAdmin(admin);
                                  setAdminForm({
                                    username: admin.username,
                                    password: "",
                                    role: admin.role,
                                  });
                                  setIsCreatingAdmin(true);
                                }}
                                data-testid={`button-edit-admin-${admin.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeleteConfirmId(admin.id);
                                  setDeleteType("admin");
                                }}
                                data-testid={`button-delete-admin-${admin.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isSuperAdmin && (
            <TabsContent value="subscribers" className="space-y-6" data-testid="content-subscribers">
              <h2 className="text-2xl font-semibold">Newsletter Subscribers</h2>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Subscribed At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers?.map((subscriber: any) => (
                        <TableRow key={subscriber.id} data-testid={`subscriber-row-${subscriber.id}`}>
                          <TableCell className="font-medium" data-testid={`subscriber-email-${subscriber.id}`}>
                            {subscriber.email}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(subscriber.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteConfirmId(subscriber.id);
                                setDeleteType("subscriber");
                              }}
                              data-testid={`button-delete-subscriber-${subscriber.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!subscribers || subscribers.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            No subscribers yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="tickets" className="space-y-6" data-testid="content-tickets">
            <h2 className="text-2xl font-semibold">Support Tickets</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets?.map((ticket: any) => (
                      <TableRow key={ticket.id} data-testid={`ticket-row-${ticket.id}`}>
                        <TableCell className="font-medium max-w-xs truncate">{ticket.title}</TableCell>
                        <TableCell>{ticket.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <select
                            value={ticket.status}
                            onChange={(e) => {
                              updateTicketMutation.mutate({
                                id: ticket.id,
                                data: { status: e.target.value }
                              });
                            }}
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                            data-testid={`select-ticket-status-${ticket.id}`}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            value={ticket.priority}
                            onChange={(e) => {
                              updateTicketMutation.mutate({
                                id: ticket.id,
                                data: { priority: e.target.value }
                              });
                            }}
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                            data-testid={`select-ticket-priority-${ticket.id}`}
                          >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {ticket.createdAt}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteConfirmId(ticket.id);
                              setDeleteType("ticket");
                            }}
                            data-testid={`button-delete-ticket-${ticket.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!tickets || tickets.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No support tickets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={reviewsDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setReviewsDialogOpen(false);
          setActiveSellerForReviews(null);
          setSellerReviews([]);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reviews for {activeSellerForReviews?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {loadingReviews ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : sellerReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews for this seller.</p>
            ) : (
              <div className="space-y-3">
                {sellerReviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{review.userName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{Array.from({length: review.rating}).map((_,i)=> (<Star key={i} className="h-4 w-4 text-yellow-400 inline-block"/>))} <span className="ml-2 text-xs">{review.rating}</span></div>
                        {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (!activeSellerForReviews) return;
                            try {
                              await apiRequest(`/api/sellers/${activeSellerForReviews.id}/reviews/${review.id}`, 'DELETE');
                              setSellerReviews((prev) => prev.filter((r) => r.id !== review.id));
                              queryClient.invalidateQueries({ queryKey: ['/api/sellers'] });
                              queryClient.invalidateQueries({ queryKey: [`/api/sellers/${activeSellerForReviews.id}/reviews`] });
                              toast({ title: 'Review deleted' });
                            } catch (err: any) {
                              toast({ title: 'Delete failed', description: err?.message, variant: 'destructive' });
                            }
                          }}
                          data-testid={`admin-delete-review-${review.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmId(null);
          setDeleteType("");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
