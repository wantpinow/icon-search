"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import type { LucideIconName } from "~/components/ui/icon";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

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
      mode: "top-1",
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
      mode: values.mode,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-start justify-between gap-4">
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
                          {i === 0 && (
                            <span className="hidden md:inline">Latest (</span>
                          )}
                          <span>{v}</span>
                          {i === 0 && (
                            <span className="hidden md:inline">) </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="my-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="semantic" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Semantic Search
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="top-1" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Top-1 Reranking
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="top-k" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Top-K Reranking
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
