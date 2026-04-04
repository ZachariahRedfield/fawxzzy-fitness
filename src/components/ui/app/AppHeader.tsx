import type { ReactNode } from "react";
import { EyebrowText, TitleText } from "@/components/ui/text-roles";
import { cn } from "@/lib/cn";
import { headerTokens } from "@/components/ui/app/headerTokens";

export function AppHeader({
  eyebrow,
  title,
  subtitleLeft,
  subtitleRight,
  subtitle,
  meta,
  action,
  leading,
  trailing,
  className,
  actionClassName,
  titleClassName,
  titleAs = "h1",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitleLeft?: ReactNode;
  subtitleRight?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  actionClassName?: string;
  titleClassName?: string;
  titleAs?: "h1" | "h2" | "h3";
}) {
  const normalizeHeaderText = (value: ReactNode) => {
    if (typeof value !== "string") return value;
    return value.replace(/\s*[•·]\s*/g, "\u00A0•\u00A0");
  };

  const resolvedSubtitle = subtitle ?? subtitleLeft;
  const hasSubtitleRow = Boolean(resolvedSubtitle || subtitleRight);
  const hasMeta = Boolean(meta);
  const actionNode = action ?? leading;
  const shouldMergeSubtitleAndMeta = !subtitleRight && Boolean(resolvedSubtitle) && hasMeta;
  const normalizedSubtitle = normalizeHeaderText(resolvedSubtitle);
  const normalizedMeta = normalizeHeaderText(meta);

  return (
    <header className={cn(headerTokens.horizontalPadding, headerTokens.contentBottomGap, "space-y-0", className)}>
      <div className={cn("flex items-start justify-between", headerTokens.primaryRowGap)}>
        <div className="min-w-0 flex-1">
          {eyebrow ? <EyebrowText className="block text-left">{eyebrow}</EyebrowText> : null}
          <TitleText as={titleAs} className={cn("block text-left [text-wrap:balance]", headerTokens.titleClassName, titleClassName)}>{title}</TitleText>
          {hasSubtitleRow || hasMeta ? (
            <div className={cn(headerTokens.titleToSecondaryGap, headerTokens.secondaryBlockGap)}>
              {hasSubtitleRow ? (
                <div className={cn("flex min-w-0 gap-2", subtitleRight ? "items-start justify-between" : "items-center")}>
                  {shouldMergeSubtitleAndMeta ? (
                    <div className="min-w-0 text-left text-sm [text-wrap:pretty]">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className="min-w-0 text-[rgb(var(--text)/0.72)]">{normalizedSubtitle}</span>
                        <span className="text-[rgb(var(--text)/0.6)]">{normalizedMeta}</span>
                      </div>
                    </div>
                  ) : resolvedSubtitle ? (
                    <div className="min-w-0 text-left text-sm text-[rgb(var(--text)/0.72)] [text-wrap:pretty]">{normalizedSubtitle}</div>
                  ) : <span />}
                  {subtitleRight ? (
                    <div className="shrink-0 text-right text-sm text-[rgb(var(--text)/0.6)]">{subtitleRight}</div>
                  ) : null}
                </div>
              ) : null}
              {hasMeta && !shouldMergeSubtitleAndMeta ? (
                <div className="text-left text-sm text-[rgb(var(--text)/0.6)]">{normalizedMeta}</div>
              ) : null}
            </div>
          ) : null}
        </div>
        {(actionNode || trailing) ? (
          <div className={cn("shrink-0 flex items-center", headerTokens.actionRailGap, actionClassName)}>
            {actionNode ? <div>{actionNode}</div> : null}
            {trailing ? <div className={headerTokens.trailingSlot}>{trailing}</div> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
