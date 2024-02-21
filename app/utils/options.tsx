import { usePathname } from "next/navigation";
import Link from "next/link";

const optionLinks = [
  {
    route: "/joins/datacube",
    label: "Datacube",
  },
  {
    route: "/joins/file",
    label: "File",
  },
  {
    route: "/filejoin",
    label: "Filejoin",
  },
];

const Options = () => {
  const pathname = usePathname();
  return (
    <div className="flex flex-row gap-4 mt-7">
      {optionLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link
            key="1"
            href={link.route}
            className={`flex justify-start rounded-lg py-2 px-4 ${
              isActive
                ? "bg-red-700 hover:bg-red-800"
                : "bg-blue-700 hover:bg-blue-800"
            } `}
          >
            <p className="text-white">{link.label}</p>
          </Link>
        );
      })}
    </div>
  );
};
export default Options;
