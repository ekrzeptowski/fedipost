"use client";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {useRouter} from "next/navigation";

export default function App(){
    const router = useRouter();
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    if (typeof window !== 'undefined' && !accessToken) {
        router.replace("/auth");
    }
}