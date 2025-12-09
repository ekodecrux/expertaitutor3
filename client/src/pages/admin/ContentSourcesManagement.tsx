import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Play, Pause, Trash2, RefreshCw } from "lucide-react";

export default function ContentSourcesManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<"website" | "pdf" | "video" | "api">("website");
  const [baseUrl, setBaseUrl] = useState("");
  const [curriculum, setCurriculum] = useState("");

  const utils = trpc.useUtils();

  const { data: sources, isLoading } = trpc.content.getSources.useQuery();
  const { data: stats } = trpc.content.getContentStats.useQuery();

  const createMutation = trpc.content.createSource.useMutation({
    onSuccess: () => {
      toast.success("Content source created successfully!");
      setShowCreateDialog(false);
      resetForm();
      utils.content.getSources.invalidate();
      utils.content.getContentStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create source");
    },
  });

  const updateMutation = trpc.content.updateSource.useMutation({
    onSuccess: () => {
      toast.success("Source updated successfully!");
      utils.content.getSources.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update source");
    },
  });

  const deleteMutation = trpc.content.deleteSource.useMutation({
    onSuccess: () => {
      toast.success("Source deleted successfully!");
      utils.content.getSources.invalidate();
      utils.content.getContentStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete source");
    },
  });

  const runScraperMutation = trpc.content.runScraper.useMutation({
    onSuccess: (data) => {
      toast.success(`Scraper completed! Found ${data.itemsFound} items, added ${data.itemsAdded}`);
      utils.content.getApprovalQueue.invalidate();
      utils.content.getContentStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to run scraper");
    },
  });

  const resetForm = () => {
    setName("");
    setSourceType("website");
    setBaseUrl("");
    setCurriculum("");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a source name");
      return;
    }

    createMutation.mutate({
      name,
      sourceType,
      baseUrl: baseUrl || undefined,
      curriculum: curriculum || undefined,
    });
  };

  const handleToggleStatus = (source: any) => {
    const newStatus = source.status === "active" ? "paused" : "active";
    updateMutation.mutate({
      id: source.id,
      status: newStatus,
    });
  };

  const handleDelete = (sourceId: number) => {
    if (confirm("Are you sure you want to delete this source?")) {
      deleteMutation.mutate({ id: sourceId });
    }
  };

  const handleRunScraper = (sourceId: number) => {
    runScraperMutation.mutate({ sourceId });
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-green-600">Active</Badge>;
    if (status === "paused") return <Badge variant="outline">Paused</Badge>;
    return <Badge variant="destructive">Error</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Sources</h1>
          <p className="text-muted-foreground">Manage content scraping sources</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSources}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSources}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedContent}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Sources</CardTitle>
          <CardDescription>
            {sources?.length || 0} sources configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !sources || sources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No content sources configured. Click "Add Source" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Curriculum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((source: any) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">{source.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{source.sourceType}</Badge>
                      </TableCell>
                      <TableCell>{source.curriculum || "-"}</TableCell>
                      <TableCell>{getStatusBadge(source.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRunScraper(source.id)}
                            disabled={runScraperMutation.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(source)}
                            disabled={updateMutation.isPending}
                          >
                            {source.status === "active" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(source.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Source Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Content Source</DialogTitle>
            <DialogDescription>
              Configure a new content source for scraping
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name *</Label>
              <Input
                id="name"
                placeholder="e.g., NCERT Class 10 Math"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceType">Source Type</Label>
              <Select value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                placeholder="https://example.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curriculum">Curriculum</Label>
              <Input
                id="curriculum"
                placeholder="e.g., CBSE, NCERT, JEE"
                value={curriculum}
                onChange={(e) => setCurriculum(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Source"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
