'use client';

import { ActionMenu } from '@/components/ActionMenu';
import { DeleteIcon } from '@/components/icons/DeleteIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { useUserConfigCtx } from '@/context/UserConfigProvider';
import { OUTCOME_TYPE_MAP } from '@/utils/constants';
import { normalizeNumber } from '@/utils/normalizeNumber';
import dynamic from 'next/dynamic';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

const BudgetChartForCategory = dynamic(() => import('@/app/budget/BudgetChartForCategory'), {
  ssr: false,
});

export const YearlyBudgetTemplate = () => {
  const {
    loading,
    config: userData,
    setter: updateUser,
    syncUser,
  } = useUserConfigCtx();
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [allocation, setAllocation] = useState<Allocation[]>([]);

  useEffect(() => {
    if (userData) {
      if (userData.allocation) {
        setAllocation(userData.allocation);
      }
    }
  }, [userData]);

  useEffect(() => {
    setTotalBudget(
      allocation.map((item) => item.budget).reduce((a, b) => a + b, 0),
    );
  }, [allocation]);

  const handleUpdate = (item: Allocation) => {
    setAllocation((prevState) => {
      const newState = [...prevState];
      const index = newState.findIndex((d) => d.id === item.id);
      if (index !== -1) {
        newState[index] = item;
      }
      return updatePercentage(newState);
    });
  };

  const handleSaveChanges = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!userData) return;
      updateUser({
        ...userData,
        allocation: allocation,
      }).then(() => {
        syncUser();
      });
    },
    [allocation, syncUser, updateUser, userData],
  );

  const handleAddAllocation = () => {
    setAllocation((prevState) => {
      const newState = [...prevState];
      const newAllocation: Allocation = {
        id: newState.length + 1,
        name: '',
        budget: 0,
        percentage: 0,
      };
      newState.push(newAllocation);
      return newState;
    });
  };

  const handleRemoveAllocation = (id: number) => {
    setAllocation((prevState) => {
      const newState = [...prevState];
      const index = newState.findIndex((item) => item.id === id);
      if (index !== -1) {
        newState.splice(index, 1);
      }
      return updatePercentage(newState);
    });
  };

  return (
    <div className="flex w-full flex-col pt-10">
      <div className="relative flex w-full items-center pb-6 font-semibold">
        <span className="text-lg whitespace-nowrap">總預算：</span>
        <input
          type="text"
          className="flex-1 cursor-default px-2 py-1 text-2xl text-green-600 focus:outline-0"
          value={'$' + normalizeNumber(totalBudget)}
          readOnly={true}
        />
        <span className="absolute bottom-0 left-0 text-sm">
          (約 ${normalizeNumber(Number((totalBudget / 12).toFixed(0)))} / 月)
        </span>
      </div>
      <BudgetChartForCategory data={allocation} />
      <form
        onSubmit={handleSaveChanges}
        className="flex w-full flex-col gap-4 pt-6"
      >
        {loading && allocation.length === 0 && (
          <>
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
          </>
        )}
        {!loading &&
          allocation.map((item) => (
            <AllocationItem
              key={item.id}
              data={item}
              handleUpdate={handleUpdate}
              handleRemove={handleRemoveAllocation}
            />
          ))}
        <button
          type="button"
          onClick={handleAddAllocation}
          className="relative flex w-full items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-100 hover:text-gray-500"
        >
          <PlusIcon />
          <span className="whitespace-nowrap">新增項目</span>
        </button>
        <button
          type="submit"
          className="bg-primary-500 hover:bg-primary-600 text-background mt-6 w-30 self-center rounded-lg px-4 py-2 text-center transition-colors"
        >
          儲存變更
        </button>
      </form>
    </div>
  );
};

const AllocationItem = ({
  data,
  handleUpdate,
  handleRemove,
}: {
  data: Allocation;
  handleUpdate: (data: Allocation) => void;
  handleRemove: (id: number) => void;
}) => {
  const handleOnChangeBudget = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newData = { ...data };
      newData.budget = Number(event.target.value);
      handleUpdate(newData);
    },
    [data, handleUpdate],
  );

  const handleOnChangeName = useCallback(
    (_name: string) => {
      const newData = { ...data };
      newData.name = _name;
      handleUpdate(newData);
    },
    [data, handleUpdate],
  );

  const handleAction = useCallback(
    (action: string) => {
      if (action === 'delete') {
        handleRemove(data.id);
      }
    },
    [data.id, handleRemove],
  );

  return (
    <div className="relative flex w-full items-center rounded-lg border border-solid border-gray-100 bg-gray-100 p-4 pl-12 transition-colors hover:border-gray-200">
      <div className="absolute top-1 left-1 flex size-8 items-center justify-center">
        <span className="text-sm text-gray-300">{data.id}</span>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-between gap-6">
        <fieldset className="min-w-40 max-sm:w-full sm:flex-1">
          <legend className="text-sm">類別名稱</legend>
          <input
            list="names"
            className="bg-background focus:border-primary-500 w-full rounded-lg border border-solid border-gray-300 p-2 transition-colors"
            autoComplete="off"
            placeholder="例如：飲食"
            onChange={(e) => {
              handleOnChangeName(e.target.value);
            }}
            defaultValue={data.name}
          />
          <datalist id="names">
            {OUTCOME_TYPE_MAP.map((item) => (
              <option key={item.value} value={item.label}>
                {item.label}
              </option>
            ))}
          </datalist>
        </fieldset>
        <div className="flex items-center gap-2">
          <fieldset className="w-25">
            <legend className="text-sm">金額(NT$)</legend>
            <input
              type="number"
              className="bg-background focus:border-primary-500 w-full rounded-lg border border-solid border-gray-300 p-2 transition-colors focus:outline-0"
              defaultValue={data.budget}
              onChange={handleOnChangeBudget}
              placeholder="金額"
            />
          </fieldset>
          <fieldset className="w-25">
            <legend className="text-sm">百分比</legend>
            <input
              type="text"
              className="w-full cursor-default bg-transparent p-2 focus:outline-0"
              value={data.percentage.toFixed(0) + '%'}
              readOnly={true}
              placeholder="%"
            />
          </fieldset>
        </div>
      </div>

      <ActionMenu
        options={[
          {
            value: 'delete',
            label: (
              <div className="flex items-center gap-2">
                <DeleteIcon />
                <span>刪除</span>
              </div>
            ),
            className:
              'hover:text-background p-2 text-red-500 transition-colors hover:bg-red-500',
          },
        ]}
        onClick={handleAction}
      />
    </div>
  );
};

function updatePercentage(list: Allocation[]) {
  const total = list.map((item) => item.budget).reduce((a, b) => a + b, 0);
  return list.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.budget * 100) / total : 0,
  }));
}
