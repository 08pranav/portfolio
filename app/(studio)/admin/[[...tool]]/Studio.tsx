"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import TabTitle from "./TabTitle";

export default function Studio({ title }: { title: string }) {
  return (
    <>
      <TabTitle title={title} />
      <NextStudio config={config} />
    </>
  );
}
