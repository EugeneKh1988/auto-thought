import { ISituation } from "@/utils/interfaces";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FilePenLine, NotebookText, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useSituationStore } from "@/store/situationStore";

interface SituationItemProps {
    item: ISituation,
    className?: string,
}


const SituationItem: React.FC<SituationItemProps> = ({ className, item }) => {
  const classNameValue = className ? `${className}` : "";

  // store values
  const setMode = useSituationStore((state) => state.setMode);
  const setCurrentSituation = useSituationStore((state) => state.setSituation);

  const onEdit = () => {
    setCurrentSituation(item);
    // open
    setMode('edit');
  }

  const onDelete = () => {
    setCurrentSituation(item);
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
        <CardDescription>{item.description}</CardDescription>
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

export default SituationItem;