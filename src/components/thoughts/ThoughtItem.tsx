import { IThought } from "@/utils/interfaces";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePenLine, NotebookText, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useThoughtStore } from "@/store/thoughtStore";

interface ThoughtItemProps {
    item: IThought,
    className?: string,
}


const ThoughtItem: React.FC<ThoughtItemProps> = ({ className, item }) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const setMode = useThoughtStore((state) => state.setMode);
  const setCurrentThought = useThoughtStore((state) => state.setThought);

  const onEdit = () => {
    setCurrentThought(item);
    // open
    setMode('edit');
  }

  const onDelete = () => {
    setCurrentThought(item);
    // open
    setMode('delete');
  }

  const dateFormat = (strDate: string): string => {
    const millisec = Date.parse(strDate);
    const date = new Date(millisec);
    const month = date.getMonth() + 1 < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const hours = date.getHours() < 9 ? `0${date.getHours()}` : `${date.getHours()}`;
    const minutes = date.getMinutes() < 9 ? `0${date.getMinutes()}`: `${date.getMinutes()}`;
    return `${date.getDate()}.${month}.${date.getFullYear()} ${hours}:${minutes}`;
  };

  return (
    <Card className={`sm:max-w-sm ${classNameValue}`}>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>Вера в убеждение: {item.strength}%</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[12px]">
          Дата создания: <span>{dateFormat(item.created_at)}</span>
        </p>
        <p className="text-[12px]">
          Дата изменения: <span>{dateFormat(item.updated_at)}</span>
        </p>
      </CardContent>
      <CardFooter className="gap-1.5 flex-wrap lg:flex-nowrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-lg" className="cursor-pointer">
              <NotebookText />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Открыть</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-lg" className="cursor-pointer" onClick={() => onEdit() }>
              <FilePenLine />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Редактировать</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-lg" className="cursor-pointer" onClick={() => onDelete()}>
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Удалить</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};;

export default ThoughtItem;