import Footer from "@/components/ui/layout/Footer";
import Navbar from "@/components/ui/layout/navbar";
import React from "react";

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <>
  <Navbar></Navbar>
  {children}
  <Footer></Footer>
  </>)
}