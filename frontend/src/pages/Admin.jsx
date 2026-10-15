import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const localUser = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
        
        if (res.data.role === "Admin") {
          fetchUsers();
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/user/list-users`;
        const headers = {
          "Content-Type": "application/json",
          "x-access-token": localUser.token,
        };
        const res = await axios.get(url, { headers });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (localUser?.token) {
      fetchUserRole();
    }
  }, [localUser?.token]);

  const handleRoleChange = async (userName, newRole) => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/user/change-role`;
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": localUser.token,
      };
      const body = { userName, newRole };
      
      await axios.post(url, body, { headers });
      
      setUsers(users.map(user => 
        user.userName === userName ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Success",
        description: `Role updated to ${newRole} for ${userName}`,
      });
    } catch (err) {
      console.error("Error updating role:", err);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (userRole !== "Admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You must be an admin to access this page.</p>
        <Button onClick={() => navigate("/home")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate("/home")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userName}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>@{user.userName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.membership === "Premium" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.membership}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "Admin" 
                          ? "bg-red-100 text-red-800"
                          : user.role === "Moderator"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.userName, value)}
                        disabled={user.userName === localUser.userName}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Moderator">Moderator</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
