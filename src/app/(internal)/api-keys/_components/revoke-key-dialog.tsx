"use client";

import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { revokeApiKeyAction } from "~/server/actions/keys/crud";

export function RevokeKeyDialog({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { execute, isPending } = useAction(revokeApiKeyAction, {
    onSuccess: () => {
      setIsOpen(false);
      toast.success("API key revoked");
    },
    onError: (error) => {
      toast.error(error.error.serverError);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke API Key</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this API key? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isPending}
            loading={isPending}
            className="w-full"
            variant="destructive"
            onClick={() => execute({ id })}
          >
            Revoke API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
