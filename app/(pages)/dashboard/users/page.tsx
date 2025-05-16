import { UsersTable } from "@/app/_features/users/components/UsersTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllUsers } from "@/app/_features/users/api/getAllUsers";
import { CreateUserDialog } from "@/app/_features/users/components/CreateUserDialog";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string;
}

export default async function UsersPage() {
  const { users, error } = await getAllUsers();

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-red-500 text-center p-4">
          Error loading users:{" "}
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <CreateUserDialog />
      </div>

      <UsersTable users={users as User[]} />
    </div>
  );
}
