import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ArticleCard, type Article } from "@/components/ArticleCard";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/components/LanguageProvider";
import { CategoryFilter, type Category } from "@/components/CategoryFilter";

export default function Category() {
  const { t } = useLanguage();
  const { category } = useParams<{ category: string }>();

  const { data: allPosts = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/posts"],
  });

  const filteredArticles = useMemo(() => {
    if (!category) return [];
    // normalize categories (case-insensitive, trim, treat singular/plural as equal)
    const normalize = (s: string) => (s || "").toLowerCase().trim().replace(/s$/, "");
    const target = normalize(category);

    return allPosts.filter((article) => {
      return normalize(article.category) === target;
    });
  }, [allPosts, category]);

  const recentPosts = useMemo(() => {
    return allPosts.slice(0, 3).map((post) => ({
      id: post.id,
      title: post.title,
      image: post.image,
      date: post.date,
    }));
  }, [allPosts]);

  const popularTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    allPosts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allPosts]);

  const mostViewed = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
      .map((post) => ({
        id: post.id,
        title: post.title,
        views: post.views,
      }));
  }, [allPosts]);

  const bimoraPicks = useMemo(() => {
    return allPosts
      .filter((post) => post.featured)
      .slice(0, 2)
      .map((post) => ({
        id: post.id,
        title: post.title,
        image: post.image,
        date: post.date,
      }));
  }, [allPosts]);

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="text-center">
            <p className="text-muted-foreground">{t("loading") || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <main className="lg:col-span-8 space-y-8 md:space-y-12">
            <div className="space-y-6">
              <h1 
                className="text-3xl md:text-4xl font-bold"
                data-testid="heading-category"
              >
                {categoryTitle}
              </h1>
              
              <p 
                className="text-muted-foreground"
                data-testid="text-category-description"
              >
                {t("browsing")} {categoryTitle.toLowerCase()} {t("articles")}
              </p>
              
              <CategoryFilter
                activeCategory={category?.toLowerCase() as Category || "all"}
                useNavigation={true}
              />
            </div>

            {filteredArticles.length === 0 ? (
              <div 
                className="text-center py-12"
                data-testid="container-no-posts"
              >
                <p className="text-muted-foreground">
                  {t("noArticlesFound") || `No ${categoryTitle.toLowerCase()} articles found.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </main>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Sidebar
                recentPosts={recentPosts}
                popularTags={popularTags}
                mostViewed={mostViewed}
                bimoraPicks={bimoraPicks}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
