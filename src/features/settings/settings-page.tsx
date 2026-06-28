import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMerchantUsage, useSubscriptions } from "@/hooks/use-billing";
import { formatMoney } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useSettlementAccount } from "@/hooks/use-settlement-account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateMerchant } from "@/api/endpoints/merchant";
import { updateProfile, getUserDetail } from "@/api/endpoints/auth";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { formatDate } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const schema = z.object({
  business_name: z.string().min(1, "Required"),
  business_email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  business_phone: z.string().optional(),
  business_type: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  registration_number: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function ProfileTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileSchema = z.object({
    first_name: z.string().min(1, "Required"),
    last_name: z.string().min(1, "Required"),
    phone: z.string().optional(),
    bio: z.string().optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
  });
  type ProfileForm = z.infer<typeof profileSchema>;

  const { data: detail, isLoading } = useQuery({
    queryKey: ["auth", "userDetail"],
    queryFn: getUserDetail,
  });
  const profile = detail?.profile;

  // ── image state ──────────────────────────────────────────────────────────
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      address: profile.address ?? "",
      country: profile.country ?? "",
      state: profile.state ?? "",
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileForm) => {
      // If there's an image, send as multipart; otherwise send JSON as before
      if (avatarFile) {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ""));
        // fd.append("avatar", avatarFile);
        fd.append("image", avatarFile);
        return updateProfile(fd);
      }
      return updateProfile(values);
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["auth", "userDetail"] });
    },
    onError: (err) => {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't save your profile."));
    },
  });

  if (isLoading || !user) return <Skeleton className="h-64 w-full" />;

  // resolve what src to show: new preview → existing avatar → initials fallback
  const displaySrc = avatarPreview ?? profile?.image ?? null;
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join("").toUpperCase();

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <Card>
        <CardHeader>
          <CardTitle>Personal profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">

          {/* ── Avatar upload ─────────────────────────────────────────────── */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Profile photo</Label>
            <div className="flex items-center gap-4">
              {/* Preview circle */}
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-sm font-medium text-[var(--color-muted)]">
                {displaySrc ? (
                  <img src={displaySrc} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <span>{initials || "?"}</span>
                )}
              </div>
              {/* Hidden file input triggered by button */}
              <div className="space-y-1">
                <label htmlFor="avatar_upload">
                  <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]">
                    {avatarFile ? "Change photo" : "Upload photo"}
                  </span>
                  <input
                    id="avatar_upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="text-xs text-[var(--color-muted)]">PNG, JPG or WebP · max 2 MB</p>
                {avatarFile && (
                  <p className="text-xs text-[var(--color-muted)]">{avatarFile.name}</p>
                )}
              </div>
            </div>
          </div>
          {/* ─────────────────────────────────────────────────────────────── */}

          <div className="space-y-1.5">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" {...register("first_name")} />
            {errors.first_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" {...register("last_name")} />
            {errors.last_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email} disabled />
            <p className="text-xs text-[var(--color-muted)]">Email can't be changed here.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" {...register("bio")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="prof_address">Address</Label>
            <Input id="prof_address" {...register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prof_country">Country</Label>
            <Input id="prof_country" {...register("country")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prof_state">State</Label>
            <Input id="prof_state" {...register("state")} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save profile"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function PlanTab() {
  const { data: subscriptions, isLoading: subLoading } = useSubscriptions();
  const { data: usage, isLoading: usageLoading } = useMerchantUsage();

  if (subLoading || usageLoading) return <Skeleton className="h-64 w-full" />;

  const activeSubscription = subscriptions?.find((s) => s.is_active) ?? subscriptions?.[0];
  const plan = activeSubscription?.plan;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent>
          {plan ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--color-muted)]">Plan</p>
                <p className="text-sm font-medium capitalize text-[var(--color-ink)]">{plan.name}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Tier</p>
                <p className="text-sm capitalize text-[var(--color-ink)]">{plan.tier}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Price</p>
                <p className="font-ledger text-sm text-[var(--color-ink)]">
                  {Number(plan.price) === 0 ? "Free" : formatMoney(plan.price, "NGN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Transaction limit</p>
                <p className="font-ledger text-sm text-[var(--color-ink)]">
                  {plan.transaction_limit === 0 ? "Unlimited" : plan.transaction_limit.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Platform fee</p>
                <p className="font-ledger text-sm text-[var(--color-ink)]">
                  {formatMoney(plan.fee_per_transaction, "NGN")} / transaction
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-[var(--color-status-paid)]" />
                <span className="text-sm text-[var(--color-status-paid)]">
                  {activeSubscription?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-body)]">No active subscription found.</p>
          )}
        </CardContent>
      </Card>

      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage & credits</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-[var(--color-muted)]">Account status</p>
              <p className="text-sm capitalize text-[var(--color-ink)]">{usage.account_status}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)]">Credit limit</p>
              <p className="font-ledger text-sm text-[var(--color-ink)]">{formatMoney(usage.credit_limit)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)]">Available credit</p>
              <p className="font-ledger text-sm text-[var(--color-ink)]">{formatMoney(usage.available_credit)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)]">Current balance</p>
              <p className="font-ledger text-sm text-[var(--color-ink)]">{formatMoney(usage.current_balance)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)]">Pending fees</p>
              <p className="font-ledger text-sm text-[var(--color-ink)]">
                {formatMoney(usage.pending_fee_total)} ({usage.pending_fee_count})
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)]">Invoiced fees</p>
              <p className="font-ledger text-sm text-[var(--color-ink)]">
                {formatMoney(usage.invoiced_fee_total)} ({usage.invoiced_fee_count})
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BusinessProfileTab() {
  const { merchant } = useAuth();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: merchant
      ? {
          business_name: merchant.business_name ?? "",
          business_email: merchant.business_email ?? "",
          business_phone: merchant.business_phone ?? "",
          business_type: merchant.business_type ?? "",
          website: merchant.website ?? "",
          address: merchant.address ?? "",
          country: merchant.country ?? "",
          state: merchant.state ?? "",
          registration_number: merchant.registration_number ?? "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateMerchant(merchant!.id, values),
    onSuccess: () => {
      toast.success("Business profile updated.");
      queryClient.invalidateQueries({ queryKey: ["auth", "userDetail"] });
    },
    onError: (err) => {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't save your changes."));
    },
  });

  if (!merchant) return <Skeleton className="h-64 w-full" />;

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="business_name">Business name</Label>
            <Input id="business_name" {...register("business_name")} />
            {errors.business_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.business_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="business_email">Business email</Label>
            <Input id="business_email" type="email" {...register("business_email")} />
            {errors.business_email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.business_email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="business_phone">Business phone</Label>
            <Input id="business_phone" {...register("business_phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="business_type">Business type</Label>
            <Input id="business_type" placeholder="e.g. Retail, SaaS, Logistics" {...register("business_type")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://" {...register("website")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="registration_number">Registration number</Label>
            <Input id="registration_number" {...register("registration_number")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function SettlementTab() {
  const { settlementAccount, isLoading } = useSettlementAccount();

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {settlementAccount ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--color-muted)]">Account name</p>
                <p className="text-sm text-[var(--color-ink)]">{settlementAccount.account_name}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Bank</p>
                <p className="text-sm text-[var(--color-ink)]">{settlementAccount.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Account number</p>
                <p className="font-ledger text-sm text-[var(--color-ink)]">{settlementAccount.account_number}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Configured</p>
                <p className="text-sm text-[var(--color-ink)]">{formatDate(settlementAccount.created_at)}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              To change your settlement account, contact Synchgate support — there's no self-serve update yet.
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--color-body)]">No settlement account configured.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ComingSoonTab({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)]">
          <Sparkles className="size-5 text-[var(--color-muted)]" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-[var(--color-ink)]">{title}</p>
          <p className="mt-1 max-w-sm text-sm text-[var(--color-body)]">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Settings</h2>
        <p className="text-sm text-[var(--color-body)]">Manage your business profile and invoicing preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
          <TabsTrigger value="plan">Plan & usage</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="business">
          <BusinessProfileTab />
        </TabsContent>
        <TabsContent value="settlement">
          <SettlementTab />
        </TabsContent>
        <TabsContent value="plan">
          <PlanTab />
        </TabsContent>
        <TabsContent value="notifications">
          <ComingSoonTab
            title="Notification preferences"
            description="Choosing which events trigger email/WhatsApp alerts is coming soon."
          />
        </TabsContent>
        <TabsContent value="branding">
          <ComingSoonTab
            title="Branding"
            description="Custom logos and colors on invoices and emails are coming soon."
          />
        </TabsContent>
        <TabsContent value="templates">
          <ComingSoonTab
            title="Invoice templates"
            description="Custom invoice layouts and fields are coming soon."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
