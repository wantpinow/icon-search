import { format, formatDistance, subDays } from "date-fns";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Icon } from "~/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { NewKeyDialog } from "./new-key-dialog";
import { getUserApiKeysAction } from "~/server/actions/keys/crud";
import { RevokeKeyDialog } from "./revoke-key-dialog";

export async function ApiKeysCard() {
  const apiKeys = (await getUserApiKeysAction())?.data ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active API keys</CardTitle>
        <CardDescription>
          Requests made using these keys will count against your monthly quota.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TooltipProvider>
              {apiKeys.map((key) => (
                <TableRow key={key.name}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>{format(key.createdAt, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {key.lastUsed
                      ? formatDistance(key.lastUsed, new Date(), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <RevokeKeyDialog id={key.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Icon name="Trash" className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                      </RevokeKeyDialog>
                      <TooltipContent side="left">Revoke</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TooltipProvider>
            {apiKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <p className="py-4 text-sm text-muted-foreground">
                    No API keys found
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <NewKeyDialog>
          <Button className="ml-auto block">New Key</Button>
        </NewKeyDialog>
      </CardContent>
    </Card>
  );
}
