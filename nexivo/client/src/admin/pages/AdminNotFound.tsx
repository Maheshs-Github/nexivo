import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export default function AdminNotFound() {
  return <EmptyState title="This admin page doesn't exist" text="It may have moved. Head back to the dashboard." action={<Button asChild><Link to="/admin">Go to dashboard</Link></Button>} />;
}
