import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { profileBody } from "@shared/forms";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "../components/kit";
import { FormFields } from "../components/FormKit";
import { useAuth } from "../lib/auth";

export default function Profile() {
  const { user, refresh } = useAuth();
  const form = useForm({ resolver: zodResolver(profileBody), defaultValues: { name: user?.name ?? "", title: user?.title ?? "", bio: user?.bio ?? "", currentPassword: "", newPassword: "" } });
  const save = useMutation({
    mutationFn: (v: unknown) => api.put("/auth/me", v),
    onSuccess: (res) => { toast.success(res.message ?? "Profile updated"); form.reset({ ...form.getValues(), currentPassword: "", newPassword: "" }); refresh(); },
    onError: (e) => {
      if (e instanceof ApiError && e.errors) for (const [k, v] of Object.entries(e.errors)) form.setError(k as never, { message: v[0] });
      toast.error((e as Error).message);
    },
  });
  return (
    <>
      <PageHeader title="Profile" description={user?.email} />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="max-w-2xl space-y-4" noValidate>
          <Panel title="About you" description="Shown in the author box on your blog posts.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormFields fields={[{ name: "name", label: "Name", kind: "text", half: true }, { name: "title", label: "Job title", kind: "text", half: true }, { name: "bio", label: "Short bio", kind: "textarea" }]} />
            </div>
          </Panel>
          <Panel title="Change password" description="Leave empty to keep your current password.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-medium">Current password<input type="password" autoComplete="current-password" {...form.register("currentPassword")} className="h-8 rounded-lg border border-line-strong bg-surface/40 px-2.5 text-sm font-normal" /></label>
              <label className="flex flex-col gap-1.5 text-xs font-medium">New password<input type="password" autoComplete="new-password" {...form.register("newPassword")} className="h-8 rounded-lg border border-line-strong bg-surface/40 px-2.5 text-sm font-normal" />
                {form.formState.errors.newPassword && <span role="alert" className="font-normal text-danger">{form.formState.errors.newPassword.message}</span>}
                {form.formState.errors.currentPassword && <span role="alert" className="font-normal text-danger">{form.formState.errors.currentPassword.message}</span>}
              </label>
            </div>
          </Panel>
          <div className="flex justify-end"><Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />}Save profile</Button></div>
        </form>
      </FormProvider>
    </>
  );
}
