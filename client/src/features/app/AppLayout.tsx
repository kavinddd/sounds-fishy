import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router";

function AppLayout() {
  return (
    <>
      <div className="mx-auto grid h-screen w-full grid-rows-[auto,1fr,auto] border-[1px] border-solid border-gray-400 sm:w-11/12 md:w-1/2 lg:w-1/4">
        <h1 className="bg-sky-500 p-2 text-center text-3xl font-bold text-gray-200">
          Sounds Fishy
        </h1>
        <main className="bg-gray-100 p-2">
          <Outlet />
        </main>

        <footer className="bg-sky-500">
          <p className="px-3 text-right text-gray-200">
            Made by{" "}
            <a
              href="https://github.com/kavinddd"
              target="_blank"
              className="hover:font-bold"
            >
              kavinddd
            </a>
          </p>
          <Toaster />
        </footer>
      </div>
    </>
  );
}
export default AppLayout;
