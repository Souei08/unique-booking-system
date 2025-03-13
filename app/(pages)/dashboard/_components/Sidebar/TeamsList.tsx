import type { Team } from "../shared/types";

interface TeamsListProps {
  teams: Team[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const TeamsList = ({ teams }: TeamsListProps) => {
  return (
    <div className="mt-8">
      <h3 className="px-3 text-sm font-medium text-gray-500">Teams</h3>
      <div className="mt-1 space-y-1">
        {teams.map((team) => (
          <a
            key={team.name}
            href={team.href}
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <span
              aria-hidden="true"
              className={classNames(
                team.bgColorClass,
                "mr-4 size-2.5 rounded-full"
              )}
            />
            <span className="truncate">{team.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
