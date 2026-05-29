/**
 * 知客 KnowClient — 首页重定向
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/today");
}
