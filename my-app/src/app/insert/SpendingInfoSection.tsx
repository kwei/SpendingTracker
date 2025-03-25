'use client';

import { OverView } from '@/app/insert/OverView';
import { SpendingList } from '@/app/insert/SpendingList';
import { DatePicker } from '@/components/DatePicker';
import { GroupSelector } from '@/composites/GroupSelector';
import { useGetSpendingCtx } from '@/context/SpendingProvider';
import { useUserConfigCtx } from '@/context/UserConfigProvider';
import { useDate } from '@/hooks/useDate';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { DateFilter, Necessity } from '@/utils/constants';
import { getExpenseFromData } from '@/utils/getExpenseFromData';
import dynamic from 'next/dynamic';
import {
  ChangeEvent,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react';

const AddExpenseBtn = dynamic(() => import('@/app/insert/AddExpenseBtn'));

export const SpendingInfoSection = ({
  quickInsert,
}: {
  quickInsert?: string;
}) => {
  useScrollToTop();
  const { config: userData } = useUserConfigCtx();
  const { syncData, data } = useGetSpendingCtx();
  const [isProcessing, setIsProcessing] = useState(true);
  const [date, setDate] = useDate(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>();
  const [filter, setFilter] = useState(DateFilter.Day);
  const [filteredData, setFilteredData] = useState<SpendingRecord[]>([]);
  const [totalIncome, setTotalIncome] = useState(100);
  const [totalOutcome, setTotalOutcome] = useState(0);
  const [necessaryOutcome, setNecessaryOutcome] = useState(0);

  const handleOnChangeDate = useCallback(
    (event: ChangeEvent) => {
      const newDate = new Date((event.target as HTMLInputElement).value);
      setDate((prevDate) => {
        if (
          prevDate.getFullYear() !== newDate.getFullYear() ||
          prevDate.getMonth() !== newDate.getMonth()
        ) {
          syncData(
            selectedGroup || undefined,
            userData?.email,
            newDate.toUTCString(),
          );
        }
        return newDate;
      });
    },
    [selectedGroup, setDate, syncData, userData?.email],
  );

  const refreshData = useCallback(
    (_groupId?: string) => {
      syncData(_groupId || undefined, userData?.email, date.toUTCString());
    },
    [syncData, userData?.email, date],
  );

  useEffect(() => {
    startTransition(() => {
      setIsProcessing(true);
      const dataFilterByUser = [...data].filter((_data) =>
        checkUser(_data, selectedMemberEmail),
      );
      const { totalIncome: _totalIncome, totalOutcome: _totalOutcome } =
        getExpenseFromData(dataFilterByUser);
      setTotalIncome(_totalIncome);
      setTotalOutcome(_totalOutcome);
      const dataFilterByNecessary = dataFilterByUser.filter((_data) => {
        return _data.necessity === Necessity.Need;
      });
      setNecessaryOutcome(
        getExpenseFromData(dataFilterByNecessary).totalOutcome,
      );

      const dataFilterByDate = dataFilterByUser.filter((_data) =>
        checkDate(_data.date, date, filter),
      );
      setFilteredData(dataFilterByDate);
      setIsProcessing(false);
    });
  }, [data, date, selectedMemberEmail, filter]);

  useEffect(() => {
    if (!selectedGroup && userData?.email) {
      setSelectedMemberEmail(userData.email);
    }
  }, [selectedGroup, userData?.email]);

  return (
    <div className="relative mx-auto flex w-full max-w-175 flex-1 flex-col items-center p-6">
      <div className="mb-5 flex w-full justify-end">
        <div className="w-fit">
          <GroupSelector
            selectedGroup={selectedGroup}
            selectedMemberEmail={selectedMemberEmail}
            onSelectGroup={(_groupId) => {
              setSelectedGroup(_groupId);
              refreshData(_groupId);
            }}
            onSelectMemberEmail={setSelectedMemberEmail}
          />
        </div>
      </div>
      <div className="mb-4 flex w-full items-center justify-center">
        <DatePicker
          date={date}
          labelClassName="p-4 text-lg sm:text-xl bg-background font-semibold"
          onChange={handleOnChangeDate}
        />
      </div>

      <OverView
        totalIncome={totalIncome}
        totalOutcome={totalOutcome}
        necessaryOutcome={necessaryOutcome}
        dateStr={date.toUTCString()}
      />

      <span className="my-5 w-full"></span>

      <div className="bg-background flex w-full flex-col rounded-3xl border border-solid border-gray-300 p-6 shadow">
        <div className="mb-6 flex items-center gap-4">
          <h3 className="text-lg font-bold">活動</h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilter(DateFilter.Day)}
              className={`rounded-md border border-solid border-gray-300 px-4 py-1 transition-colors ${filter === DateFilter.Day ? 'bg-gray-300' : 'bg-background active:bg-gray-100 sm:hover:bg-gray-100'}`}
            >
              日
            </button>
            <button
              type="button"
              onClick={() => setFilter(DateFilter.Month)}
              className={`rounded-md border border-solid border-gray-300 px-4 py-1 transition-colors ${filter === DateFilter.Month ? 'bg-gray-300' : 'bg-background active:bg-gray-100 sm:hover:bg-gray-100'}`}
            >
              月
            </button>
          </div>
        </div>
        <SpendingList
          data={filteredData}
          loading={isProcessing}
          refreshData={refreshData}
        />
      </div>

      <AddExpenseBtn autoClick={!!quickInsert}>
        <span className="text-base font-bold">記帳</span>
      </AddExpenseBtn>
    </div>
  );
};

function checkUser(_data: SpendingRecord, email?: string) {
  return email === '' || _data['user-token'] === email;
}

function checkDate(dateStr: string, _date: Date, _filter: DateFilter) {
  const dataDate = new Date(dateStr);
  if (_filter === DateFilter.Month) {
    return (
      dataDate.getFullYear() === _date.getFullYear() &&
      dataDate.getMonth() === _date.getMonth()
    );
  }
  return (
    dataDate.getFullYear() === _date.getFullYear() &&
    dataDate.getMonth() === _date.getMonth() &&
    dataDate.getDate() === _date.getDate()
  );
}
