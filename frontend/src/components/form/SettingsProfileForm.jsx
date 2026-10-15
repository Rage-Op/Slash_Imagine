import React, { useState, useEffect } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, ChevronsUpDown, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { setLogin } from "@/state/state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
  "Denmark", "Egypt", "Finland", "France", "Germany", "Greece", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Kenya",
  "Malaysia", "Mexico", "Morocco", "Nepal", "Netherlands", "New Zealand",
  "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
  "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain",
  "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Vietnam"
].map(c => ({ label: c, value: c }));

const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  country: z.string().optional(),
});

export function SettingsProfileForm() {
  const localUser = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
    },
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
        form.reset({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          country: res.data.country || "",
        });
        if (res.data.avatar) {
          const avatarUrl = res.data.avatar.startsWith("/")
            ? `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${res.data.avatar}`
            : res.data.avatar;
          setAvatarPreview(avatarUrl);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (localUser?.token) fetchUser();
  }, [localUser?.token]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatar) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatar);
      
      const url = `${import.meta.env.VITE_BASE_URL}/user/change-avatar`;
      const headers = { "x-access-token": localUser.token };
      
      const res = await axios.post(url, formData, { headers });
      toast({ title: "Success", description: "Avatar updated successfully" });
      setAvatar(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to upload avatar", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": localUser.token,
      };

      // Update name
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/change-name`,
        {
          newFirstName: data.firstName,
          newLastName: data.lastName,
          password: prompt("Enter your password to confirm changes:"),
        },
        { headers }
      );

      // Update country if changed
      if (data.country) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/change-country`,
          { newCountry: data.country },
          { headers }
        );
      }

      // Update local state
      dispatch(setLogin({
        user: { ...localUser, firstName: data.firstName, lastName: data.lastName, country: data.country },
        token: localUser.token,
      }));

      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarPreview} />
          <AvatarFallback className="text-2xl">
            {localUser?.firstName?.charAt(0)}{localUser?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <Button type="button" variant="outline" asChild>
              <span><Upload className="mr-2 h-4 w-4" />Choose Image</span>
            </Button>
          </label>
          {avatar && (
            <Button onClick={uploadAvatar} disabled={isUploadingAvatar} size="sm">
              {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Country</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Select country"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country) => (
                            <CommandItem
                              key={country.value}
                              value={country.label}
                              onSelect={() => form.setValue("country", country.value)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  country.value === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {country.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
