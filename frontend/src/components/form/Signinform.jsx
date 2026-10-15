import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signinSchema } from "@/schemas/signin_schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { useDispatch } from "react-redux";
import { setLogin } from "@/state/state";

export const Signinform = () => {
  const navigate = useNavigate();

  const [pending, setPending] = useState(false);

  const dispatch = useDispatch();

  // Access the mode state from the Redux store
  const signinForm = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const onSubmitSignin = async (data) => {
    setPending(true);
    console.log("submitted", data);
    const body = {
      userName: data.userName,
      password: data.password,
    };

    try {
      const res = await api.post("/auth/signin", body);
      const user = {
        userName: res.data.userName,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email,
        contactNumber: res.data.contactNumber,
        dob: res.data.dob,
        country: res.data.country,
        token: res.data.accessToken,
      };
      const token = res.data.accessToken;
      // Dispatch the setLogin action to update the user state
      dispatch(setLogin({ user, token }));
      // Redirect to the home page
      navigate("/home");
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Card>
        <Form {...signinForm}>
          <form
            onSubmit={signinForm.handleSubmit(onSubmitSignin)}
            className="space-y-8"
          >
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your username and password to login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <FormField
                  control={signinForm.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="username..."
                          {...field}
                          autoComplete="username"
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signinForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="password..."
                          {...field}
                          type="password"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={pending}>
                {pending ? "Signing in..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};
