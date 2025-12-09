import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, BookOpen, Video, FileText, Star, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [curriculum, setCurriculum] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [contentType, setContentType] = useState<string>("all");
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const { data: content, isLoading } = trpc.content.getContent.useQuery({
    difficulty: difficulty === "all" ? undefined : (difficulty as any),
    type: contentType === "all" ? undefined : (contentType as any),
    limit: 50,
  });

  const addFavoriteMutation = trpc.content.addFavorite.useMutation({
    onSuccess: () => {
      toast.success("Added to favorites");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeFavoriteMutation = trpc.content.removeFavorite.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleFavorite = (contentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic update would go here
    addFavoriteMutation.mutate({ contentId });
  };



  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "pdf":
      case "document":
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case "beginner":
        return <Badge className="bg-green-500">Beginner</Badge>;
      case "intermediate":
        return <Badge className="bg-yellow-500">Intermediate</Badge>;
      case "advanced":
        return <Badge className="bg-red-500">Advanced</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const filteredContent = content?.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      (item as any).tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Library</h1>
        <p className="text-muted-foreground mt-2">
          Browse curated educational content for your learning journey
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your search to find the perfect content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Select value={curriculum} onValueChange={setCurriculum}>
              <SelectTrigger>
                <SelectValue placeholder="Curriculum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Curricula</SelectItem>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="IB">IB</SelectItem>
                <SelectItem value="NCERT">NCERT</SelectItem>
                <SelectItem value="JEE">JEE</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
                <SelectItem value="SAT">SAT</SelectItem>
                <SelectItem value="GMAT">GMAT</SelectItem>
                <SelectItem value="GRE">GRE</SelectItem>
                <SelectItem value="TOEFL">TOEFL</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Economics">Economics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="Algebra">Algebra</SelectItem>
                <SelectItem value="Calculus">Calculus</SelectItem>
                <SelectItem value="Mechanics">Mechanics</SelectItem>
                <SelectItem value="Organic Chemistry">Organic Chemistry</SelectItem>
                <SelectItem value="Cell Biology">Cell Biology</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="practice">Practice Sets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setCurriculum("all");
              setSubject("all");
              setTopic("all");
              setDifficulty("all");
              setContentType("all");
            }}
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredContent?.length || 0} items found
          </p>
        </div>

        {!filteredContent || filteredContent.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No content found matching your filters</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setCurriculum("all");
                    setSubject("all");
                    setTopic("all");
                    setDifficulty("all");
                    setContentType("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedContent(item)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getContentIcon((item as any).contentType || "article")}
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

                  {(item as any).tags && (item as any).tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {((item as any).tags || []).slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(item as any).tags && (item as any).tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(item as any).tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {(item as any).topic || "General"}
                    </span>
                    <Button size="sm" variant="ghost">
                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Content Preview Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedContent && getContentIcon((selectedContent as any).contentType || "article")}
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

              {(selectedContent as any)?.tags && (selectedContent as any).tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tags:</p>
                <div className="flex flex-wrap gap-1">
                  {((selectedContent as any).tags || []).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedContent?.sourceUrl && (
              <Button
                className="w-full"
                onClick={() => window.open(selectedContent.sourceUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Content
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
