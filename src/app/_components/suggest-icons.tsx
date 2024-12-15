"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { suggestIconsAction } from "~/server/actions/icons/suggest";
import { suggestIconsSchema } from "~/server/actions/icons/suggest-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export function SuggestIcons() {
  const form = useForm<z.infer<typeof suggestIconsSchema>>({
    resolver: zodResolver(suggestIconsSchema),
    defaultValues: {
      type: "lucide",
      version: undefined,
      query: "",
      limit: 5,
    },
  });

  const { execute, isExecuting, result } = useAction(suggestIconsAction, {
    onSuccess: (res) => {
      toast.success(`Found ${res.data?.length} icons`);
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
    });
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Query</FormLabel>
                <FormControl>
                  <Input placeholder="A happy face" {...field} />
                </FormControl>
                <FormDescription>
                  Search for icons by name or description.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button loading={isExecuting} type="submit">
            Submit
          </Button>
        </form>
      </Form>
      {result && <div>{result.data?.map((icon) => icon.name).join(", ")}</div>}
    </div>
  );
}
