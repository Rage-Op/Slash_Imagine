import React, { useState, useEffect } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, ChevronsUpDown, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { setLogin, setLogout } from "@/state/state";
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
  currentPassword: z.string().optional(),
});

export function SettingsProfileForm() {
  const localUser = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState({ firstName: "", lastName: "", country: "" });
  
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      currentPassword: "",
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
        const userData = {
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          country: res.data.country || "",
        };
        form.reset({ ...userData, currentPassword: "" });
        setOriginalData(userData);
        if (res.data.avatar) {
          const avatarUrl = res.data.avatar.startsWith("/")
            ? `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${res.data.avatar}`
            : res.data.avatar;
          setAvatarPreview(avatarUrl);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        if (err.response?.status === 401) {
          dispatch(setLogout());
          navigate("/login");
        }
      }
    };
    if (localUser?.token) fetchUser();
  }, [localUser?.token, dispatch, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const nameChanged = data.firstName !== originalData.firstName || data.lastName !== originalData.lastName;
    const countryChanged = data.country && data.country !== originalData.country;
    
    if (nameChanged && !data.currentPassword) {
      form.setError("currentPassword", { message: "Password required to change name" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": localUser.token,
      };

      // Upload avatar if selected
      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/change-avatar`,
          formData,
          { headers: { "x-access-token": localUser.token } }
        );
      }

      // Update name if changed (requires password)
      if (nameChanged) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/auth/change-name`,
          {
            newFirstName: data.firstName,
            newLastName: data.lastName,
            password: data.currentPassword,
          },
          { headers }
        );
      }

      // Update country if changed (no password required)
      if (countryChanged) {
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

      setAvatar(null);
      setOriginalData({ firstName: data.firstName, lastName: data.lastName, country: data.country });
      form.setValue("currentPassword", "");
      
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.status === 401) {
        dispatch(setLogout());
        navigate("/login");
        return;
      }
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="text-2xl">{initials || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" asChild>
                  <span><Upload className="mr-2 h-4 w-4" />{avatar ? "Change Image" : "Choose Image"}</span>
                </Button>
              </label>
              {avatar && (
                <p className="text-sm text-muted-foreground">
                  {avatar.name} selected
                </p>
              )}
            </div>
          </div>

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

          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Required only to change name" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
