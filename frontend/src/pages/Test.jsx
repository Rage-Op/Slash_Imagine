import React from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

export const Test = () => {
  const localUser = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get("avatar");
    console.log(file);

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/user/change-avatar`;
      const body = new FormData();
      body.append("avatar", document.getElementById("picture").files[0]);
      body.append("newAvatar", "https://picsum.photos/200");
      console.log(body);

      const headers = {
        "Content-Type": "multipart/form-data",
        "x-access-token": `${localUser.token}`,
      };

      const res = await axios.post(url, body, { headers });
      console.log(res.data);
    } catch (err) {
      console.error(
        "Error uploading avatar:",
        err.response ? err.response.data : err.message
      );
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      {/* create a form which recieves an image and a button to submit */}
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Picture</Label>
          <Input id="picture" name="avatar" type="file" accept="image/*" />{" "}
          <Button type="submit">Upload</Button>
        </div>
      </form>
    </div>
  );
};
