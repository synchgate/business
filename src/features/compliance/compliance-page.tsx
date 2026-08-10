import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaxProfileForm } from "@/features/compliance/tax-profile-form";
import { ObligationsList } from "@/features/compliance/obligations-list";
import { ReportsList } from "@/features/compliance/reports-list";

export function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Tax & Compliance</h2>
        <p className="text-sm text-[var(--color-body)]">
          Track filing deadlines and generate reports from your invoicing and payroll data.
        </p>
      </div>

      <Tabs defaultValue="obligations">
        <TabsList>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="profile">Tax profile</TabsTrigger>
        </TabsList>

        <TabsContent value="obligations">
          <ObligationsList />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsList />
        </TabsContent>

        <TabsContent value="profile">
          <TaxProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
