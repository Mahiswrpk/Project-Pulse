"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getNotificationPreferences, updateNotificationPreferences } from "@/actions/notification.actions";
import { toast } from "@/components/ui/use-toast";
import { UserButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";

interface Prefs {
  emailTaskDue: boolean;
  emailTaskOverdue: boolean;
  emailMilestone: boolean;
  emailProjectDeadline: boolean;
  inAppTaskDue: boolean;
  inAppTaskOverdue: boolean;
  inAppMilestone: boolean;
  inAppProjectDeadline: boolean;
}

const DEFAULT_PREFS: Prefs = {
  emailTaskDue: true, emailTaskOverdue: true, emailMilestone: true, emailProjectDeadline: true,
  inAppTaskDue: true, inAppTaskOverdue: true, inAppMilestone: true, inAppProjectDeadline: true,
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationPreferences().then((p) => { if (p) setPrefs({ emailTaskDue: p.emailTaskDue, emailTaskOverdue: p.emailTaskOverdue, emailMilestone: p.emailMilestone, emailProjectDeadline: p.emailProjectDeadline, inAppTaskDue: p.inAppTaskDue, inAppTaskOverdue: p.inAppTaskOverdue, inAppMilestone: p.inAppMilestone, inAppProjectDeadline: p.inAppProjectDeadline }); });
  }, []);

  const toggle = (key: keyof Prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(prefs);
      toast({ title: "Settings saved!" });
    } catch { toast({ title: "Failed to save", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const notifItems = [
    { key: "TaskDue" as const, label: "Task Due Today", desc: "Notified when a task is due today" },
    { key: "TaskOverdue" as const, label: "Overdue Tasks", desc: "Notified when tasks become overdue" },
    { key: "Milestone" as const, label: "Upcoming Milestones", desc: "Milestones within 7 days" },
    { key: "ProjectDeadline" as const, label: "Project Deadlines", desc: "Projects due within 7 days" },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" />Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your profile and account settings via Clerk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" showName />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">In-App Notifications</h3>
            <div className="space-y-4">
              {notifItems.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={prefs[`inApp${key}`]} onCheckedChange={() => toggle(`inApp${key}`)} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Email Notifications</h3>
            <div className="space-y-4">
              {notifItems.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={prefs[`email${key}`]} onCheckedChange={() => toggle(`email${key}`)} />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
