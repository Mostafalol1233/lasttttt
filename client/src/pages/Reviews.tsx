import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import { Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Seller {
  id: string;
  name: string;
  description: string;
  images: string[];
  prices: { item: string; price: number }[];
  averageRating: number;
  totalReviews: number;
}

interface Review {
  id: string;
  sellerId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export default function Reviews() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [reviewForm, setReviewForm] = useState({
    userName: "",
    rating: 5,
    comment: "",
    phone: "",
  });

  const [countdown, setCountdown] = useState(0);

  // Start a 10-second countdown whenever the review dialog opens for a seller.
  useEffect(() => {
    let iv: number | undefined;
    if (selectedSeller) {
      setCountdown(10);
      iv = window.setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (iv) clearInterval(iv);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else {
      setCountdown(0);
    }

    return () => {
      if (iv) clearInterval(iv);
    };
  }, [selectedSeller]);

  const { data: sellers = [] } = useQuery<Seller[]>({
    queryKey: ["/api/sellers"],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/sellers/${selectedSeller?.id}/reviews`],
    enabled: !!selectedSeller,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { sellerId: string; userName: string; rating: number; comment: string; phone: string }) => {
      return apiRequest(`/api/sellers/${data.sellerId}/reviews`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers"] });
      if (selectedSeller) {
        queryClient.invalidateQueries({ queryKey: [`/api/sellers/${selectedSeller.id}/reviews`] });
      }
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      setReviewForm({ userName: "", rating: 5, comment: "" });
      setSelectedSeller(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!selectedSeller) return;
    if (!reviewForm.userName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    if (!/^[0-9]{11}$/.test(reviewForm.phone)) {
      toast({ title: "Error", description: "Phone number must be 11 digits", variant: "destructive" });
      return;
    }
    if (countdown > 0) {
      toast({ title: "Hold on", description: `Please wait ${countdown} second(s) before submitting`, variant: "destructive" });
      return;
    }
    createReviewMutation.mutate({
      sellerId: selectedSeller.id,
      ...reviewForm,
    });
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            } ${interactive ? "cursor-pointer hover:scale-110 transition" : ""}`}
            onClick={() => {
              if (interactive) {
                setReviewForm({ ...reviewForm, rating: star });
              }
            }}
            data-testid={`star-${star}`}
          />
        ))}
      </div>
    );
  };

  function parseJwt(token: string | null) {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const jwtPayload = parseJwt(adminToken);
  const isAdmin = jwtPayload && ['super_admin', 'admin', 'ticket_manager'].includes(jwtPayload.role);

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Seller Reviews</h1>
          <p className="text-lg text-muted-foreground">
            Browse game card sellers and read reviews from other players
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller) => (
            <Card key={seller.id} className="hover-elevate" data-testid={`card-seller-${seller.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{seller.name}</span>
                  <Badge variant="secondary" data-testid={`badge-reviews-${seller.id}`}>
                    {seller.totalReviews} reviews
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {seller.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seller.images.slice(0, 2).map((image, idx) => (
                      <div key={idx} className="flex items-center justify-center">
                        <img
                          src={image}
                          alt={`${seller.name} ${idx + 1}`}
                          className="max-h-72 max-w-[360px] w-full object-cover rounded-md bg-muted/30"
                          data-testid={`img-seller-${seller.id}-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">{seller.description}</p>
                
                <div className="flex items-center justify-between">
                  {renderStars(Math.round(seller.averageRating))}
                  <span className="text-sm font-medium">{seller.averageRating.toFixed(1)}</span>
                </div>

                {seller.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seller.images.slice(0, 2).map((image, idx) => (
                      <div key={idx} className="flex items-center justify-center">
                        <div className="w-full max-w-[360px] h-48 overflow-hidden rounded-md bg-muted/30">
                          <img
                            src={image}
                            alt={`${seller.name} ${idx + 1}`}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Dialog open={selectedSeller?.id === seller.id} onOpenChange={(open) => !open && setSelectedSeller(null)}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedSeller(seller)}
                      data-testid={`button-review-${seller.id}`}
                    >
                      Write Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
              <DialogTitle>Review {seller.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Countdown is managed in useEffect when dialog opens */}
              <div className="space-y-4">
                <h3 className="font-semibold">Review for {seller.name}</h3>                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Name</label>
                          <Input
                            value={reviewForm.userName}
                            onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                            placeholder="Enter your name"
                            data-testid="input-reviewer-name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone (11 digits) — required for verification</label>
                          <Input
                            value={reviewForm.phone}
                            onChange={(e) => setReviewForm({ ...reviewForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                            placeholder="01xxxxxxxxx"
                            maxLength={11}
                            data-testid="input-reviewer-phone"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rating</label>
                          {renderStars(reviewForm.rating, true)}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Comment (Optional)</label>
                          <Textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            placeholder="Share your experience..."
                            rows={4}
                            data-testid="input-review-comment"
                          />
                        </div>

                        <Button
                          onClick={handleSubmitReview}
                          disabled={createReviewMutation.isPending || countdown > 0}
                          data-testid="button-submit-review"
                        >
                          {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                        {countdown > 0 && (
                          <p className="text-sm text-muted-foreground">Please subscribe to our YouTube channel (<a className="underline text-primary" href="https://www.youtube.com/channel/UC_BIMORA" target="_blank" rel="noreferrer">Bimora</a>) and wait {countdown} second(s) before submitting.</p>
                        )}
                      </div>

                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold">Reviews ({reviews.length})</h3>
                        {reviews.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <Card key={review.id} data-testid={`review-${review.id}`}>
                                <CardContent className="pt-6 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span className="font-medium">{review.userName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {renderStars(review.rating)}
                                    </div>
                                  </div>
                                  {review.comment && (
                                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {sellers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No sellers available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
