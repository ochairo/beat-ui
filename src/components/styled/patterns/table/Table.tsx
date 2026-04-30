import { component } from "@ochairo/beat";

import {
  Table as HeadlessTable,
  type BeatUiTableSort,
  type BeatUiTableSortDirection,
  type TableColumn,
  type TableProps,
  type TableRow,
} from "../../../headless/patterns/Table";
import css from "./Table.module.css";

export type {
  BeatUiTableSort,
  BeatUiTableSortDirection,
  TableColumn,
  TableProps,
  TableRow,
};

export const Table = component<TableProps>((props) => {
  return (
    <HeadlessTable
      {...props}
      class={css["root"]!}
      {...(props.onRowClick !== undefined
        ? { styles: { row: "cursor:pointer" } }
        : {})}
    />
  );
});
