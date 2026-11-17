import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { userCreateBody, userUpdateBody } from "@shared/forms";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/states";
import { ConfirmDialog, PageHeader, StatusBadge } from "../components/kit";
import { DataTable, type Column } from "../components/DataTable";
import { FormFields } from "../components/FormKit";
import { isAdmin, useAuth } from "../lib/auth";
import { useRemove, useSave } from "../lib/resource";

function UserForm({ user, onDone }: { user: User | null; onDone: () => void }) {
  const form = useForm({
    resolver: zodResolver(user ? userUpdateBody : userCreateBody),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "EDITOR", title: user?.title ?? "", password: "" },
  });
  const save = useSave("users");
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(async (v) => { await save.mutateAsync({ id: user?.id, body: v }); onDone(); })} className="grid gap-4 p-5 sm:grid-cols-2" noValidate>
        <FormFields fields={[
          { name: "name", label: "Full name", kind: "text", half: true }, { name: "email", label: "Email", kind: "email", half: true },
          { name: "role", label: "Role", kind: "select", options: [{ value: "EDITOR", label: "Editor: manages content" }, { value: "ADMIN", label: "Admin: content, users and settings" }] },
          { name: "title", label: "Job title", kind: "text", half: true },
          { name: "password", label: user ? "New password (leave empty to keep)" : "Password", kind: "text", hint: "At least 8 characters with a letter and a number." },
        ]} />
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />}{user ? "Save user" : "Create user"}</Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const admin = isAdmin(me);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin", "users", "list"], queryFn: () => api.get<User[]>("/admin/users"), enabled: admin });
  const remove = useRemove("users");
  const [editing, setEditing] = useState<User | "new" | null>(null);

  if (!admin) return <EmptyState icon={<ShieldAlert className="size-5" />} title="Admins only" text="Ask an admin if you need a new account or a role change." />;

  const admins = data?.filter((u) => u.role === "ADMIN").length ?? 0;
  const columns: Column<User>[] = [
    { key: "name", header: "User", cell: (u) => <div><p className="font-medium">{u.name}{u.id === me?.id && <span className="ml-2 text-xs text-text-muted">(you)</span>}</p><p className="text-xs text-text-muted">{u.email}</p></div> },
    { key: "role", header: "Role", cell: (u) => <StatusBadge status={u.role} label={u.role === "ADMIN" ? "Admin" : "Editor"} /> },
    { key: "posts", header: "Posts", hideOnMobile: true, cell: (u) => <span className="tabular-nums text-text-muted">{u._count?.posts ?? 0}</span> },
  ];

  return (
    <>
      <PageHeader title="Users" description="Editors manage content. Admins also manage users and site settings." actions={<Button onClick={() => setEditing("new")}><Plus />Invite user</Button>} />
      <DataTable rows={data} columns={columns} rowKey={(u) => u.id} loading={isLoading} error={isError} onRetry={() => refetch()}
        actions={(u) => {
          const protectedRow = u.id === me?.id || (u.role === "ADMIN" && admins <= 1);
          return (
            <div className="flex justify-end">
              <Button variant="ghost" size="icon-sm" onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`}><Pencil /></Button>
              <ConfirmDialog title={`Delete ${u.name}?`} description="Their posts stay published without an author." onConfirm={() => remove.mutateAsync(u.id)}
                trigger={<Button variant="ghost" size="icon-sm" disabled={protectedRow} aria-label={protectedRow ? (u.id === me?.id ? "You cannot delete yourself" : "Cannot delete the last admin") : `Delete ${u.name}`}
                  title={protectedRow ? (u.id === me?.id ? "You cannot delete yourself" : "Cannot delete the last admin") : undefined}><Trash2 /></Button>} />
            </div>
          );
        }} />
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-line"><SheetTitle>{editing === "new" ? "Invite user" : "Edit user"}</SheetTitle><SheetDescription>Share the password with them securely; they can change it from their profile.</SheetDescription></SheetHeader>
          {editing && <UserForm key={editing === "new" ? "new" : editing.id} user={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
