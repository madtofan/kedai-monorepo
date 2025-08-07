"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type TRPCError } from "@trpc/server";
import { VerticalContainer } from "@/components/ui/container";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, trpc } from "@/utils/trpc";
import { toast } from "sonner";

const formSchema = z.object({
  menuGroupName: z.string().min(1),
});

export default function NewMenuGroupPage() {
  const [loading, setLoading] = useState(false);

  const { data: menuGroups } = useQuery(trpc.menuGroup.getAllMenuGroup.queryOptions());

  const { mutateAsync: addMenuGroup } =
    useMutation(trpc.menuGroup.addMenuGroup.mutationOptions());

  const { mutateAsync: deleteMenuGroup } =
    useMutation(trpc.menuGroup.deleteMenuGroup.mutationOptions());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      menuGroupName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    addMenuGroup({ name: values.menuGroupName })
      .then(() => {
        return Promise.allSettled([
          queryClient.invalidateQueries({ queryKey: trpc.menu.pathKey() }),
          queryClient.invalidateQueries({ queryKey: trpc.menuGroup.pathKey() }),
        ]);
      })
      .then(() => {
        toast.success(`Successfully added new menu group ${values.menuGroupName}.`);
        form.reset();
      })
      .catch((error: TRPCError) => {
        toast.error(error.message);
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteMenuGroup = (menuGroupId: string) => {
    const groupsToDelete = menuGroups?.find(
      (group) => group.id === menuGroupId,
    );
    if (groupsToDelete) {
      deleteMenuGroup({ id: menuGroupId })
        .then(() => {
          return Promise.allSettled([
            queryClient.invalidateQueries({ queryKey: trpc.menu.pathKey() }),
            queryClient.invalidateQueries({ queryKey: trpc.menuGroup.pathKey() }),
          ]);
        })
        .then(() => {
          toast.success(`Successfully removed menu group ${groupsToDelete.name}.`);
        })
        .catch((error: TRPCError) => {
          toast.error(error.message);
        });
    }
  };

  return (
    <main>
      <div className="mb-6 flex flex-row justify-between rounded-lg bg-sidebar p-4 shadow">
        <div className="grid grid-flow-col gap-4">
          <h2 className="self-center text-lg font-semibold">
            Initialization Wizard
          </h2>
          <p className="self-center">
            Add menu groups! (eg: Food, Drinks, Desserts)
          </p>
        </div>
        <div className="grid grid-flow-col gap-4">
          <Button asChild variant="outline">
            <Link href="/no-organization/new-menu">
              {menuGroups?.length === 0 ? "Skip" : "Done"}
            </Link>
          </Button>
        </div>
      </div>
      <VerticalContainer>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mb-4 grid grid-flow-col items-end gap-4"
          >
            <FormField
              control={form.control}
              name="menuGroupName"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? <Spinner /> : <Plus className="mr-2 h-4 w-4" />}
              Add Menu Group
            </Button>
          </form>
        </Form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu Group Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuGroups?.map((menuGroup) => (
              <TableRow key={menuGroup.id}>
                <TableCell className="font-medium">{menuGroup.name}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteMenuGroup(menuGroup.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </VerticalContainer>
    </main>
  );
}
