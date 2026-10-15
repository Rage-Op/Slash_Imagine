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
import axios from "axios";

export function Menu({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const localUser = useSelector((state) => state.user);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/user/get-user`;
        const headers = {
          "Content-Type": "application/json",
          "x-access-token": localUser.token,
        };
        const res = await axios.post(url, {}, { headers });
        setUserRole(res.data.role);
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };
    if (localUser?.token) fetchUserRole();
  }, [localUser?.token]);

  const handleLogOut = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith("/")) {
        return `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${user.avatar}`;
      }
      return user.avatar;
    }
    return null;
  };

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
            <div>{`${user?.firstName || ''} ${user?.lastName || ''}`}</div>
            <Avatar>
              <AvatarImage src={getAvatarUrl()} />
              <AvatarFallback>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </AvatarFallback>
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
          {userRole === "Admin" && (
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
