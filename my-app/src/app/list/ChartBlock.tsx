'use client';

import { ChartContainer } from '@/app/list/ChartContainer';
import { CostTable } from '@/app/list/CostTable';
import { Filter } from '@/app/list/Filter';
import { Loading } from '@/components/icons/Loading';
import { useGroupCtx } from '@/context/GroupProvider';
import { useGetSpendingCtx } from '@/context/SpendingProvider';
import { useUserConfigCtx } from '@/context/UserConfigProvider';
import { useMounted } from '@/hooks/useMounted';
import { calSpending2Chart } from '@/utils/calSpending2Chart';
import { normalizeNumber } from '@/utils/normalizeNumber';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Label,
  LabelList,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
} from 'recharts';

const renderCustomizedLabelForPieCell = (props: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  value: number;
}) => {
  const { cx, cy, midAngle, outerRadius, name } = props;
  const x = cx + outerRadius * 1.25 * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + outerRadius * 1.35 * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="rounded-md bg-background p-1 text-xs"
    >
      {name}
    </text>
  );
};

const renderCustomizedLabelForBar = (props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
  const percent = Number(value).toFixed(0);
  if (Number(percent) < 25) return null;
  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={Number(y) + Number(height) / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {percent}%
    </text>
  );
};

export const ChartBlock = () => {
  const { config: userData } = useUserConfigCtx();
  const { data, syncData } = useGetSpendingCtx();
  const { groups, loading: loadingGroups } = useGroupCtx();
  const isMounted = useMounted();
  const [chartData, setChartData] = useState<PieChartData>({
    income: {
      list: [],
      total: 0,
      necessary: 0,
      unnecessary: 0,
    },
    outcome: {
      list: [],
      total: 0,
      necessary: 0,
      unnecessary: 0,
    },
  });
  const [detailData, setDetailData] = useState<PieChartDataItem[]>([]);
  const today = new Date();
  const [year, setYear] = useState(`${today.getFullYear()}`);
  const [month, setMonth] = useState(`${today.getMonth() + 1}`);
  const [groupId, setGroupId] = useState<string>('');

  const totalIncomePercentage = useMemo(() => {
    if (chartData.income.total === 0) return 0;
    return (
      (chartData.income.total * 100) /
      (chartData.income.total + chartData.outcome.total)
    );
  }, [chartData.income.total, chartData.outcome.total]);

  const totalOutcomePercentage = useMemo(() => {
    if (chartData.outcome.total === 0) return 0;
    return (
      (chartData.outcome.total * 100) /
      (chartData.income.total + chartData.outcome.total)
    );
  }, [chartData.income.total, chartData.outcome.total]);

  const totalOutcomeNecessaryPercentage = useMemo(() => {
    if (chartData.outcome.necessary === 0) return 0;
    return (
      (chartData.outcome.necessary * 100) /
      (chartData.outcome.necessary + chartData.outcome.unnecessary)
    );
  }, [chartData.outcome.necessary, chartData.outcome.unnecessary]);

  const totalOutcomeUnnecessaryPercentage = useMemo(() => {
    if (chartData.outcome.unnecessary === 0) return 0;
    return (
      (chartData.outcome.unnecessary * 100) /
      (chartData.outcome.necessary + chartData.outcome.unnecessary)
    );
  }, [chartData.outcome.necessary, chartData.outcome.unnecessary]);

  const refreshData = useCallback(
    (_groupId: string) => {
      syncData(
        _groupId || undefined,
        userData?.email,
        new Date(Number(year), Number(month) - 1).toUTCString(),
      );
    },
    [month, syncData, userData?.email, year],
  );

  const group = useMemo(
    () => groups.find((group) => group.id === groupId),
    [groups, groupId],
  );

  const filteredData = useMemo(
    () =>
      data.filter(
        (record) =>
          `${new Date(record.date).getFullYear()}` === year &&
          `${new Date(record.date).getMonth() + 1}` === month &&
          record.groupId === (groupId || undefined),
      ),
    [data, year, month, groupId],
  );

  const isNoData = useMemo(
    () => data.length > 0 && filteredData.length === 0,
    [data.length, filteredData.length],
  );

  const formattedData = useMemo(
    () => calSpending2Chart(filteredData),
    [filteredData],
  );

  useEffect(() => {
    if (formattedData.income.total > 0 || formattedData.outcome.total > 0) {
      startTransition(() => {
        setChartData(formattedData);
        setDetailData([
          ...formattedData.outcome.list,
          ...formattedData.income.list,
        ]);
      });
    }
  }, [formattedData]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Filter
        refreshData={refreshData}
        groupOptions={{
          setGroupId,
          loadingGroups,
          groups,
          group,
        }}
        dateOptions={{
          today,
          year,
          setYear,
          month,
          setMonth,
        }}
      />

      {isNoData && <div>無資料</div>}
      {!isNoData && (
        <>
          <ChartContainer title="收支比例與各項占比">
            <ul className="w-full list-disc pl-6">
              <li>
                【總收入】
                {totalIncomePercentage.toFixed(2)}%
              </li>
              <li>
                【總支出】
                {totalOutcomePercentage.toFixed(2)}%
              </li>
            </ul>
            {isMounted ? (
              <PieChart width={300} height={250}>
                <Pie
                  data={[
                    { name: '支出', value: chartData.outcome.total },
                    { name: '收入', value: chartData.income.total },
                  ]}
                  dataKey="value"
                  label={renderCustomizedLabelForPieCell}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={90}
                >
                  <Cell
                    className="transition-colors hover:fill-yellow-300 hover:outline-0 active:outline-0"
                    fill="#faa5a5"
                  />
                  <Cell
                    className="transition-colors hover:fill-yellow-300 hover:outline-0 active:outline-0"
                    fill="#82ca9d"
                  />
                </Pie>

                <Pie
                  data={detailData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                >
                  {detailData.map((entry, index) => (
                    <Cell
                      className="transition-colors hover:fill-yellow-300 hover:outline-0 active:outline-0"
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                  <Label
                    value={`盈餘 $${normalizeNumber(chartData.income.total - chartData.outcome.total)}`}
                    offset={0}
                    position="center"
                    className="text-sm font-bold"
                  />
                </Pie>

                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex h-[250px] w-full items-center justify-center">
                <Loading className="size-10 animate-spin py-1 text-gray-500" />
              </div>
            )}

            <CostTable
              title={`支出各項資訊 $${normalizeNumber(chartData.outcome.total)}`}
              total={chartData.outcome.total}
              list={chartData.outcome.list}
            />
            <CostTable
              title={`收入各項資訊 $${normalizeNumber(chartData.income.total)}`}
              total={chartData.income.total}
              list={chartData.income.list}
            />
          </ChartContainer>

          <ChartContainer title="各項開銷之必要與非必要占比">
            <ul className="w-full list-disc pl-6">
              <li>
                【總必要開銷】
                {totalOutcomeNecessaryPercentage.toFixed(2)}%
              </li>
              <li>
                【總額外開銷】
                {totalOutcomeUnnecessaryPercentage.toFixed(2)}%
              </li>
            </ul>
            {isMounted ? (
              <BarChart
                width={300}
                height={250}
                data={chartData.outcome.list.map((item) => ({
                  ...item,
                  necessaryPercentage: (item.necessary / item.value) * 100,
                  unnecessaryPercentage: (item.unnecessary / item.value) * 100,
                }))}
                margin={{
                  top: 24,
                }}
              >
                <XAxis dataKey="name" />
                <Legend
                  align="right"
                  verticalAlign="bottom"
                  payload={[
                    { value: '必要開銷', type: 'rect', color: '#8884d8' },
                    { value: '額外開銷', type: 'rect', color: '#82ca9d' },
                  ]}
                />
                <Bar dataKey="necessaryPercentage" stackId="a" fill="#8884d8">
                  <LabelList
                    dataKey="necessaryPercentage"
                    content={renderCustomizedLabelForBar}
                  />
                </Bar>
                <Bar dataKey="unnecessaryPercentage" stackId="a" fill="#82ca9d">
                  <LabelList
                    dataKey="unnecessaryPercentage"
                    content={renderCustomizedLabelForBar}
                  />
                </Bar>
              </BarChart>
            ) : (
              <div className="flex h-[250px] w-full items-center justify-center">
                <Loading className="size-10 animate-spin py-1 text-gray-500" />
              </div>
            )}
          </ChartContainer>
        </>
      )}
    </div>
  );
};
