"use client";

import { useRouter } from "next/navigation";
import { Plus, Send, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { type TRPCError } from "@trpc/server";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export default function DashboardOrganization() {
  const [inviteUserEmail, setInviteUserEmail] = useState("");
  const router = useRouter();

  const { data: organization, isLoading: loadingOrganization } =
    useQuery(trpc.organization.getOrganization.queryOptions());

  const users = useMemo(() => {
    return (
      organization?.members.map((member) => ({
        ...member.user,
        role: member.roles.map((role) => role.permissionGroup.name).join(", "),
      })) ?? []
    );
  }, [organization]);

  const { mutateAsync: inviteUser } = useMutation(trpc.user.inviteUser.mutationOptions());

  const { mutateAsync: deleteUser } = useMutation(trpc.user.removeUser.mutationOptions());

  const { mutateAsync: deleteOrganization } =
    useMutation(trpc.organization.deleteOrganization.mutationOptions());

  const handleInviteUser = (userEmail: string) => {
    inviteUser({ email: userEmail })
      .then(() => {
        toast.success(`Successfully invited ${userEmail}.`);
      })
      .catch((error: TRPCError) => {
        toast.error(error.message);
      });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser({ userId })
      .then(() => {
        toast.success(`Successfully removed user.`);
      })
      .catch((error: TRPCError) => {
        toast.error(error.message);
      });
  };

  const handleDeleteOrganization = () => {
    deleteOrganization()
      .then(() => {
        toast.success(`Successfully deleted organization.`);
        router.replace("/no-organization");
      })
      .catch((error: TRPCError) => {
        toast.error(error.message);
      });
  };

  if (loadingOrganization || !organization) {
    return <Spinner />;
  }

  return (
    <main>
      <div className="mb-6 flex flex-row justify-between rounded-lg bg-sidebar p-6 shadow">
        <h2 className="text-lg font-semibold">{organization.name}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2"></div>
        <div className="flex items-end gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Input
                className="mb-4"
                value={inviteUserEmail}
                onChange={(event) => setInviteUserEmail(event.target.value)}
              />
              <Button onClick={() => handleInviteUser(inviteUserEmail)}>
                Invite
              </Button>
            </PopoverContent>
          </Popover>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
          <ConfirmationDialog
            title="Are you sure you want to delete this organization?"
            description="This action cannot be undone. This will permanently delete your organization and remove your data from our servers."
            onSubmit={handleDeleteOrganization}
            triggerButton={
              <Button>
                <Trash className="mr-2 h-4 w-4" />
                Delete Organization
              </Button>
            }
            cancelText="Cancel"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-sidebar p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Organization Members</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <ConfirmationDialog
                    title="Confirm user removal?"
                    description="This action cannot be undone. This user will be removed from your and no longer associated with your organization."
                    onSubmit={() => handleDeleteUser(user.id)}
                    triggerButton={
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    }
                    cancelText="Cancel"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
