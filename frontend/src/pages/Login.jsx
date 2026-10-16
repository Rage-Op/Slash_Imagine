import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Signinform } from "@/components/form/Signinform";
import { Signupform } from "@/components/form/Signupform";
import TrailingImage from "@/components/animata/image/trailing-image";
import Dot from "@/components/animata/background/dot";
export const Login = () => {
  return (
    <>
      <main className="flex flex-row justify-strech items-center overflow-hidden">
        <div className="left h-[100vh] w-full p-2">
          <div className="wrapper h-full rounded-lg bg-login-poster bg-cover bg-center bg-no-repeat">
            <Dot>
              <img
                src="./undraw_bulb.svg"
                alt="undraw bulb"
                className="absolute bottom-1 left-1 h-[40vw]  transform scale-x-[-1] ml-1 mb-1"
              />
              <TrailingImage></TrailingImage>
            </Dot>
          </div>
        </div>
        <div className="right h-[100vh] w-full flex flex-col justify-center gap-8  items-center">
          <div className="right-top">
            <h1 className="roboto-mono-900 scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
              /
              <span className="text-[hsl(24.6,95%,53.1%)] roboto-mono-900">
                Imagine
              </span>
            </h1>
          </div>
          <div className="right-mid">
            <Tabs defaultValue="signin" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <Signinform />
              </TabsContent>
              <TabsContent value="signup">
                <Signupform />
              </TabsContent>
            </Tabs>
          </div>
          <div className="right-bottom flex flex-col justify-center items-center ">
            <p className="text-sm text-muted-foreground">
              A place for people to share their wishes and imaginations.
            </p>
            <p className="text-sm text-muted-foreground">
              Created by Pravin Maurya.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};
