"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Check,
  ChevronDown,
  Clock,
  Edit,
  Filter,
  MoreHorizontal,
  Search,
  Trash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { queryClient, trpc, type RouterOutputs } from "@/utils/trpc";
import { formatDateTime } from "@/utils/date";
import { useMutation, useQuery } from "@tanstack/react-query";

const ORDER_STATUS = {
  NEW: "new",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;
type ORDER_STATUS_KEY = keyof typeof ORDER_STATUS;
type ORDER_STATUS_VALUE = (typeof ORDER_STATUS)[ORDER_STATUS_KEY];

const ORDER_ITEM_STATUS = {
  ORDERED: "ordered",
  PREPARING: "preparing",
  CANCELLED: "cancelled",
  SERVED: "served",
  PAID: "paid",
} as const;
type ORDER_ITEM_STATUS_KEY = keyof typeof ORDER_ITEM_STATUS;
type ORDER_ITEM_STATUS_VALUE =
  (typeof ORDER_ITEM_STATUS)[ORDER_ITEM_STATUS_KEY];

// Status options
const ITEM_STATUS_OPTIONS: { value: ORDER_ITEM_STATUS_VALUE; label: string }[] =
  [
    { value: "ordered", label: "Ordered" },
    { value: "preparing", label: "Preparing" },
    { value: "served", label: "Served" },
    { value: "cancelled", label: "Cancelled" },
    { value: "paid", label: "Paid" },
  ];

// Order status options
const ORDER_STATUS_OPTIONS: { value: ORDER_STATUS_VALUE; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function getStatusColor(status: string) {
  switch (status) {
    case ORDER_ITEM_STATUS.ORDERED:
      return "bg-yellow-500";
    case ORDER_ITEM_STATUS.PREPARING:
      return "bg-blue-500";
    case ORDER_ITEM_STATUS.SERVED:
      return "bg-green-500";
    case ORDER_ITEM_STATUS.CANCELLED:
      return "bg-red-500";
    case ORDER_ITEM_STATUS.PAID:
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

function getOrderStatusColor(status: string | null) {
  switch (status) {
    case ORDER_STATUS.NEW:
      return "bg-blue-500";
    case ORDER_STATUS.ACTIVE:
      return "bg-yellow-500";
    case ORDER_STATUS.COMPLETED:
      return "bg-green-500";
    case ORDER_STATUS.CANCELLED:
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

// Form schema for editing an item
const itemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity of the item is required"),
});

const ALL_VALUE = "all";

type Order = RouterOutputs["order"]["getStoreActiveOrders"][0];
type Item = RouterOutputs["order"]["getStoreActiveOrders"][0]["orderItems"][0];
const TABS_STATUS = [
  ALL_VALUE,
  ORDER_STATUS.NEW,
  ORDER_STATUS.ACTIVE,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
] as const;
type ActiveTab = (typeof TABS_STATUS)[number];

const calculateOrderTotal = (items: Item[]) => {
  return items.reduce(
    (sum, item) => sum + item.menuDetails.sale * item.quantity,
    0,
  );
};

const getOrderStatus = (order: Order) => {
  if (
    order.orderItems.some((item) => item.status !== ORDER_ITEM_STATUS.ORDERED)
  )
    return ORDER_STATUS.ACTIVE;
  if (
    order.orderItems.every((item) => item.status === ORDER_ITEM_STATUS.ORDERED)
  )
    return ORDER_STATUS.NEW;
  if (
    order.orderItems.every(
      (item) =>
        item.status === ORDER_ITEM_STATUS.PAID ||
        item.status === ORDER_ITEM_STATUS.SERVED,
    )
  )
    return ORDER_STATUS.COMPLETED;
  if (
    order.orderItems.every(
      (item) => item.status === ORDER_ITEM_STATUS.CANCELLED,
    )
  )
    return ORDER_STATUS.CANCELLED;
  return null;
};

export default function ActiveOrders() {
  const params = useParams<{ storeSlug: string }>();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>(ALL_VALUE);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Item | null>(null);

  const { data: activeOrders } = useQuery(trpc.order.getStoreActiveOrders.queryOptions({
    storeSlug: params.storeSlug,
  }));

  const { mutate: updateOrder } = useMutation(trpc.order.updateOrder.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.order.getStoreActiveOrders.pathKey() });
    },
  }));

  const { mutate: updateOrderItem } = useMutation(trpc.order.updateOrderItem.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.order.getStoreActiveOrders.pathKey() });
    },
  }));

  const updateActiveTab = (newTabValue: string) => {
    if (TABS_STATUS.includes(newTabValue as ActiveTab)) {
      setActiveTab(newTabValue as ActiveTab);
      return;
    }
    setActiveTab(ALL_VALUE);
  };

  // Initialize form
  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      quantity: 0,
    },
  });

  // Filter orders based on tab and search
  const filteredOrders = (activeOrders ?? []).filter((order) => {
    const orderStatus = getOrderStatus(order);
    const matchesTab =
      activeTab === ALL_VALUE ||
      (activeTab === ORDER_STATUS.NEW && orderStatus === ORDER_STATUS.NEW) ||
      (activeTab === ORDER_STATUS.COMPLETED &&
        orderStatus === ORDER_STATUS.COMPLETED) ||
      (activeTab === ORDER_STATUS.CANCELLED &&
        orderStatus === ORDER_STATUS.CANCELLED) ||
      (activeTab === ORDER_STATUS.ACTIVE &&
        orderStatus === ORDER_STATUS.ACTIVE);
    const matchesSearch =
      searchQuery === "" ||
      order.id.toString().includes(searchQuery.toLowerCase()) ||
      order.tableName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Handle status change for an item
  const handleItemStatusChange = (
    orderId: number,
    itemId: number,
    newStatus: ORDER_ITEM_STATUS_VALUE,
  ) => {
    updateOrderItem({
      orderId,
      itemId,
      status: newStatus,
    });
  };

  // Handle status change for an order
  const handleOrderStatusChange = (
    orderId: number,
    newStatus: ORDER_STATUS_VALUE,
  ) => {
    let newItemStatus: string | null = null;
    if (newStatus === ORDER_ITEM_STATUS.CANCELLED) {
      if (
        !confirm("Are you sure you want to cancel this item from the order?")
      ) {
        return;
      }
      newItemStatus = ORDER_ITEM_STATUS.CANCELLED;
    }
    if (newStatus === ORDER_STATUS.COMPLETED) {
      newItemStatus = ORDER_ITEM_STATUS.SERVED;
    }
    if (newItemStatus) {
      updateOrder({
        orderId,
        itemStatuses: newItemStatus,
      });
    }
  };

  // Handle edit item
  const handleEditItem = (order: Order, item: Item) => {
    setSelectedOrder(order);
    setEditingItem(item);
    form.reset({
      quantity: item.quantity,
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof itemSchema>) => {
    if (selectedOrder && editingItem) {
      updateOrderItem({
        orderId: selectedOrder.id,
        itemId: editingItem.id,
        quantity: data.quantity,
      });
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    setSelectedOrder(null);
  };

  // Handle delete item
  const handleDeleteItem = (orderId: number, itemId: number) => {
    if (confirm("Are you sure you want to cancel this item from the order?")) {
      updateOrderItem({
        orderId,
        itemId,
        status: ORDER_ITEM_STATUS.CANCELLED,
      });
    }
  };

  return (
    <div className="min-h-screen space-y-4 bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Active Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track current restaurant orders
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium">Filter Orders</h4>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Status</h5>
                    <div className="space-y-1">
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`status-${option.value}`}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label
                            htmlFor={`status-${option.value}`}
                            className="text-sm font-normal"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button size="sm">Apply Filters</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue={ALL_VALUE}
          value={activeTab}
          onValueChange={updateActiveTab}
        >
          <TabsList>
            <TabsTrigger value={ALL_VALUE}>All Orders</TabsTrigger>
            <TabsTrigger value={ORDER_STATUS.NEW}>New</TabsTrigger>
            <TabsTrigger value={ORDER_STATUS.ACTIVE}>Active</TabsTrigger>
            <TabsTrigger value={ORDER_STATUS.COMPLETED}>Completed</TabsTrigger>
            <TabsTrigger value={ORDER_STATUS.CANCELLED}>Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              onItemStatusChange={handleItemStatusChange}
              onOrderStatusChange={handleOrderStatusChange}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              onItemStatusChange={handleItemStatusChange}
              onOrderStatusChange={handleOrderStatusChange}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              onItemStatusChange={handleItemStatusChange}
              onOrderStatusChange={handleOrderStatusChange}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>
          <TabsContent value="cancelled" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              onItemStatusChange={handleItemStatusChange}
              onOrderStatusChange={handleOrderStatusChange}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Item Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Order Item</DialogTitle>
              <DialogDescription>
                Update the quantity for {editingItem?.menuDetails.name ?? ""}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Orders Table Component
function OrdersTable({
  orders,
  onItemStatusChange,
  onOrderStatusChange,
  onEditItem,
  onDeleteItem,
}: {
  orders: Order[];
  onItemStatusChange: (
    orderId: number,
    itemId: number,
    newStatus: ORDER_ITEM_STATUS_VALUE,
  ) => void;
  onOrderStatusChange: (orderId: number, newStatus: ORDER_STATUS_VALUE) => void;
  onEditItem: (order: (typeof orders)[0], item: Item) => void;
  onDeleteItem: (orderId: number, itemId: number) => void;
}) {
  const [expandedOrders, setExpandedOrders] = React.useState<
    Record<string, boolean>
  >({});

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const orderStatus = getOrderStatus(order);

                return (
                  <React.Fragment key={order.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggleOrderExpand(order.id)}
                    >
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>Table {order.tableName}</TableCell>
                      <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                      <TableCell>{order.orderItems.length} items</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getOrderStatusColor(orderStatus)}>
                            {orderStatus}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Change status</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {ORDER_STATUS_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOrderStatusChange(order.id, option.value);
                                  }}
                                >
                                  <span>{option.label}</span>
                                  {orderStatus === option.value && (
                                    <Check className="ml-2 h-4 w-4" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${calculateOrderTotal(order.orderItems).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderExpand(order.id);
                          }}
                        >
                          {expandedOrders[order.id]
                            ? "Hide Details"
                            : "View Details"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrders[order.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-muted/50 p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead className="text-center">
                                    Quantity
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Price
                                  </TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.orderItems.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      {item.menuDetails.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      $
                                      {(
                                        item.menuDetails.sale * item.quantity
                                      ).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          className={getStatusColor(
                                            item.status,
                                          )}
                                        >
                                          {item.status}
                                        </Badge>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                            >
                                              <ChevronDown className="h-4 w-4" />
                                              <span className="sr-only">
                                                Change status
                                              </span>
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            {ITEM_STATUS_OPTIONS.map(
                                              (option) => (
                                                <DropdownMenuItem
                                                  key={option.value}
                                                  onClick={() =>
                                                    onItemStatusChange(
                                                      order.id,
                                                      item.id,
                                                      option.value,
                                                    )
                                                  }
                                                >
                                                  <span>{option.label}</span>
                                                  {item.status ===
                                                    option.value && (
                                                      <Check className="ml-2 h-4 w-4" />
                                                    )}
                                                </DropdownMenuItem>
                                              ),
                                            )}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            onEditItem(order, item)
                                          }
                                        >
                                          <Edit className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            onDeleteItem(order.id, item.id)
                                          }
                                        >
                                          <Trash className="h-4 w-4" />
                                          <span className="sr-only">
                                            Delete
                                          </span>
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="space-y-4 md:hidden">
        {orders.map((order) => {
          const orderStatus = getOrderStatus(order);

          return (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{order.id}</CardTitle>
                    <Badge className={getOrderStatusColor(orderStatus)}>
                      {orderStatus}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() =>
                            onOrderStatusChange(order.id, option.value)
                          }
                        >
                          <span>Mark as {option.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Table:</span>
                    <span className="font-medium">{order.tableName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium">
                      {order.orderItems.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">
                      ${calculateOrderTotal(order.orderItems).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  {expandedOrders[order.id] ? "Hide Details" : "View Details"}
                </Button>

                {expandedOrders[order.id] && (
                  <div className="mt-4 space-y-3">
                    <Separator />
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {item.menuDetails.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <span>{item.quantity}x</span>
                              <span>${item.menuDetails.sale.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Item actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onEditItem(order, item)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                {ITEM_STATUS_OPTIONS.map((option) => (
                                  <DropdownMenuItem
                                    key={option.value}
                                    onClick={() =>
                                      onItemStatusChange(
                                        order.id,
                                        item.id,
                                        option.value,
                                      )
                                    }
                                  >
                                    Mark as {option.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    onDeleteItem(order.id, item.id)
                                  }
                                >
                                  Remove Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <Select
                      defaultValue={orderStatus as string}
                      onValueChange={(value) =>
                        onOrderStatusChange(
                          order.id,
                          value as ORDER_STATUS_VALUE,
                        )
                      }
                    >
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <Button size="sm" variant="outline"> */}
                  {/*   Mark All Served */}
                  {/* </Button> */}
                </div>
              </CardFooter>
            </Card>
          );
        })}
        {orders.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
