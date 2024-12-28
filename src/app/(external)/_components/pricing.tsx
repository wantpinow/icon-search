import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Icon } from "~/components/ui/icon";

export default function PricingSection() {
  return (
    <section className="px-4 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Simple Pricing</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Start for free, upgrade when you need more. Self-host if you&apos;re
            a masochist.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for small projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>250 requests per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login/github">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Managed API</CardTitle>
              <CardDescription>For growing applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">$1</span>
                <span className="text-muted-foreground">/1000 requests</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>Unlimited requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>Less bullshit</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="default">
                <Link href="/login/github">Upgrade Now</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Do it yourself</CardTitle>
              <CardDescription>
                <span className="font-semibold">Everything</span> is open source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">Self-hosted</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>Deploy it yourself</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                  <span>Customize to your needs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="X" className="h-4 w-4 text-primary" />
                  <span>More bullshit</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link
                  href="https://github.com/wantpinow/icon-search"
                  target="_blank"
                >
                  Get Started
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
