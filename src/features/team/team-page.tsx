import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequirePermission } from "@/components/team/require-permission";
import { MembersList } from "@/features/team/members-list";
import { InvitesList } from "@/features/team/invites-list";
import { InviteForm } from "@/features/team/invite-form";

export function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Team</h2>
          <p className="text-sm text-[var(--color-body)]">
            Manage who has access to this business, and what they can do.
          </p>
        </div>
        <RequirePermission code="team.invite">
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="size-4" />
            Invite teammate
          </Button>
        </RequirePermission>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardContent className="px-0 pb-0">
              <MembersList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites">
          <Card>
            <CardContent className="px-0 pb-0">
              <InvitesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              They'll get an email with a link to join. You can change their role anytime.
            </DialogDescription>
          </DialogHeader>
          <InviteForm onSuccess={() => setShowInvite(false)} onCancel={() => setShowInvite(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
