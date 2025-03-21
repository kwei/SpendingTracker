import { Select } from '@/components/Select';
import { useEffect } from 'react';

interface Props {
  refreshData: (
    groupId: string | undefined,
    year: string,
    month: string,
  ) => void;
  groupOptions: {
    setGroupId: (groupId: string) => void;
    loadingGroups: boolean;
    group?: Group;
    groups: Group[];
  };
  dateOptions: {
    today: Date;
    year: string;
    setYear: (year: string) => void;
    month: string;
    setMonth: (month: string) => void;
  };
}

export const Filter = (props: Props) => {
  const { refreshData, groupOptions, dateOptions } = props;
  const { setGroupId, loadingGroups, groups, group } = groupOptions;
  const { today, setYear, year, setMonth, month } = dateOptions;

  useEffect(() => {
    refreshData(group?.id, year, month);
  }, [group?.id, year, month, refreshData]);

  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex-1">
        <Select
          name="group"
          value={group?.name ?? '個人'}
          onChange={setGroupId}
          className="bg-background w-full rounded-full border border-solid border-gray-300 px-4 py-1 transition-colors active:border-gray-500 sm:hover:border-gray-500"
        >
          <Select.Item value="">個人</Select.Item>
          {!loadingGroups &&
            groups.map((group) => (
              <Select.Item key={group.id} value={group.id}>
                {group.name}
              </Select.Item>
            ))}
        </Select>
      </div>
      <div className="bg-background flex flex-1 items-center justify-center gap-2 rounded-full border border-solid border-gray-300 px-4 py-1">
        <div className="w-12">
          <Select name="year" value={year} onChange={setYear}>
            {Array(11)
              .fill(0)
              .map((_, i) => (
                <Select.Item
                  key={`${today.getFullYear() - 5 + i}`}
                  value={`${today.getFullYear() - 5 + i}`}
                >
                  {`${today.getFullYear() - 5 + i}`}
                </Select.Item>
              ))}
          </Select>
        </div>
        <span>年</span>
        <div className="w-10">
          <Select
            name="month"
            value={month}
            onChange={setMonth}
            className="w-full"
          >
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <Select.Item
                  key={(i + 1).toString()}
                  value={(i + 1).toString()}
                >
                  {i + 1}
                </Select.Item>
              ))}
          </Select>
        </div>
        <span>月</span>
      </div>
    </div>
  );
};
