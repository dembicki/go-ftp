import { Fragment } from "react";
import { useFTPStore } from "../lib/stores/ftpStore";
import ChevronRightIcon from "./icons/ChevronRightIcon";

export function Breadcrumb() {
  const { navigationHistory, goToFolder } = useFTPStore();

  const navigateTo = (path: string) => {
    goToFolder(path);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <span
        role="button"
        tabIndex={0}
        className="hover:text-blue-400 cursor-pointer"
        onClick={() => navigateTo("/")}
        onKeyDown={(e) => e.key === "Enter" && navigateTo("/")}
      >
        Home
      </span>
      {navigationHistory.map((segment, index) => (
        <Fragment key={index}>
          <ChevronRightIcon />
          <span
            role="button"
            tabIndex={0}
            className="hover:text-blue-400 cursor-pointer"
            onClick={() => navigateTo(segment)}
            onKeyDown={(e) => e.key === "Enter" && navigateTo(segment)}
          >
            {segment}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
