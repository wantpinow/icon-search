"use client";

import { Icon } from "~/components/ui/icon";
import type { LucideIconName } from "~/components/ui/icon";
import { SuggestIconsForm } from "./suggest-icons-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { icons as lucideIcons } from "lucide-react";
import { cn } from "~/lib/utils";

export function SuggestIcons({ versions }: { versions: string[] }) {
  const [icons, setIcons] = useState<LucideIconName[] | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <div className="mx-auto w-full md:max-w-xl">
      <div className="mb-8 rounded-lg bg-white/20 p-6 shadow-md backdrop-blur-lg">
        <SuggestIconsForm
          versions={versions}
          setIcons={setIcons}
          setLoading={setLoading}
        />
      </div>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center p-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-16 w-16 text-muted-foreground" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-xl font-normal text-muted-foreground"
            >
              Discovering Icons...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {icons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {icons[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-8 rounded-lg bg-accent p-6 text-center text-accent-foreground backdrop-blur-lg"
              >
                <h2 className="mb-4 text-2xl font-medium">Suggested Icon</h2>
                <div
                  className={cn(
                    !(icons[0] in lucideIcons) && "text-destructive",
                  )}
                >
                  <div className="inline-block">
                    <Icon name={icons[0]} className="mb-2 h-16 w-16" />
                  </div>
                  <p className="text-lg font-light">{icons[0]}</p>
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {icons.slice(1).map((iconName, index) => (
                <motion.div
                  key={iconName}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "flex flex-col items-center rounded-lg bg-white/20 p-4 backdrop-blur-lg transition-colors hover:bg-white/20",
                    !(iconName in lucideIcons) && "text-destructive",
                  )}
                >
                  <Icon name={iconName} className="mb-2 h-8 w-8" />
                  <span className="mt-1 text-center text-xs font-light">
                    {iconName}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {icons?.some((icon) => !(icon in lucideIcons)) && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Looks like you found deprecated icon(s). We can&apos;t render those
          here :(
        </div>
      )}
    </div>
  );
}
