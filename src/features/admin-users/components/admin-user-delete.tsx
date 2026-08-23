"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteAdminUser } from "@/features/admin-users/queries";

interface AdminUserDeleteProps {
  userId: string;
  userName: string;
}

export function AdminUserDelete({
  userId,
  userName,
}: AdminUserDeleteProps) {
  const router = useRouter();
  const deleteUser = useDeleteAdminUser(userId);

  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteUser.mutateAsync();

      setOpen(false);
      router.push("/admin/users");
    } catch {
      // Mutation state renders the backend error.
    }
  }

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Delete User</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Delete this user account</p>

            <p className="mt-1 text-sm text-muted-foreground">
              This will deactivate the account and mark it as deleted.
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={() => {
              deleteUser.reset();
              setOpen(true);
            }}
          >
            <Trash2 />
            Delete user
          </Button>
        </CardContent>
      </Card>

      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!deleteUser.isPending) {
            setOpen(nextOpen);

            if (!nextOpen) {
              deleteUser.reset();
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>

            <AlertDialogDescription>
              This will deactivate the account and mark it as deleted.{" "}
              {userName} will no longer be able to use the account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteUser.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteUser.error instanceof Error
                  ? deleteUser.error.message
                  : "Unable to delete user."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {deleteUser.isPending && (
                <Loader2 className="animate-spin" />
              )}

              {deleteUser.isPending
                ? "Deleting..."
                : "Confirm delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
