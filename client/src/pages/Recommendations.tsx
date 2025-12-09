import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Video, FileText, Star, ExternalLink, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Recommendations() {
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const { data: recommendations, isLoading, refetch } = trpc.content.getRecommendations.useQuery({ limit: 20 });
  const { data: favoritesCount } = trpc.content.getFavoritesCount.useQuery();

  const addFavoriteMutation = trpc.content.addFavorite.useMutation({
    onSuccess: () => {
      toast.success("Added to favorites");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddFavorite = (contentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    addFavoriteMutation.mutate({ contentId });
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "slide":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "simulation":
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case "past_paper":
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-orange-100 text-orange-800",
      expert: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[difficulty as keyof typeof colors] || ""}>{difficulty}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Recommended for You</h1>
        </div>
        <p className="text-muted-foreground">
          {favoritesCount && favoritesCount > 0
            ? `Based on your ${favoritesCount} favorited ${favoritesCount === 1 ? "item" : "items"}, we think you'll enjoy these resources`
            : "Popular content to get you started"}
        </p>
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground mb-4">
            Start adding content to your favorites to get personalized recommendations
          </p>
          <Button onClick={() => window.location.href = "/content-library"}>
            Browse Content Library
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item: any) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedContent(item)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getContentIcon(item.type)}
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {item.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(item as any).curriculum && (
                    <Badge variant="outline">{(item as any).curriculum}</Badge>
                  )}
                  {(item as any).subject && (
                    <Badge variant="outline">{(item as any).subject}</Badge>
                  )}
                  {item.difficulty && getDifficultyBadge(item.difficulty)}
                </div>

                {item.examTags && Array.isArray(item.examTags) && item.examTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.examTags.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.examTags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.examTags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {(item as any).score !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Match score: {(item as any).score}/20
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleAddFavorite(item.id, e)}
                    disabled={addFavoriteMutation.isPending}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {(item as any).topic || "General"}
                  </span>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content Preview Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedContent && getContentIcon(selectedContent.type)}
              {selectedContent?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedContent?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(selectedContent as any)?.curriculum && (
                <Badge>{(selectedContent as any).curriculum}</Badge>
              )}
              {(selectedContent as any)?.subject && (
                <Badge variant="outline">{(selectedContent as any).subject}</Badge>
              )}
              {(selectedContent as any)?.topic && (
                <Badge variant="outline">{(selectedContent as any).topic}</Badge>
              )}
              {selectedContent?.difficulty && getDifficultyBadge(selectedContent.difficulty)}
            </div>

            {selectedContent?.content && (
              <div className="prose max-w-none">
                <p>{selectedContent.content}</p>
              </div>
            )}

            {selectedContent?.url && (
              <div className="flex gap-2">
                <Button asChild>
                  <a href={selectedContent.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Resource
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    handleAddFavorite(selectedContent.id, e);
                    setSelectedContent(null);
                  }}
                  disabled={addFavoriteMutation.isPending}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
