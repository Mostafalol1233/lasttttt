import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, Eye, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArticleCard, type Article } from "@/components/ArticleCard";
import { CommentSection, type Comment } from "@/components/CommentSection";
import { useLanguage } from "@/components/LanguageProvider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import tutorialImage from "@assets/generated_images/Tutorial_article_cover_image_2152de25.png";

export default function Article() {
  const { id } = useParams();
  const { t } = useLanguage();

  const { data: article, isLoading } = useQuery<any>({
    queryKey: ["/api/posts", id],
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/posts", id, "comments"],
    enabled: !!id,
  });

  const { data: allPosts = [] } = useQuery<Article[]>({
    queryKey: ["/api/posts"],
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { author: string; content: string }) =>
      apiRequest(`/api/posts/${id}/comments`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", id, "comments"],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Article not found</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedArticles = allPosts
    .filter(
      (post) =>
        post.id !== article.id &&
        (post.category === article.category ||
          post.tags.some((tag: string) => article.tags.includes(tag)))
    )
    .slice(0, 3);

  const handleCommentSubmit = (author: string, content: string) => {
    addCommentMutation.mutate({ author, content });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-6"
          data-testid="button-back-home"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToHome")}
          </Link>
        </Button>

        <article>
          <div className="mb-8 md:mb-12">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="default" data-testid="badge-category">
                {article.category}
              </Badge>
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" data-testid={`badge-tag-${tag}`}>
                  {tag}
                </Badge>
              ))}
            </div>

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
              data-testid="text-article-title"
            >
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {article.author
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span data-testid="text-author">{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span data-testid="text-reading-time">{article.readingTime} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span data-testid="text-views">{article.views} views</span>
              </div>
              <span data-testid="text-date">{article.date}</span>
            </div>

            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-[400px] md:h-[550px] lg:h-[650px] object-cover rounded-md mb-8"
                data-testid="img-article-cover"
              />
            )}
          </div>

          {article.summary && (
            <div className="bg-card border border-border rounded-md p-6 mb-8">
              <p className="text-lg text-foreground font-medium" data-testid="text-summary">
                {article.summary}
              </p>
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{
              __html: article.content.replace(/\n/g, "<br />"),
            }}
            data-testid="content-article-body"
          />

          {relatedArticles.length > 0 && (
            <div className="border-t pt-12 mt-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                {t("relatedArticles")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard
                    key={relatedArticle.id}
                    article={relatedArticle}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-12 mt-12">
            <CommentSection
              comments={comments}
              onCommentSubmit={handleCommentSubmit}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
