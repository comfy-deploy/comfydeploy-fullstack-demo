"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { mutate } from "swr";

export function HandleSignout() {
	const { userId } = useAuth();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		console.log("Clearing cache");

		mutate(/* match all keys */ () => true, undefined, false);
	}, [userId]);

	return <></>;
}
