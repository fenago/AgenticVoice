import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import User from "@/models/User";
import connectMongo from "@/libs/mongoose";
import config from "@/config";

export async function GET() {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to access this endpoint" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get the subscription plan name from the config based on priceId
    let planName = "Free Plan";
    if (user.priceId) {
      const plan = config.stripe.plans.find(plan => plan.priceId === user.priceId);
      if (plan) {
        planName = plan.name;
      }
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role || "FREE",
        hasAccess: user.hasAccess,
        customerId: user.customerId,
        priceId: user.priceId,
        planName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the user profile" },
      { status: 500 }
    );
  }
}
