"use client";

import { Plus, Trash } from "lucide-react";
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
import { queryClient, trpc, type RouterOutputs } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type MenuType = RouterOutputs["menu"]["getMenu"][0];

export default function DashboardMenuGroupPage() {
  const [newMenuGroup, setNewMenuGroup] = useState("");

  const { data: menuGroups, isLoading: loadingMenuGroups } =
    useQuery(trpc.menuGroup.getAllMenuGroup.queryOptions());

  const { data: menus, isLoading: loadingMenus } = useQuery(trpc.menu.getMenu.queryOptions());

  const menuGroupsWithMenus = useMemo(() => {
    if (!menus) {
      return {};
    }
    return menus.reduce<Record<string, MenuType[]>>(
      (accumulatedMenus, menu) => {
        const key = menu.menuGroups?.id ?? "";
        return {
          ...accumulatedMenus,
          [key]: [...(accumulatedMenus[key] ?? []), menu],
        };
      },
      {},
    );
  }, [menus]);

  const { mutateAsync: addMenuGroup } =
    useMutation(trpc.menuGroup.addMenuGroup.mutationOptions());

  const { mutateAsync: deleteMenuGroup } =
    useMutation(trpc.menuGroup.deleteMenuGroup.mutationOptions());

  const handleAddMenuGroup = () => {
    addMenuGroup({ name: newMenuGroup })
      .then(() => {
        setNewMenuGroup("");
        return Promise.allSettled([
          queryClient.invalidateQueries({ queryKey: trpc.menu.pathKey() }),
          queryClient.invalidateQueries({ queryKey: trpc.menuGroup.pathKey() }),
        ]);
      })
      .then(() => {
        toast.success(`Successfully added new menu group ${newMenuGroup}.`);
      })
      .catch((error: TRPCError) => {
        toast.error(error.message);
      });
  };

  const handleDeleteMenuGroup = (menuGroupId: string) => {
    const menuGroupToDelete = menuGroups?.find(
      (group) => group.id === menuGroupId,
    );
    if (menuGroupToDelete) {
      deleteMenuGroup({ id: menuGroupId })
        .then(() => {
          return Promise.allSettled([
            queryClient.invalidateQueries({ queryKey: trpc.menu.pathKey() }),
            queryClient.invalidateQueries({ queryKey: trpc.menuGroup.pathKey() }),
          ]);
        })
        .then(() => {
          toast.success(`Successfully removed menu group ${menuGroupToDelete.name}.`);
        })
        .catch((error: TRPCError) => {
          toast.error(error.message);
        });
    }
  };

  if (loadingMenus || loadingMenuGroups) {
    return <Spinner />;
  }

  return (
    <main>
      <div className="mb-6 flex flex-row justify-between rounded-lg bg-sidebar p-6 shadow">
        <h2 className="text-lg font-semibold">Menu Groups</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2"></div>
        <div className="flex items-end gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Menu Group
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Input
                className="mb-4"
                value={newMenuGroup}
                onChange={(event) => setNewMenuGroup(event.target.value)}
              />
              <Button onClick={handleAddMenuGroup}>Add</Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-sidebar p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Organization Members</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu Group Name</TableHead>
              <TableHead>Menus</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuGroups?.map((menuGroup) => (
              <TableRow key={menuGroup.id}>
                <TableCell className="font-medium">{menuGroup.name}</TableCell>
                <TableCell>
                  {menuGroupsWithMenus[menuGroup.id]
                    ?.map((menu) => menu.menuDetails.name)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  {menuGroupsWithMenus[menuGroup.id] ? (
                    <ConfirmationDialog
                      title="Confirm menu group removal"
                      description="This action cannot be undone. This menu group will be removed and associated menus will not have a menu group."
                      onSubmit={() => handleDeleteMenuGroup(menuGroup.id)}
                      triggerButton={
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      }
                      cancelText="Cancel"
                    />
                  ) : (
                    <Button
                      onClick={() => handleDeleteMenuGroup(menuGroup.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
