"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { suggestIconsAction } from "~/server/actions/icons/suggest";
import { suggestIconsSchema } from "~/server/actions/icons/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import type { LucideIconName } from "~/components/ui/icon";

export function SuggestIconsForm({
  versions,
  setIcons,
  setLoading,
}: {
  versions: string[];
  setIcons: (icons: LucideIconName[] | null) => void;
  setLoading: (loading: boolean) => void;
}) {
  const form = useForm<z.infer<typeof suggestIconsSchema>>({
    resolver: zodResolver(suggestIconsSchema),
    defaultValues: {
      type: "lucide-react",
      version: versions[0],
      query: "",
      limit: 9,
      advanced: true,
    },
  });

  const { execute, isExecuting } = useAction(suggestIconsAction, {
    onExecute: () => {
      setIcons(null);
      setLoading(true);
    },
    onSuccess: (res) => {
      setIcons(res.data as LucideIconName[]);
    },
    onSettled: () => {
      setLoading(false);
    },
    onError: (e) => {
      toast.error(e.error.serverError);
    },
  });

  async function onSubmit(values: z.infer<typeof suggestIconsSchema>) {
    execute({
      type: values.type,
      version: values.version,
      query: values.query,
      limit: values.limit,
      advanced: values.advanced,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="grow">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Search for icons..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem className="flex-none">
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {versions.map((v, i) => (
                        <SelectItem key={i} value={v}>
                          {i === 0 ? `Latest (${v})` : v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="advanced"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      id="advanced-search"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Label htmlFor="advanced-search" className="font-normal">
              Advanced Search
            </Label>
          </div>
          <Button
            loading={isExecuting}
            type="submit"
            className="w-full md:w-auto"
            loadingMessage="Searching..."
          >
            Search
          </Button>
        </div>
      </form>
    </Form>
  );
}
