import { ExerciseAssetImage } from "@/components/ExerciseAssetImage";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  subtitle: string;
  imageSrc: string;
  order: number;
  isDragging: boolean;
  onHandlePointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onHandlePointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onHandlePointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onHandlePointerCancel: () => void;
};

export function RoutineDayExerciseReorderRow({
  title,
  subtitle,
  imageSrc,
  order,
  isDragging,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onHandlePointerCancel,
}: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-[3rem_minmax(0,1fr)_2.5rem_2.5rem] items-center gap-x-2 rounded-[1.15rem] border border-border/45 bg-[rgb(var(--surface-2-soft)/0.28)] px-3 py-2.5 transition-all",
        isDragging ? "scale-[0.99] opacity-80" : undefined,
      )}
    >
      <ExerciseAssetImage
        src={imageSrc}
        alt={`${title} icon`}
        className="h-11 w-11 rounded-xl border border-border/35"
        imageClassName="object-cover object-center"
        sizes="44px"
      />

      <div className="min-w-0 space-y-0.5">
        <p className="whitespace-normal break-words text-sm font-semibold leading-snug text-text">{title}</p>
        <p className="whitespace-normal text-xs leading-tight text-muted">{subtitle}</p>
      </div>

      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-400/12 text-[11px] font-semibold tabular-nums text-emerald-100">
        {order}
      </span>

      <button
        type="button"
        aria-label={`Reorder ${title}`}
        title="Drag to reorder"
        className="inline-flex h-9 w-9 touch-none items-center justify-center rounded-full border border-border/45 bg-[rgb(var(--bg)/0.3)] text-muted hover:bg-[rgb(var(--bg)/0.46)]"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerCancel}
      >
        ⋮⋮
      </button>
    </div>
  );
}
