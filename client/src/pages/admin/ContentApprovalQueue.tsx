import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, FileText } from "lucide-react";

export default function ContentApprovalQueue() {
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "approved" | "rejected" | "needs_review">("pending");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const [topicId, setTopicId] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("medium");
  const [rejectionReason, setRejectionReason] = useState("");

  const utils = trpc.useUtils();

  const { data: queueItems, isLoading } = trpc.content.getApprovalQueue.useQuery({
    status: selectedStatus,
    limit: 100,
  });

  const approveMutation = trpc.content.approveContent.useMutation({
    onSuccess: () => {
      toast.success("Content approved successfully!");
      setShowApproveDialog(false);
      setSelectedItem(null);
      utils.content.getApprovalQueue.invalidate();
      utils.content.getContentStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve content");
    },
  });

  const rejectMutation = trpc.content.rejectContent.useMutation({
    onSuccess: () => {
      toast.success("Content rejected");
      setShowRejectDialog(false);
      setSelectedItem(null);
      setRejectionReason("");
      utils.content.getApprovalQueue.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject content");
    },
  });

  const needsReviewMutation = trpc.content.markNeedsReview.useMutation({
    onSuccess: () => {
      toast.success("Marked as needs review");
      utils.content.getApprovalQueue.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleApprove = (item: any) => {
    setSelectedItem(item);
    setShowApproveDialog(true);
  };

  const handleReject = (item: any) => {
    setSelectedItem(item);
    setShowRejectDialog(true);
  };

  const handleNeedsReview = (item: any) => {
    needsReviewMutation.mutate({ queueId: item.id });
  };

  const submitApproval = () => {
    if (!selectedItem || !topicId) {
      toast.error("Please select a topic");
      return;
    }

    approveMutation.mutate({
      queueId: selectedItem.id,
      topicId: parseInt(topicId),
      difficulty,
    });
  };

  const submitRejection = () => {
    if (!selectedItem || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    rejectMutation.mutate({
      queueId: selectedItem.id,
      reason: rejectionReason,
    });
  };

  const getQualityBadge = (score: number | null) => {
    if (!score) return <Badge variant="outline">Unknown</Badge>;
    if (score >= 90) return <Badge className="bg-green-600">Excellent ({score})</Badge>;
    if (score >= 75) return <Badge className="bg-blue-600">Good ({score})</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Fair ({score})</Badge>;
    return <Badge variant="destructive">Poor ({score})</Badge>;
  };

  const getContentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      note: "bg-purple-600",
      video: "bg-red-600",
      slide: "bg-blue-600",
      simulation: "bg-green-600",
      question: "bg-orange-600",
      past_paper: "bg-indigo-600",
    };
    return <Badge className={colors[type] || "bg-gray-600"}>{type}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Approval Queue</h1>
        <p className="text-muted-foreground">Review and approve scraped educational content</p>
      </div>

      <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="needs_review">Needs Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Content
              </CardTitle>
              <CardDescription>
                {queueItems?.length || 0} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : !queueItems || queueItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No {selectedStatus} content found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Curriculum</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queueItems.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-md">
                            <div className="space-y-1">
                              <div className="font-medium">{item.title}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getContentTypeBadge(item.contentType)}</TableCell>
                          <TableCell>{getQualityBadge(item.autoCategorizationScore)}</TableCell>
                          <TableCell>{item.metadata?.curriculum || "-"}</TableCell>
                          <TableCell>{item.metadata?.subject || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {item.url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(item.url, "_blank")}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              {selectedStatus === "pending" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApprove(item)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNeedsReview(item)}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleReject(item)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
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
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Content</DialogTitle>
            <DialogDescription>
              Assign topic and difficulty for this content item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topicId">Topic ID *</Label>
              <Input
                id="topicId"
                type="number"
                placeholder="Enter topic ID"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Suggested: {selectedItem?.metadata?.topic || "Not specified"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitApproval} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Content</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="e.g., Low quality, incorrect information, duplicate content..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={submitRejection}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
