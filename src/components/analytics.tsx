import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

export interface AnalyticsData {
  taskCount: number;
  taskDifference: number;
  incompleteTaskCount?: number;
  incompleteTaskDifference?: number;
  completedTaskCount: number;
  completedTaskDifference: number;
  assignedTaskCount: number;
  assignedTaskDifference: number;
  overdueTaskCount: number;
  overdueTaskDifference: number;
  projectCount?: number;
  projectDifference?: number;
}

export interface AnalyticsProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

const formatDifference = (value: number | undefined) => {
  if (value === undefined) return "";
  return value > 0 ? `+${value}` : `${value}`;
};

const getTrendColor = (value: number | undefined) => {
  if (value === undefined || value === 0) {
    return "text-muted-foreground";
  }

  return value > 0 ? "text-emerald-600" : "text-red-600";
};

const analyticsItems = (data: AnalyticsData) => [
  ...(data.projectCount !== undefined
    ? [
        {
          title: "Total Projects",
          value: data.projectCount,
          difference: data.projectDifference,
        },
      ]
    : []),
  {
    title: "Total Tasks",
    value: data.taskCount,
    difference: data.taskDifference,
  },
  {
    title: "Assigned Tasks",
    value: data.assignedTaskCount,
    difference: data.assignedTaskDifference,
  },
  {
    title: "Completed Tasks",
    value: data.completedTaskCount,
    difference: data.completedTaskDifference,
  },
  {
    title: "Incomplete Tasks",
    value: data.incompleteTaskCount,
    difference: data.incompleteTaskDifference,
  },
  {
    title: "Overdue Tasks",
    value: data.overdueTaskCount,
    difference: data.overdueTaskDifference,
  },
];

export const Analytics = ({ data, isLoading }: AnalyticsProps) => {
  if (isLoading) {
    return (
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max gap-4 pb-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="w-55 shrink-0">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max gap-4 pb-4">
        {analyticsItems(data).map((item) => (
          <Card key={item.title} className="w-55 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className={`text-xs flex items-center gap-1 ${getTrendColor(item.difference)}`}>
                {item.difference !== undefined && item.difference > 0 && <FaCaretUp className="size-3" />}
                {item.difference !== undefined && item.difference < 0 && <FaCaretDown className="size-3" />}
                {formatDifference(item.difference)} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
