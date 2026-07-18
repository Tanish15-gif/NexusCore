import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

type DropdownAppearance = "auto" | "dark";

interface SelectDropdownProps {
  id?: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  appearance?: DropdownAppearance;
  onChange: (value: string) => void;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

export default function SelectDropdown({
  id,
  value,
  options,
  placeholder = "Select an option",
  disabled = false,
  appearance = "auto",
  onChange,
}: SelectDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 280,
  });

  const selectedOption = options.find((option) => option.value === value);

  const isForcedDark = appearance === "dark";

  const calculatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 16;
    const gap = 8;

    const preferredHeight = Math.min(options.length * 70 + 16, 300);

    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;

    const spaceAbove = rect.top - viewportPadding;

    const openAbove = spaceBelow < preferredHeight && spaceAbove > spaceBelow;

    const availableHeight = openAbove ? spaceAbove - gap : spaceBelow - gap;

    const dropdownHeight = Math.max(
      150,
      Math.min(preferredHeight, availableHeight),
    );

    setPosition({
      top: openAbove
        ? Math.max(viewportPadding, rect.top - dropdownHeight - gap)
        : rect.bottom + gap,
      left: Math.max(
        viewportPadding,
        Math.min(rect.left, window.innerWidth - rect.width - viewportPadding),
      ),
      width: rect.width,
      maxHeight: dropdownHeight,
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectedIndex = options.findIndex((option) => option.value === value);

    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const updatePosition = () => {
      calculatePosition();
    };

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    window.addEventListener("resize", updatePosition);

    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("resize", updatePosition);

      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, options, value]);

  const selectOption = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen && highlightedIndex >= 0) {
        selectOption(options[highlightedIndex]);
      } else {
        setIsOpen(true);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      setHighlightedIndex((current) =>
        Math.min(current + 1, options.length - 1),
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      setHighlightedIndex((current) => Math.max(current - 1, 0));
    }
  };

  const triggerClasses = isForcedDark
    ? ["border-white/10 bg-[#111a2b]", "text-white hover:border-indigo-400/50"]
    : [
        "border-slate-300 bg-white text-slate-950",
        "hover:border-indigo-400",
        "dark:border-white/10 dark:bg-[#111a2b] dark:text-white",
      ];

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={[
          "flex min-h-12 w-full items-center justify-between gap-4",
          "rounded-xl border px-4 text-left outline-none transition",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen
            ? "border-indigo-400 ring-4 ring-indigo-500/10"
            : triggerClasses.join(" "),
        ].join(" ")}
      >
        <span className="min-w-0">
          <span
            className={[
              "block truncate text-sm",
              selectedOption
                ? isForcedDark
                  ? "font-bold text-white"
                  : "font-bold text-slate-950 dark:text-white"
                : isForcedDark
                  ? "text-slate-500"
                  : "text-slate-400 dark:text-slate-500",
            ].join(" ")}
          >
            {selectedOption?.label ?? placeholder}
          </span>

          {selectedOption?.description && (
            <span
              className={[
                "mt-0.5 block truncate text-xs",
                isForcedDark
                  ? "text-slate-400"
                  : "text-slate-500 dark:text-slate-400",
              ].join(" ")}
            >
              {selectedOption.description}
            </span>
          )}
        </span>

        <ChevronDown
          size={18}
          className={[
            "shrink-0 text-slate-400 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className={[
              "nexus-scrollbar z-[200] overflow-y-auto rounded-2xl border p-2",
              "shadow-[0_22px_70px_rgba(0,0,0,0.45)]",
              isForcedDark
                ? "border-white/10 bg-[#111a2b]"
                : "border-slate-200 bg-white dark:border-white/10 dark:bg-[#111a2b]",
            ].join(" ")}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              const isHighlighted = highlightedIndex === index;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={[
                    "flex w-full items-center justify-between gap-4",
                    "rounded-xl px-4 py-3 text-left transition",
                    isHighlighted
                      ? isForcedDark
                        ? "bg-indigo-500/15"
                        : "bg-indigo-50 dark:bg-indigo-500/15"
                      : isForcedDark
                        ? "hover:bg-white/[0.05]"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <span className="min-w-0">
                    <span
                      className={[
                        "block truncate text-sm font-bold",
                        isSelected
                          ? "text-indigo-400"
                          : isForcedDark
                            ? "text-slate-100"
                            : "text-slate-800 dark:text-slate-100",
                      ].join(" ")}
                    >
                      {option.label}
                    </span>

                    {option.description && (
                      <span
                        className={[
                          "mt-1 block text-xs leading-5",
                          isForcedDark
                            ? "text-slate-400"
                            : "text-slate-500 dark:text-slate-400",
                        ].join(" ")}
                      >
                        {option.description}
                      </span>
                    )}
                  </span>

                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      isSelected
                        ? "bg-indigo-500 text-white"
                        : "text-transparent",
                    ].join(" ")}
                  >
                    <Check size={15} />
                  </span>
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
