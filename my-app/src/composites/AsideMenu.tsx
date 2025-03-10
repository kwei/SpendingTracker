'use client';

import { CoinIcon } from '@/components/icons/CoinIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { ListIcon } from '@/components/icons/ListIcon';
import { PeopleIcon } from '@/components/icons/PeopleIcon';
import { SettingIcon } from '@/components/icons/SettingIcon';
import { WhereIcon } from '@/components/icons/WhereIcon';
import { Account } from '@/composites/Account';
import { useUserConfigCtx } from '@/context/UserConfigProvider';
import useFocusRef from '@/hooks/useFocusRef';
import { MENU_CONFIG } from '@/utils/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ReactNode,
  startTransition,
  useCallback,
  useEffect,
  useRef,
} from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AsideMenu = (props: Props) => {
  const { isOpen, onClose } = props;
  const { config: user } = useUserConfigCtx();
  const bgRef = useRef<HTMLDivElement>(null);
  const asideRef = useFocusRef<HTMLElement>(() => {
    onClose();
    close();
  });

  const close = useCallback(() => {
    startTransition(() => {
      if (!bgRef.current || !asideRef.current) return;
      bgRef.current.style.right = '100%';
      asideRef.current.style.left = '-288px';
    });
  }, [asideRef]);

  const open = useCallback(() => {
    startTransition(() => {
      if (!bgRef.current || !asideRef.current) return;
      bgRef.current.style.right = '0';
      asideRef.current.style.left = '0';
    });
  }, [asideRef]);

  useEffect(() => {
    if (isOpen) {
      open();
    } else {
      close();
    }
  }, [close, isOpen, open]);

  return (
    <>
      <div
        ref={bgRef}
        className="fixed bottom-0 left-0 right-full top-0 z-50 bg-black/50"
      ></div>
      <aside
        ref={asideRef}
        className="fixed -left-72 bottom-0 top-0 z-50 flex w-72 origin-right flex-col items-center justify-between bg-background py-4 shadow-xl transition-all"
      >
        <Account user={user} close={onClose} />
        <div className="flex w-full flex-1 flex-col items-center gap-2 px-4">
          {Object.keys(MENU_CONFIG).map((path) => (
            <MenuButton
              key={path}
              href={path}
              label={MENU_CONFIG[path]}
              onClick={onClose}
            />
          ))}
        </div>
        <div className="w-full border-t border-solid border-gray-300 px-4 py-2">
          <MenuButton
            href="/setting"
            onClick={onClose}
            label="設定"
            icon={<SettingIcon className="mr-3 size-4 sm:mr-4" />}
          />
        </div>
      </aside>
    </>
  );
};

const ROUTE_ICON: Record<string, ReactNode> = {
  '/': <HomeIcon className="mr-3 size-4 sm:mr-4" />,
  '/insert': <EditIcon className="mr-3 size-4 sm:mr-4" />,
  '/list': <ListIcon className="mr-3 size-4 sm:mr-4" />,
  '/budget': <CoinIcon className="mr-3 size-4 sm:mr-4" />,
  '/group': <PeopleIcon className="mr-3 size-4 sm:mr-4" />,
  '/choose': <WhereIcon className="mr-3 size-4 sm:mr-4" />,
};

const MenuButton = ({
  href,
  icon,
  label,
  onClick,
}: {
  href?: string;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) => {
  const pathName = usePathname();
  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`flex w-full items-center rounded-md px-5 py-3 text-left text-sm font-semibold transition-all sm:text-base ${pathName === href ? 'bg-primary-100' : 'active:bg-primary-100 sm:hover:bg-primary-100'}`}
      >
        {icon ?? ROUTE_ICON[href]}
        {label}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center rounded-md px-5 py-3 text-left text-sm font-semibold transition-all active:bg-primary-100 sm:text-base sm:hover:bg-primary-100"
    >
      {icon}
      {label}
    </button>
  );
};
