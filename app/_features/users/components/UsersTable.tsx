"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, User as UserIcon } from "lucide-react";
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
import { UpdateUser } from "../form/UpdateUser";
import { createServerClient } from "@supabase/ssr";
import { inviteUserServerAction } from "../api/inviteUserRole";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { User } from "../types";

interface UsersTableProps {
  users: User[];
  onView?: (user: User) => void;
}

export function UsersTable({ users, onView }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phoneNumber = row.getValue("phone_number");
        return (
          phoneNumber || (
            <span className="text-gray-400 font-semibold">Not provided</span>
          )
        );
      },
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
      accessorKey: "last_sign_in_at",
      header: "Last Sign In",
      cell: ({ row }) => {
        const lastSignIn = row.getValue("last_sign_in_at");
        if (!lastSignIn) {
          return (
            <span className="text-yellow-400 font-bold">
              Waiting for verification
            </span>
          );
        }
        return format(new Date(lastSignIn as string), "MMM dd, yyyy HH:mm");
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
                onClick={() => {
                  setSelectedUser(user);
                  setIsEditDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
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
        <DialogContent className="max-w-xl">
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl sm:max-w-lg md:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <UpdateUser
              user={selectedUser}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                // Optionally refresh the page or update the users list
                window.location.reload();
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
