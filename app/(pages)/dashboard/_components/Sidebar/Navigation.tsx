import type { NavigationItem } from "../shared/types";

interface NavigationProps {
  navigation: NavigationItem[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Navigation = ({ navigation }: NavigationProps) => {
  return (
    <nav className="px-2 mt-5">
      <div className="space-y-1">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            aria-current={item.current ? "page" : undefined}
            className={classNames(
              item.current
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              "group flex items-center rounded-md px-2 py-2 text-base/5 font-medium"
            )}
          >
            <item.icon
              aria-hidden="true"
              className={classNames(
                item.current
                  ? "text-gray-500"
                  : "text-gray-400 group-hover:text-gray-500",
                "mr-3 size-6 shrink-0"
              )}
            />
            {item.name}
          </a>
        ))}
      </div>
    </nav>
  );
};
