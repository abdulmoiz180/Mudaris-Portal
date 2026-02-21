import ToastContainer from "@/components/toast/ToastContainer";
import React from "react";
import { Outlet } from "react-router-dom";

const ThemeLayout = () => {
  return (
    <section className="md:min-h-[80dvh] lg:h-screen w-full relative">
      <div className="relative z-10">
        <Outlet />
      </div>
      <ToastContainer />
    </section>
  );
};

export default ThemeLayout;
