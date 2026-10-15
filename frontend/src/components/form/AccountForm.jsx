import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import axios from "axios";
import { Separator } from "@/components/ui/separator";

const passwordSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const emailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const phoneSchema = z.object({
  newContactNumber: z.string().min(10, "Invalid phone number"),
  password: z.string().min(1, "Password is required"),
});

const dobSchema = z.object({
  newDob: z.date({ required_error: "Date of birth is required" }),
  password: z.string().min(1, "Password is required"),
});

export const AccountForm = () => {
  const localUser = useSelector((state) => state.user);
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState({});

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: "", password: "" },
  });

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { newContactNumber: "", password: "" },
  });

  const dobForm = useForm({
    resolver: zodResolver(dobSchema),
    defaultValues: { newDob: undefined, password: "" },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/user/get-user`;
        const headers = {
          "Content-Type": "application/json",
          "x-access-token": localUser.token,
        };
        const res = await axios.post(url, {}, { headers });
        setUserInfo(res.data);
        emailForm.setValue("newEmail", res.data.email || "");
        phoneForm.setValue("newContactNumber", res.data.contactNumber || "");
        if (res.data.dob) {
          dobForm.setValue("newDob", new Date(res.data.dob));
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (localUser?.token) fetchUser();
  }, [localUser?.token]);

  const headers = {
    "Content-Type": "application/json",
    "x-access-token": localUser.token,
  };

  const onPasswordSubmit = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/change-password`,
        { password: data.currentPassword, newPassword: data.newPassword },
        { headers }
      );
      toast({ title: "Success", description: "Password updated successfully" });
      passwordForm.reset();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const onEmailSubmit = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/change-email`,
        { newEmail: data.newEmail, password: data.password },
        { headers }
      );
      toast({ title: "Success", description: "Email updated successfully" });
      emailForm.setValue("password", "");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const onPhoneSubmit = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/change-contact-number`,
        { newContactNumber: data.newContactNumber, password: data.password },
        { headers }
      );
      toast({ title: "Success", description: "Phone number updated successfully" });
      phoneForm.setValue("password", "");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update phone",
        variant: "destructive",
      });
    }
  };

  const onDobSubmit = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/change-dob`,
        { newDob: format(data.newDob, "yyyy-MM-dd"), password: data.password },
        { headers }
      );
      toast({ title: "Success", description: "Date of birth updated successfully" });
      dobForm.setValue("password", "");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update date of birth",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Change Password</h3>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 mt-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Password</Button>
          </form>
        </Form>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Change Email</h3>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 mt-4">
            <FormField
              control={emailForm.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={emailForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Email</Button>
          </form>
        </Form>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Change Phone Number</h3>
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4 mt-4">
            <FormField
              control={phoneForm.control}
              name="newContactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Phone Number</FormLabel>
                  <FormControl><Input type="tel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={phoneForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Phone</Button>
          </form>
        </Form>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Change Date of Birth</h3>
        <Form {...dobForm}>
          <form onSubmit={dobForm.handleSubmit(onDobSubmit)} className="space-y-4 mt-4">
            <FormField
              control={dobForm.control}
              name="newDob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={dobForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Date of Birth</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
