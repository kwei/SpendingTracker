'use client';

import {
  ReactNode,
  startTransition,
  useCallback,
  useEffect,
  useRef,
} from 'react';

interface Props {
  option1: Option;
  option2: Option;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

type Option = {
  label: ReactNode;
  value: string;
  onSelectColor?: string;
  className?: string;
};

export const Switch = (props: Props) => {
  const { option1, option2, value, className = '', onChange } = props;

  const containerRef = useRef<HTMLButtonElement>(null);
  const option1Ref = useRef<HTMLSpanElement>(null);
  const option2Ref = useRef<HTMLSpanElement>(null);
  const floatingBlockRef = useRef<HTMLDivElement>(null);

  const handleOnClick = useCallback(() => {
    startTransition(() => {
      if (value === option1.value) onChange(option2.value);
      else onChange(option1.value);
    });
  }, [onChange, value, option1.value, option2.value]);

  useEffect(() => {
    const container = containerRef.current;
    const leftButton = option1Ref.current;
    const rightButton = option2Ref.current;
    const block = floatingBlockRef.current;

    requestAnimationFrame(() => {
      if (container && leftButton && rightButton && block) {
        const leftWidth = leftButton.offsetWidth;
        const rightWidth = rightButton.offsetWidth;
        const leftLeft = leftButton.offsetLeft;
        const rightLeft = rightButton.offsetLeft;

        if (value === option1.value) {
          block.style.left = `${leftLeft}px`;
          block.style.width = `${leftWidth}px`;
          if (option1.onSelectColor)
            leftButton.style.color = option1.onSelectColor;
          else leftButton.style.color = '#333333';
          rightButton.style.color = '#BBA8F0FF';
        } else {
          block.style.left = `${rightLeft}px`;
          block.style.width = `${rightWidth}px`;
          if (option2.onSelectColor)
            rightButton.style.color = option2.onSelectColor;
          else rightButton.style.color = '#333333';
          leftButton.style.color = '#BBA8F0FF';
        }
      }
    });
  }, [option1.onSelectColor, option1.value, option2.onSelectColor, value]);

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={handleOnClick}
      className={`relative flex w-fit items-center gap-1 rounded-md bg-primary-100 p-1 ${className}`}
    >
      <div
        ref={floatingBlockRef}
        className="transition-spring absolute bottom-1 top-1 z-10 rounded bg-background transition-all"
      ></div>
      <span
        ref={option1Ref}
        className={`z-20 flex-1 bg-transparent px-6 py-2 text-center font-semibold text-text transition-colors ${option1.className}`}
      >
        {option1.label}
      </span>
      <span
        ref={option2Ref}
        className={`z-20 flex-1 bg-transparent px-6 py-2 text-center font-semibold text-text transition-colors ${option2.className}`}
      >
        {option2.label}
      </span>
    </button>
  );
};
