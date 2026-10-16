import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User, LogOut, Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "@/state/state";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

export function Menu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const localUser = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.post("/user/get-user", {});
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    if (localUser?.token) fetchUserData();
  }, [localUser?.token]);

  const handleLogOut = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  const getAvatarUrl = () => {
    const avatar = userData?.avatar || localUser?.avatar;
    if (avatar) {
      if (avatar.startsWith("/")) {
        return `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${avatar}`;
      }
      return avatar;
    }
    return null;
  };

  const firstName = userData?.firstName || localUser?.firstName || "";
  const lastName = userData?.lastName || localUser?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <Menubar className="rounded-none border-b justify-start border-none px-2 lg:px-4">
      <MenubarMenu>
        <MenubarTrigger className="font-bold text-orange-600 text-2xl rounded-lg cursor-pointer">
          <span className="font-extrabold text-black">/&nbsp;</span>Imagine
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About /Imagine</MenubarItem>
          <MenubarSeparator />
          <Link to="/settings/profile">
            <MenubarItem>Profile</MenubarItem>
          </Link>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu className="!ml-auto">
        <MenubarTrigger className="cursor-pointer">
          <div className="flex justify-between items-center gap-4">
            <div>{fullName || localUser?.userName}</div>
            <Avatar>
              <AvatarImage src={getAvatarUrl()} />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </MenubarTrigger>
        <MenubarContent>
          <Link to="/settings/account">
            <MenubarItem>
              <User className="h-4 w-4 mr-2" />
              Account
            </MenubarItem>
          </Link>
          <Link to="/settings/profile">
            <MenubarItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </MenubarItem>
          </Link>
          {userData?.role === "Admin" && (
            <>
              <MenubarSeparator />
              <Link to="/admin">
                <MenubarItem>
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </MenubarItem>
              </Link>
            </>
          )}
          <MenubarSeparator />
          <MenubarItem
            className="text-destructive font-semibold cursor-pointer"
            onClick={handleLogOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
