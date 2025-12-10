import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Check if coach already exists
    const { data: existingCoach } = await supabase
      .from("coaches")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (existingCoach) {
      return NextResponse.json({ coach: existingCoach });
    }

    // Create new coach profile
    const { data: coach, error } = await supabase
      .from("coaches")
      .insert({
        clerk_user_id: userId,
        email: "", // Will be updated from Clerk if available
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ coach });
  } catch (error) {
    console.error("Error initializing coach:", error);
    return NextResponse.json(
      { error: "Failed to initialize coach profile" },
      { status: 500 }
    );
  }
}
