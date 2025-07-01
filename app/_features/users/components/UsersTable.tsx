"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TableV2 } from "@/app/_components/common/TableV2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { RoleAvatar } from "@/app/_components/common/RoleAvatar";
import { UpsertUser } from "../form/UpsertUser";
import { createServerClient } from "@supabase/ssr";
import { inviteUserServerAction } from "../api/inviteUserRole";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_login?: string;
  avatar_url?: string;
}

interface UsersTableProps {
  users: User[];
  onView?: (user: User) => void;
}

export function UsersTable({ users, onView }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => {
        const fullName = row.original.full_name || "N/A";
        return (
          <div className="flex items-center gap-2">
            <RoleAvatar
              full_name={fullName}
              className="h-8 w-8 ring-2 ring-brand/20"
            />
            <div className="text-sm font-medium">{fullName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "created_at",
      header: "Date Created",
      cell: ({ row }) => {
        return format(new Date(row.getValue("created_at")), "MMM dd, yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  setSelectedUser(user);

                  try {
                    const res = await inviteUserServerAction({
                      email: user.email,
                      full_name: user.full_name,
                      role: user.role,
                    });

                    console.log(res);

                    if (res.success === false) {
                      showErrorToast(res.error || "Failed to send invitation.");

                      // Set form errors based on the response
                      if (res.error) {
                        // If there's a specific field error, you can set it like this:
                        // form.setError("email", { message: res.error });

                        showErrorToast(
                          res.error || "Failed to send invitation."
                        );
                      }

                      return false;
                    }

                    showSuccessToast("Invitation sent successfully!");
                  } catch (error: any) {
                    console.error("Error sending invite:", error);
                    showErrorToast(
                      error.message || "Failed to send invitation."
                    );
                  }
                }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Resend Invite
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Handle delete user
                }}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <TableV2
        columns={columns}
        data={users}
        filterColumn="full_name"
        filterPlaceholder="Filter by user name..."
      />

      {/* User Form Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1000px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User" : "Create New User"}
            </DialogTitle>
          </DialogHeader>

          {/* Add your user form component here */}
          {/* <UserForm onSuccess={() => setIsUserDialogOpen(false)} /> */}
          <UpsertUser onSuccess={() => setIsUserDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
