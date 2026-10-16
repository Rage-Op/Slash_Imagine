import { Separator } from "@/components/ui/separator";
import SidebarNav from "./../components/settingsComponents/settingsSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "Account",
    href: "/settings/account",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
  },
  {
    title: "Display",
    href: "/settings/display",
  },
];

export const SettingsPage = ({ children }) => {
  return (
    <>
      <Link to="/home">
        <div>
          <Button
            variant="ghost"
            className="absolute top-1 right-8 rounded-full px-2"
          >
            <X />
          </Button>
        </div>
      </Link>
      <div className="space-y-6 p-10 pb-16 md:block px-[7%]">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="h-[70vh] w-full">
            <ScrollArea className="h-full grow w-full">
              <div className="flex-1 lg:max-w-2xl mb-56 mx-2">{children}</div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
};
