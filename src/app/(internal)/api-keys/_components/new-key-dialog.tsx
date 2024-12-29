"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createApiKeySchema } from "~/server/actions/keys/schemas";
import { useAction } from "next-safe-action/hooks";
import { createApiKeyAction } from "~/server/actions/keys/crud";
import { toast } from "sonner";
import { Icon } from "~/components/ui/icon";
import useClipboard from "react-use-clipboard";

export function NewKeyDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const form = useForm<z.infer<typeof createApiKeySchema>>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
    },
  });

  const { execute, isPending } = useAction(createApiKeyAction, {
    onError: (e) => {
      toast.error(e.error.serverError);
    },
    onSuccess: ({ data }) => {
      if (!data) {
        toast.error("Failed to create API key");
        return;
      }
      setApiKey(data.key);
      toast.success("API key created");
    },
  });

  async function onSubmit(values: z.infer<typeof createApiKeySchema>) {
    execute({
      name: values.name,
    });
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setApiKey(null);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {apiKey ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy the API key below and store it securely. This is the only
              time you will be able to see it.
            </DialogDescription>
          </DialogHeader>
          <NewKeyCopyButton apiKey={apiKey} />

          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key to use in your applications.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Development API Key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                loading={isPending}
              >
                Create Key
              </Button>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}

const NewKeyCopyButton = ({ apiKey }: { apiKey: string }) => {
  const [, setCopied] = useClipboard(apiKey, {
    successDuration: 2000,
  });

  const handleClick = () => {
    setCopied();
    toast.success(`Copied to clipboard`);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleClick}>
      <Icon name="Copy" className="h-4 w-4" />
      <span>{apiKey}</span>
      <span className="sr-only">Copy</span>
    </Button>
  );
};
