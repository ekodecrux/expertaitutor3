import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SubscriptionManagement() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  const { data: subscription, isLoading, refetch } = trpc.stripe.getMySubscription.useQuery();
  const cancelMutation = trpc.stripe.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Your subscription will remain active until the end of the current billing period.");
      setShowCancelDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resumeMutation = trpc.stripe.resumeSubscription.useMutation({
    onSuccess: () => {
      toast.success("Your subscription will continue automatically.");
      setShowResumeDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const portalMutation = trpc.stripe.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.open(data.portalUrl, "_blank");
      toast.info("Opening billing portal in new tab...");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Subscribe to unlock premium features and content.
            </p>
            <Button onClick={() => window.location.href = "/pricing"}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500"><Calendar className="h-3 w-3 mr-1" />Trial</Badge>;
      case "past_due":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Past Due</Badge>;
      case "canceled":
      case "cancelled":
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stripeData = (subscription as any).stripeData || {};
  const currentPeriodEnd = stripeData.currentPeriodEnd 
    ? new Date(stripeData.currentPeriodEnd)
    : subscription.currentPeriodEnd 
      ? new Date(subscription.currentPeriodEnd)
      : null;

  const trialEnd = stripeData.trialEnd 
    ? new Date(stripeData.trialEnd)
    : subscription.trialEnd 
      ? new Date(subscription.trialEnd)
      : null;

  const cancelAtPeriodEnd = stripeData.cancelAtPeriodEnd ?? subscription.cancelAtPeriodEnd ?? false;

  return (
    <div className="container max-w-4xl py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            {getStatusBadge(stripeData.status || subscription.status || "active")}
          </div>
          <CardDescription>
            {subscription.planType || "Subscription Plan"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trialEnd && new Date() < trialEnd && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Your free trial ends on {trialEnd.toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          {cancelAtPeriodEnd && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be canceled on {currentPeriodEnd?.toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {currentPeriodEnd && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Next Billing Date</span>
                <span className="text-sm text-muted-foreground">
                  {currentPeriodEnd.toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Auto-Renew</span>
              <span className="text-sm text-muted-foreground">
                {subscription.autoRenew && !cancelAtPeriodEnd ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {portalMutation.isPending ? "Opening..." : "Manage Billing"}
          </Button>

          {!cancelAtPeriodEnd ? (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Subscription
            </Button>
          ) : (
            <Button
              onClick={() => setShowResumeDialog(true)}
            >
              Resume Subscription
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Your subscription will remain active until {currentPeriodEnd?.toLocaleDateString()}.
              You won't be charged again, but you'll lose access to premium features after this date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Confirmation Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume Subscription?</DialogTitle>
            <DialogDescription>
              Your subscription will continue and you'll be charged on {currentPeriodEnd?.toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResumeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
            >
              {resumeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resuming...
                </>
              ) : (
                "Yes, Resume"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
